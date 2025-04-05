"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

type Community = Database["public"]["Tables"]["communities"]["Row"];

export const useCommunities = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all communities
  const getCommunities = async (filter?: {
    category?: string;
    search?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from("communities").select(`
          *,
          profiles:created_by (username, avatar_url)
        `);

      if (filter?.category) {
        query = query.eq("category", filter.category);
      }

      if (filter?.search) {
        query = query.or(
          `name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
        );
      }

      const { data, error } = await query.order("members_count", {
        ascending: false,
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get community by ID
  const getCommunityById = async (communityId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("communities")
        .select(
          `
          *,
          profiles:created_by (username, avatar_url)
        `
        )
        .eq("id", communityId)
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

  // Create a community
  const createCommunity = async (communityData: {
    name: string;
    description: string;
    category?: string;
    image_url?: string;
    is_private?: boolean;
  }) => {
    if (!user) {
      setError("You must be logged in to create a community");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create the community
      const communityId = uuidv4();
      const { error: communityError } = await supabase
        .from("communities")
        .insert({
          id: communityId,
          name: communityData.name,
          description: communityData.description,
          created_by: user.id,
          image_url: communityData.image_url || null,
          category: communityData.category || null,
          is_private: communityData.is_private || false,
          members_count: 1, // Creator is the first member
        });

      if (communityError) throw communityError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          id: uuidv4(),
          community_id: communityId,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      return communityId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's communities
  const getUserCommunities = async () => {
    if (!user) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("community_members")
        .select(
          `
          *,
          communities:community_id (*)
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      // Transform to return just the communities
      return data.map((item) => ({
        ...item.communities,
        role: item.role,
      }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Join a community
  const joinCommunity = async (communityId: string) => {
    if (!user) {
      setError("You must be logged in to join a community");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingMember) {
        setError("You are already a member of this community");
        return false;
      }

      // Add as member
      const { error: joinError } = await supabase
        .from("community_members")
        .insert({
          id: uuidv4(),
          community_id: communityId,
          user_id: user.id,
          role: "member",
        });

      if (joinError) throw joinError;

      // Increment member count
      const { error: updateError } = await supabase.rpc(
        "increment_community_members",
        {
          community_id: communityId,
        }
      );

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave a community
  const leaveCommunity = async (communityId: string) => {
    if (!user) {
      setError("You must be logged in to leave a community");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user is the creator
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .select("created_by")
        .eq("id", communityId)
        .single();

      if (communityError) throw communityError;

      if (community.created_by === user.id) {
        setError(
          "As the creator, you cannot leave the community. Transfer ownership first."
        );
        return false;
      }

      // Remove membership
      const { error: leaveError } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (leaveError) throw leaveError;

      // Decrement member count
      const { error: updateError } = await supabase.rpc(
        "decrement_community_members",
        {
          community_id: communityId,
        }
      );

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get community members
  const getCommunityMembers = async (communityId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("community_members")
        .select(
          `
          *,
          profiles:user_id (id, username, avatar_url, bio)
        `
        )
        .eq("community_id", communityId);

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is a member of a community
  const isCommunityMember = async (communityId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error("Error checking community membership:", err);
      return false;
    }
  };

  // Get user's role in a community
  const getUserCommunityRole = async (communityId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role || null;
    } catch (err) {
      console.error("Error getting user community role:", err);
      return null;
    }
  };

  // Update community
  const updateCommunity = async (
    communityId: string,
    updateData: {
      name?: string;
      description?: string;
      category?: string;
      image_url?: string;
      is_private?: boolean;
    }
  ) => {
    if (!user) {
      setError("You must be logged in to update a community");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user has permission (admin or creator)
      const { data: membership, error: memberError } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single();

      if (memberError) throw memberError;

      if (
        !membership ||
        (membership.role !== "admin" && membership.role !== "moderator")
      ) {
        setError("You do not have permission to update this community");
        return false;
      }

      // Update the community
      const { error } = await supabase
        .from("communities")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", communityId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update member role
  const updateMemberRole = async (
    communityId: string,
    memberId: string,
    newRole: "member" | "moderator" | "admin"
  ) => {
    if (!user) {
      setError("You must be logged in to update member roles");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user is an admin
      const { data: userRole, error: roleError } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single();

      if (roleError) throw roleError;

      if (userRole.role !== "admin") {
        setError("Only admins can update member roles");
        return false;
      }

      // Update the member's role
      const { error } = await supabase
        .from("community_members")
        .update({ role: newRole })
        .eq("community_id", communityId)
        .eq("user_id", memberId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove member from community
  const removeMember = async (communityId: string, memberId: string) => {
    if (!user) {
      setError("You must be logged in to remove members");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user is an admin or moderator
      const { data: userRole, error: roleError } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single();

      if (roleError) throw roleError;

      if (userRole.role !== "admin" && userRole.role !== "moderator") {
        setError("You do not have permission to remove members");
        return false;
      }

      // Check if the target is not an admin (moderators cannot remove admins)
      if (userRole.role === "moderator") {
        const { data: targetRole, error: targetError } = await supabase
          .from("community_members")
          .select("role")
          .eq("community_id", communityId)
          .eq("user_id", memberId)
          .single();

        if (targetError) throw targetError;

        if (targetRole.role === "admin") {
          setError("Moderators cannot remove admins");
          return false;
        }
      }

      // Remove the member
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", memberId);

      if (error) throw error;

      // Decrement member count
      const { error: updateError } = await supabase.rpc(
        "decrement_community_members",
        {
          community_id: communityId,
        }
      );

      if (updateError) throw updateError;

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
    getCommunities,
    getCommunityById,
    createCommunity,
    getUserCommunities,
    joinCommunity,
    leaveCommunity,
    getCommunityMembers,
    isCommunityMember,
    getUserCommunityRole,
    updateCommunity,
    updateMemberRole,
    removeMember,
  };
};
