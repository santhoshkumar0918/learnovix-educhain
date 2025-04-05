export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          bio: string | null;
          reputation: number;
          created_at: string;
          avatar_url: string | null;
          location: string | null;
          skills: string[] | null;
        };
        Insert: {
          id: string;
          username: string;
          bio?: string | null;
          reputation?: number;
          created_at?: string;
          avatar_url?: string | null;
          location?: string | null;
          skills?: string[] | null;
        };
        Update: {
          id?: string;
          username?: string;
          bio?: string | null;
          reputation?: number;
          created_at?: string;
          avatar_url?: string | null;
          location?: string | null;
          skills?: string[] | null;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructor_id: string;
          level: string;
          category: string;
          duration: string;
          created_at: string;
          updated_at: string;
          image_url: string | null;
          price: number | null;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          instructor_id: string;
          level: string;
          category: string;
          duration: string;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
          price?: number | null;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          instructor_id?: string;
          level?: string;
          category?: string;
          duration?: string;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
          price?: number | null;
          is_published?: boolean;
        };
      };
      course_sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order?: number;
          created_at?: string;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          description: string | null;
          content: string | null;
          order: number;
          created_at: string;
          video_url: string | null;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          description?: string | null;
          content?: string | null;
          order: number;
          created_at?: string;
          video_url?: string | null;
        };
        Update: {
          id?: string;
          section_id?: string;
          title?: string;
          description?: string | null;
          content?: string | null;
          order?: number;
          created_at?: string;
          video_url?: string | null;
        };
      };
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          progress: number;
          last_accessed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          progress?: number;
          last_accessed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          progress?: number;
          last_accessed_at?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
          image_url: string | null;
          likes_count: number;
          comments_count: number;
          title: string | null;
          is_pinned: boolean;
          tags: string[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          created_at?: string;
          image_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          title?: string | null;
          is_pinned?: boolean;
          tags?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          image_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          title?: string | null;
          is_pinned?: boolean;
          tags?: string[] | null;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      user_connections: {
        Row: {
          id: string;
          user_id: string;
          connection_id: string;
          created_at: string;
          status: "pending" | "accepted" | "rejected";
        };
        Insert: {
          id?: string;
          user_id: string;
          connection_id: string;
          created_at?: string;
          status?: "pending" | "accepted" | "rejected";
        };
        Update: {
          id?: string;
          user_id?: string;
          connection_id?: string;
          created_at?: string;
          status?: "pending" | "accepted" | "rejected";
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_by: string;
          created_at: string;
          image_url: string | null;
          members_count: number;
          category: string | null;
          is_private: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_by: string;
          created_at?: string;
          image_url?: string | null;
          members_count?: number;
          category?: string | null;
          is_private?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_by?: string;
          created_at?: string;
          image_url?: string | null;
          members_count?: number;
          category?: string | null;
          is_private?: boolean;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          joined_at: string;
          role: "member" | "moderator" | "admin";
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          joined_at?: string;
          role?: "member" | "moderator" | "admin";
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          joined_at?: string;
          role?: "member" | "moderator" | "admin";
        };
      };
      community_posts: {
        Row: {
          id: string;
          community_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type:
            | "post_like"
            | "comment"
            | "connection"
            | "course"
            | "community"
            | "system";
          created_at: string;
          is_read: boolean;
          reference_id: string | null;
          reference_type: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type:
            | "post_like"
            | "comment"
            | "connection"
            | "course"
            | "community"
            | "system";
          created_at?: string;
          is_read?: boolean;
          reference_id?: string | null;
          reference_type?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          type?:
            | "post_like"
            | "comment"
            | "connection"
            | "course"
            | "community"
            | "system";
          created_at?: string;
          is_read?: boolean;
          reference_id?: string | null;
          reference_type?: string | null;
        };
      };
    };
    Views: {
      // Add views here if you have any
    };
    Functions: {
      // Add functions here if you have any
    };
    Enums: {
      // Add enums here if you have any
    };
  };
}
