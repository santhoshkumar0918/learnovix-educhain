"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Feed from "@/components/Feed";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  UserPlus,
  Hash,
  TrendingUp,
  Users,
  GraduationCap,
} from "lucide-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();
  const { getCourses, getUserEnrollments, isLoading } = useCourses();
  const [trendingCourses, setTrendingCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch trending courses
    const fetchTrendingCourses = async () => {
      const courses = await getCourses();
      if (courses) {
        // Sort by enrollment count and take top 3
        const sorted = [...courses].sort(
          (a, b) => b.enrollment_count - a.enrollment_count
        );
        setTrendingCourses(sorted.slice(0, 3));
      }
    };

    // Fetch enrolled courses if user is logged in
    const fetchEnrolledCourses = async () => {
      if (user) {
        const enrollments = await getUserEnrollments();
        if (enrollments) {
          setEnrolledCourses(
            enrollments.map((enrollment: any) => enrollment.courses)
          );
        }
      }
    };

    fetchTrendingCourses();
    fetchEnrolledCourses();
  }, [user, getCourses, getUserEnrollments]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation scrolled={scrolled} />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Welcome to Learnopoly
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Your unified platform for tech learning, networking, and staying
              updated with the latest industry trends.
            </p>
            <div className="flex space-x-4">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-gray-100"
                onClick={() => (window.location.href = "/courses")}
              >
                Explore Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => (window.location.href = "/communities")}
              >
                Join Community
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            <Feed />
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <ProfilePreview
              user={user}
              profile={profile}
              enrolledCourses={enrolledCourses}
            />
            <TrendingCourses courses={trendingCourses} isLoading={isLoading} />
            <TrendingTopics />
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfilePreview({
  user,
  profile,
  enrolledCourses,
}: {
  user: any;
  profile: any;
  enrolledCourses: any[];
}) {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="text-center py-4">
            <GraduationCap size={40} className="mx-auto text-indigo-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">
              Join Learnopoly Today
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Sign in to track your courses, connect with other learners, and
              join the tech community.
            </p>
            <Link href="/auth">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-md">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              {profile?.username?.substring(0, 2)?.toUpperCase() ||
                user.email?.substring(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">
              {profile?.username || "User"}
            </h3>
            <p className="text-sm text-gray-500">
              {profile?.bio?.substring(0, 30) || "Tech enthusiast"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-600">
              {enrolledCourses?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Courses</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-600">0</div>
            <div className="text-xs text-gray-500">Connections</div>
          </div>
        </div>

        <div className="mt-5">
          <Link href="/profile">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendingCourses({
  courses,
  isLoading,
}: {
  courses: any[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen size={20} className="text-indigo-600" />
          Trending Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No courses available
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block group"
              >
                <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="h-12 w-12 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.profiles?.username || "Instructor"} •{" "}
                      {course.level}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 border-t border-gray-100">
        <Link
          href="/courses"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View all courses →
        </Link>
      </CardFooter>
    </Card>
  );
}

function TrendingTopics() {
  const topics = [
    { name: "blockchain", count: 348 },
    { name: "machinelearning", count: 275 },
    { name: "webdev", count: 412 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hash size={20} className="text-indigo-600" />
          Join the Conversation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic) => (
            <Link href={`/topics/${topic.name}`} key={topic.name}>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-white dark:bg-gray-700 text-indigo-600 border-indigo-200"
                  >
                    #{topic.name}
                  </Badge>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {topic.count}{" "}
                  <span className="text-gray-400 text-xs">discussions</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
