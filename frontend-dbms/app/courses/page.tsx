"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/hooks/useCourses";
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
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  BarChart,
  ChevronRight,
  Globe,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { getCourses, getUserEnrollments, enrollInCourse, isLoading, error } =
    useCourses();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [processingEnroll, setProcessingEnroll] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadCourses();
    if (user) {
      loadUserEnrollments();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const data = await getCourses({
        level: filter !== "all" ? filter : undefined,
        search: searchTerm || undefined,
      });
      setCourses(data || []);
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };

  const loadUserEnrollments = async () => {
    try {
      const data = await getUserEnrollments();
      setEnrolledCourses(
        data?.map((enrollment: any) => enrollment.courses) || []
      );
    } catch (err) {
      console.error("Error loading user enrollments:", err);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    setProcessingEnroll((prev) => new Set(prev).add(courseId));

    try {
      const success = await enrollInCourse(courseId);
      if (success) {
        loadUserEnrollments();
      }
    } catch (err) {
      console.error("Error enrolling in course:", err);
    } finally {
      setProcessingEnroll((prev) => {
        const updated = new Set(prev);
        updated.delete(courseId);
        return updated;
      });
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    loadCourses();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some((course) => course.id === courseId);
  };

  const filteredCourses = courses;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-12 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Expand Your Tech Skills
            </h1>
            <p className="text-lg text-indigo-100 mb-6">
              Choose from hundreds of courses created by leading experts in the
              tech industry.
            </p>
            <form
              onSubmit={handleSearch}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-5"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-200" />
                  <Input
                    type="text"
                    placeholder="Search for courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 w-full"
                  />
                </div>
                <Select value={filter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className="bg-white text-indigo-700 hover:bg-indigo-50"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="allCourses" className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
              <TabsTrigger
                value="allCourses"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                All Courses
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                Popular
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                New
              </TabsTrigger>
              <TabsTrigger
                value="enrolled"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                My Courses
              </TabsTrigger>
            </TabsList>

            {user && (
              <Link href="/courses/create">
                <Button className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <PlusCircle size={16} />
                  Create Course
                </Button>
              </Link>
            )}
          </div>

          <TabsContent value="allCourses" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Failed to load courses. Please try again later.
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <BookOpen size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? `No courses matching "${searchTerm}"`
                    : "No courses are available at the moment."}
                </p>
                {user && (
                  <Link href="/courses/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Create a Course
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={() => handleEnroll(course.id)}
                    isEnrolled={isEnrolled(course.id)}
                    isProcessing={processingEnroll.has(course.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses
                .sort((a, b) => b.enrollment_count - a.enrollment_count)
                .slice(0, 6)
                .map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={() => handleEnroll(course.id)}
                    isEnrolled={isEnrolled(course.id)}
                    isProcessing={processingEnroll.has(course.id)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 6)
                .map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={() => handleEnroll(course.id)}
                    isEnrolled={isEnrolled(course.id)}
                    isProcessing={processingEnroll.has(course.id)}
                    isNew={true}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="enrolled" className="m-0">
            {!user ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-700 my-8">
                <p className="text-center">
                  Please sign in to see your enrolled courses
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <BookOpen size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  You haven't enrolled in any courses yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Browse our catalog and find the perfect course to start your
                  learning journey.
                </p>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    const element = document.querySelector(
                      '[data-state="inactive"][value="all"]'
                    );
                    if (element) {
                      (element as HTMLElement).click();
                    }
                  }}
                >
                  Explore Courses
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={() => {}}
                    isEnrolled={true}
                    isProcessing={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Featured categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard
              title="Web Development"
              count={37}
              icon={<Globe size={18} />}
              color="from-blue-500 to-cyan-500"
              href="/courses?category=web-development"
            />
            <CategoryCard
              title="Blockchain & Web3"
              count={24}
              icon={<Sparkles size={18} />}
              color="from-purple-500 to-pink-500"
              href="/courses?category=blockchain"
            />
            <CategoryCard
              title="Data Science"
              count={42}
              icon={<BarChart size={18} />}
              color="from-green-500 to-emerald-500"
              href="/courses?category=data-science"
            />
            <CategoryCard
              title="AI & Machine Learning"
              count={28}
              icon={<Sparkles size={18} />}
              color="from-amber-500 to-orange-500"
              href="/courses?category=machine-learning"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: string;
  enrollment_count: number;
  instructor_id: string;
  created_at: string;
  image_url?: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

function CourseCard({
  course,
  onEnroll,
  isEnrolled,
  isProcessing,
  isNew = false,
}: {
  course: Course;
  onEnroll: () => void;
  isEnrolled: boolean;
  isProcessing: boolean;
  isNew?: boolean;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-none shadow-lg h-full flex flex-col">
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <BookOpen size={40} className="text-white" />
        </div>
        {isNew && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
          </div>
        )}
        <div className="absolute -bottom-6 right-6">
          <div className="bg-white rounded-full h-12 w-12 shadow-lg flex items-center justify-center">
            <Avatar>
              <AvatarImage src={course.profiles?.avatar_url} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                {course.profiles?.username?.substring(0, 2)?.toUpperCase() ||
                  "IN"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <CardHeader className="pt-6 pb-2">
        <div className="flex justify-between items-start">
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            {course.level}
          </Badge>
          <div className="flex items-center">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm text-gray-600">4.8</span>
          </div>
        </div>
        <CardTitle className="text-xl mt-2">{course.title}</CardTitle>
        <CardDescription className="text-gray-600">
          by{" "}
          <span className="font-medium text-gray-700">
            {course.profiles?.username || "Instructor"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-gray-400" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <Users size={14} className="mr-1 text-gray-400" />
            {course.enrollment_count?.toLocaleString() || 0}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        {isEnrolled ? (
          <Link href={`/courses/${course.id}/learn`} className="w-full">
            <Button variant="outline" className="w-full">
              Continue Learning
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onEnroll}
            disabled={isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isProcessing ? "Enrolling..." : "Enroll Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

interface CategoryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  href: string;
}

function CategoryCard({ title, count, icon, color, href }: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden transition-all hover:shadow-md border-none shadow-lg group h-full">
        <CardContent className="p-0">
          <div
            className={`bg-gradient-to-r ${color} p-6 text-white flex flex-col h-full`}
          >
            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-4">
              {icon}
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-white/80 mb-4">{count} courses</p>
            <div className="mt-auto flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
              Browse courses <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
