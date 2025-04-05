"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];

export const usePosts = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get feed posts
  const getFeedPosts = async (filter?: {
    tab?: "all" | "following" | "trending";
    tag?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (username, avatar_url)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filter?.tab === "trending") {
        query = query.order("likes_count", { ascending: false }).limit(20);
      } else if (filter?.tab === "following" && user) {
        // Get posts from users the current user follows
        const { data: connections } = await supabase
          .from("user_connections")
          .select("connection_id")
          .eq("user_id", user.id)
          .eq("status", "accepted");

        if (connections && connections.length > 0) {
          const followingIds = connections.map((c) => c.connection_id);
          query = query.in("user_id", followingIds);
        } else {
          // If not following anyone, return empty array
          return [];
        }
      }

      if (filter?.tag) {
        query = query.contains("tags", [filter.tag]);
      }

      // Limit to recent posts
      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get community posts
  const getCommunityPosts = async (communityId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select(
          `
          *,
          posts:post_id (
            *,
            profiles:user_id (username, avatar_url)
          )
        `
        )
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to extract the post objects
      return data.map((item) => item.posts);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get post by ID
  const getPostById = async (postId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (username, avatar_url)
        `
        )
        .eq("id", postId)
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

  // Create a new post
  const createPost = async (postData: {
    content: string;
    title?: string;
    image_url?: string;
    tags?: string[];
    communityId?: string;
  }) => {
    if (!user) {
      setError("You must be logged in to create a post");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create the post
      const postId = uuidv4();
      const { error: postError } = await supabase.from("posts").insert({
        id: postId,
        user_id: user.id,
        content: postData.content,
        title: postData.title || null,
        image_url: postData.image_url || null,
        tags: postData.tags || [],
        likes_count: 0,
        comments_count: 0,
        is_pinned: false,
      });

      if (postError) throw postError;

      // If posting to a community, create the community post link
      if (postData.communityId) {
        const { error: communityPostError } = await supabase
          .from("community_posts")
          .insert({
            id: uuidv4(),
            community_id: postData.communityId,
            post_id: postId,
          });

        if (communityPostError) throw communityPostError;
      }

      return postId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Like a post
  const likePost = async (postId: string) => {
    if (!user) {
      setError("You must be logged in to like a post");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if already liked
      const { data: existing, error: checkError } = await supabase
        .from("post_likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existing.id);

        if (unlikeError) throw unlikeError;

        // Decrement like count
        const { error: updateError } = await supabase.rpc(
          "decrement_post_likes",
          {
            post_id: postId,
          }
        );

        if (updateError) throw updateError;

        return false; // Returned false means "unliked"
      } else {
        // Like the post
        const { error: likeError } = await supabase.from("post_likes").insert({
          id: uuidv4(),
          user_id: user.id,
          post_id: postId,
        });

        if (likeError) throw likeError;

        // Increment like count
        const { error: updateError } = await supabase.rpc(
          "increment_post_likes",
          {
            post_id: postId,
          }
        );

        if (updateError) throw updateError;

        // Create notification for post owner (except if liking own post)
        const { data: postData } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        if (postData && postData.user_id !== user.id) {
          await supabase.from("notifications").insert({
            id: uuidv4(),
            user_id: postData.user_id,
            content: "Someone liked your post",
            type: "post_like",
            reference_id: postId,
            reference_type: "post",
            is_read: false,
          });
        }

        return true; // Returned true means "liked"
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has liked a post
  const hasLikedPost = async (postId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("post_likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error("Error checking if post is liked:", err);
      return false;
    }
  };

  // Get comments for a post
  const getPostComments = async (postId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select(
          `
          *,
          profiles:user_id (username, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Add a comment to a post
  const addComment = async (postId: string, content: string) => {
    if (!user) {
      setError("You must be logged in to comment");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create the comment
      const commentId = uuidv4();
      const { error: commentError } = await supabase
        .from("post_comments")
        .insert({
          id: commentId,
          post_id: postId,
          user_id: user.id,
          content,
        });

      if (commentError) throw commentError;

      // Increment comment count
      const { error: updateError } = await supabase.rpc(
        "increment_post_comments",
        {
          post_id: postId,
        }
      );

      if (updateError) throw updateError;

      // Create notification for post owner (except if commenting on own post)
      const { data: postData } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (postData && postData.user_id !== user.id) {
        await supabase.from("notifications").insert({
          id: uuidv4(),
          user_id: postData.user_id,
          content: "Someone commented on your post",
          type: "comment",
          reference_id: postId,
          reference_type: "post",
          is_read: false,
        });
      }

      return commentId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getFeedPosts,
    getCommunityPosts,
    getPostById,
    createPost,
    likePost,
    hasLikedPost,
    getPostComments,
    addComment,
  };
};
