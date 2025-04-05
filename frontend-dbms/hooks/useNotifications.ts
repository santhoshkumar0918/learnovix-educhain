"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/supabase";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export const useNotifications = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  const loadNotifications = async (limit = 20) => {
    if (!user) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      setNotifications(data || []);

      // Update unread count
      const unread = data?.filter((n) => !n.is_read).length || 0;
      setUnreadCount(unread);

      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return false;

    try {
      // Update the notification
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return false;

    try {
      // Update all notifications
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      return true;
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false;
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return false;

    try {
      // Delete the notification
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      const deleted = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if necessary
      if (deleted && !deleted.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.error("Error deleting notification:", err);
      return false;
    }
  };

  // Set up real-time notifications
  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Add the new notification to the list
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // Initial load
    loadNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
