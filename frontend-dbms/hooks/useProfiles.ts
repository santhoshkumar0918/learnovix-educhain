"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useProfiles = () => {
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get profile by ID
  const getProfileById = async (profileId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData: {
    username?: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    skills?: string[];
  }) => {
    if (!user) {
      setError("You must be logged in to update your profile");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Refresh the profile in auth context
      await refreshProfile();

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Search profiles
  const searchProfiles = async (
    query: string,
    filter?: {
      skills?: string[];
      location?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let dbQuery = supabase.from("profiles").select("*");

      if (query) {
        dbQuery = dbQuery.or(`username.ilike.%${query}%,bio.ilike.%${query}%`);
      }

      if (filter?.skills && filter.skills.length > 0) {
        // For each skill, add it to the filter
        filter.skills.forEach((skill) => {
          dbQuery = dbQuery.contains("skills", [skill]);
        });
      }

      if (filter?.location) {
        dbQuery = dbQuery.ilike("location", `%${filter.location}%`);
      }

      const { data, error } = await dbQuery.limit(50);

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get connections
  const getConnections = async (userId?: string) => {
    const id = userId || user?.id;

    if (!id) {
      setError("User ID is required");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get accepted connections where user is either the requester or the receiver
      const { data, error } = await supabase
        .from("user_connections")
        .select(
          `
          *,
          connection_profile:connection_id (id, username, avatar_url, bio, location, skills),
          user_profile:user_id (id, username, avatar_url, bio, location, skills)
        `
        )
        .or(`user_id.eq.${id},connection_id.eq.${id}`)
        .eq("status", "accepted");

      if (error) throw error;

      // Transform the data to get the profile of the other user in each connection
      return data.map((connection) => {
        if (connection.user_id === id) {
          return {
            ...connection,
            profile: connection.connection_profile,
          };
        } else {
          return {
            ...connection,
            profile: connection.user_profile,
          };
        }
      });
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get connection requests
  const getConnectionRequests = async () => {
    if (!user) {
      setError("You must be logged in to view connection requests");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("user_connections")
        .select(
          `
          *,
          user_profile:user_id (id, username, avatar_url, bio)
        `
        )
        .eq("connection_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Send connection request
  const sendConnectionRequest = async (connectionId: string) => {
    if (!user) {
      setError("You must be logged in to send a connection request");
      return false;
    }

    if (user.id === connectionId) {
      setError("You cannot connect with yourself");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if connection already exists
      const { data: existing, error: checkError } = await supabase
        .from("user_connections")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},connection_id.eq.${connectionId}),and(user_id.eq.${connectionId},connection_id.eq.${user.id})`
        )
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setError("Connection request already exists");
        return false;
      }

      // Create connection request
      const { error } = await supabase.from("user_connections").insert({
        id: uuidv4(),
        user_id: user.id,
        connection_id: connectionId,
        status: "pending",
      });

      if (error) throw error;

      // Create notification for the recipient
      await supabase.from("notifications").insert({
        id: uuidv4(),
        user_id: connectionId,
        content: "You have a new connection request",
        type: "connection",
        reference_id: user.id,
        reference_type: "user",
        is_read: false,
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Accept connection request
  const acceptConnectionRequest = async (requestId: string) => {
    if (!user) {
      setError("You must be logged in to accept a connection request");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: request, error: getError } = await supabase
        .from("user_connections")
        .select("*")
        .eq("id", requestId)
        .eq("connection_id", user.id)
        .eq("status", "pending")
        .single();

      if (getError) throw getError;

      if (!request) {
        setError("Connection request not found");
        return false;
      }

      // Update connection status
      const { error } = await supabase
        .from("user_connections")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      // Create notification for the requester
      await supabase.from("notifications").insert({
        id: uuidv4(),
        user_id: request.user_id,
        content: "Your connection request was accepted",
        type: "connection",
        reference_id: user.id,
        reference_type: "user",
        is_read: false,
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reject connection request
  const rejectConnectionRequest = async (requestId: string) => {
    if (!user) {
      setError("You must be logged in to reject a connection request");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update connection status
      const { error } = await supabase
        .from("user_connections")
        .update({ status: "rejected" })
        .eq("id", requestId)
        .eq("connection_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove connection
  const removeConnection = async (connectionId: string) => {
    if (!user) {
      setError("You must be logged in to remove a connection");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("user_connections")
        .delete()
        .or(
          `and(user_id.eq.${user.id},connection_id.eq.${connectionId}),and(user_id.eq.${connectionId},connection_id.eq.${user.id})`
        )
        .eq("status", "accepted");

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getProfileById,
    updateProfile,
    searchProfiles,
    getConnections,
    getConnectionRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
  };
};
