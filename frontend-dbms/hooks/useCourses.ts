"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type CourseSection = Database["public"]["Tables"]["course_sections"]["Row"];
type CourseLesson = Database["public"]["Tables"]["course_lessons"]["Row"];

export const useCourses = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all courses
  const getCourses = async (filter?: {
    level?: string;
    category?: string;
    search?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("courses")
        .select(
          `
          *,
          profiles:instructor_id (username, avatar_url)
        `
        )
        .eq("is_published", true);

      if (filter?.level && filter.level !== "all") {
        query = query.eq("level", filter.level);
      }

      if (filter?.category && filter.category !== "all") {
        query = query.eq("category", filter.category);
      }

      if (filter?.search) {
        query = query.or(
          `title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get course by ID
  const getCourseById = async (courseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          *,
          profiles:instructor_id (username, avatar_url),
          course_sections:id (
            *,
            course_lessons:id (*)
          )
        `
        )
        .eq("id", courseId)
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

  // Create a new course
  const createCourse = async (courseData: {
    title: string;
    description: string;
    level: string;
    category: string;
    duration: string;
    image_url?: string;
    price?: number;
    sections: {
      title: string;
      lessons: { title: string; description: string }[];
    }[];
  }) => {
    if (!user) {
      setError("You must be logged in to create a course");
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Start a transaction
    try {
      // 1. Create the course
      const courseId = uuidv4();
      const { error: courseError } = await supabase.from("courses").insert({
        id: courseId,
        title: courseData.title,
        description: courseData.description,
        instructor_id: user.id,
        level: courseData.level,
        category: courseData.category,
        duration: courseData.duration,
        image_url: courseData.image_url || null,
        price: courseData.price || 0,
        is_published: false,
      });

      if (courseError) throw courseError;

      // 2. Create sections and lessons
      for (let i = 0; i < courseData.sections.length; i++) {
        const section = courseData.sections[i];
        const sectionId = uuidv4();

        // Create section
        const { error: sectionError } = await supabase
          .from("course_sections")
          .insert({
            id: sectionId,
            course_id: courseId,
            title: section.title,
            order: i,
          });

        if (sectionError) throw sectionError;

        // Create lessons for this section
        for (let j = 0; j < section.lessons.length; j++) {
          const lesson = section.lessons[j];
          const { error: lessonError } = await supabase
            .from("course_lessons")
            .insert({
              id: uuidv4(),
              section_id: sectionId,
              title: lesson.title,
              description: lesson.description,
              order: j,
            });

          if (lessonError) throw lessonError;
        }
      }

      return courseId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      setError("You must be logged in to enroll in a course");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if already enrolled
      const { data: existing, error: checkError } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setError("You are already enrolled in this course");
        return false;
      }

      // Create enrollment record
      const { error: enrollError } = await supabase
        .from("course_enrollments")
        .insert({
          id: uuidv4(),
          user_id: user.id,
          course_id: courseId,
          progress: 0,
        });

      if (enrollError) throw enrollError;

      // Update course enrollment count
      const { error: updateError } = await supabase.rpc(
        "increment_course_enrollments",
        {
          course_id: courseId,
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

  // Get user enrollments
  const getUserEnrollments = async () => {
    if (!user) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(
          `
          *,
          courses:course_id (
            *,
            profiles:instructor_id (username, avatar_url)
          )
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
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
    getCourses,
    getCourseById,
    createCourse,
    enrollInCourse,
    getUserEnrollments,
  };
};
