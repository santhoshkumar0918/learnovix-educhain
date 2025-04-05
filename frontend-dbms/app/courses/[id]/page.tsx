"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  User,
  ArrowLeft,
  Play,
  CheckCircle,
  Star,
  Users,
  Award,
  MessageSquare,
  FileText,
  ChevronDown,
  Lock,
} from "lucide-react";

export default function CoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getCourseById, enrollInCourse, isLoading, error } = useCourses();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (id) {
        const courseData = await getCourseById(id as string);
        if (courseData) {
          setCourse(courseData);

          // Sort sections and lessons by order
          if (courseData.course_sections) {
            courseData.course_sections.sort(
              (a: any, b: any) => a.order - b.order
            );
            courseData.course_sections.forEach((section: any) => {
              if (section.course_lessons) {
                section.course_lessons.sort(
                  (a: any, b: any) => a.order - b.order
                );
              }
            });
          }

          // Check if user is enrolled
          // This would normally come from the course data
          // For now, let's assume it's a property on the course
          setIsEnrolled(false); // TODO: Replace with actual enrollment data
          setEnrollmentProgress(35); // TODO: Replace with actual progress data
        }
      }
    };

    fetchCourse();
  }, [id, getCourseById]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      const success = await enrollInCourse(id as string);
      if (success) {
        setIsEnrolled(true);
        setEnrollmentProgress(0);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, the course you're looking for doesn't exist or couldn't be
            loaded.
          </p>
          <Button
            onClick={() => router.push("/courses")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Courses
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-indigo-100 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Courses
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {course.category}
                </Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {course.level}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-indigo-100 text-lg mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-indigo-100">
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>{course.profiles?.username || "Instructor"}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users size={18} className="mr-2" />
                  <span>127 students</span>
                </div>
                <div className="flex items-center">
                  <Star
                    size={18}
                    className="mr-2 fill-yellow-400 text-yellow-400"
                  />
                  <span>4.8 (42 ratings)</span>
                </div>
              </div>
            </div>

            {!isEnrolled ? (
              <Card className="w-full md:w-80 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Join This Course</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Enhance your skills today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-2 text-green-400" />
                      <span className="text-sm">Full course access</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-2 text-green-400" />
                      <span className="text-sm">Certificate of completion</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-2 text-green-400" />
                      <span className="text-sm">Community support</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-white text-indigo-700 hover:bg-indigo-50"
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="w-full md:w-80 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                  <CardDescription className="text-indigo-100">
                    You're enrolled in this course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Progress</span>
                      <span>{enrollmentProgress}%</span>
                    </div>
                    <Progress
                      value={enrollmentProgress}
                      className="h-2 bg-white/30"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      className="w-full bg-white text-indigo-700 hover:bg-indigo-50"
                      onClick={() => router.push(`/courses/${id}/learn`)}
                    >
                      <Play size={16} className="mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="curriculum" className="w-full">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm mb-8">
            <TabsTrigger
              value="curriculum"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Instructor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>

              <div className="space-y-4">
                {course.course_sections?.map((section: any) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div>
                        <h3 className="font-semibold">{section.title}</h3>
                        <div className="text-sm text-gray-500">
                          {section.course_lessons?.length || 0} lessons
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${
                          expandedSections.includes(section.id)
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>

                    {expandedSections.includes(section.id) && (
                      <div className="divide-y divide-gray-100">
                        {section.course_lessons?.map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              {isEnrolled ? (
                                <Play
                                  size={18}
                                  className="mr-3 text-indigo-600"
                                />
                              ) : (
                                <Lock
                                  size={18}
                                  className="mr-3 text-gray-400"
                                />
                              )}
                              <div>
                                <div className="font-medium">
                                  {lesson.title}
                                </div>
                                {lesson.description && (
                                  <div className="text-sm text-gray-500">
                                    {lesson.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {lesson.video_url ? "Video" : "Text"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Course Overview</h2>

              <div className="prose dark:prose-invert max-w-none">
                <h3>What you'll learn</h3>
                <ul>
                  <li>Understand the core principles of the subject</li>
                  <li>Build practical projects to apply your knowledge</li>
                  <li>Gain hands-on experience with industry tools</li>
                  <li>Learn best practices for real-world applications</li>
                </ul>

                <h3>Prerequisites</h3>
                <p>
                  Basic knowledge of programming concepts is recommended.
                  Familiarity with related technologies would be helpful but not
                  required.
                </p>

                <h3>Who this course is for</h3>
                <p>
                  This course is designed for beginners looking to gain
                  practical skills, as well as intermediate learners wanting to
                  deepen their understanding. Professionals transitioning to
                  this field will also benefit from the structured approach and
                  comprehensive content.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>

              <div className="mb-8 flex flex-col md:flex-row gap-6">
                <div className="text-center md:w-1/3">
                  <div className="text-5xl font-bold text-indigo-600">4.8</div>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`${
                          star <= 5
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        } mx-0.5`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Based on 42 reviews
                  </div>
                </div>

                <div className="flex-1">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <div className="w-10 text-sm text-gray-600">
                          {rating} stars
                        </div>
                        <div className="w-full mx-2">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${
                                  rating === 5
                                    ? "75%"
                                    : rating === 4
                                    ? "20%"
                                    : rating === 3
                                    ? "3%"
                                    : rating === 2
                                    ? "1%"
                                    : "1%"
                                }`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-10 text-sm text-gray-600 text-right">
                          {rating === 5
                            ? "75%"
                            : rating === 4
                            ? "20%"
                            : rating === 3
                            ? "3%"
                            : rating === 2
                            ? "1%"
                            : "1%"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Sample reviews */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-800 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                        JD
                      </div>
                      <div>
                        <div className="font-semibold">John Doe</div>
                        <div className="text-xs text-gray-500">2 weeks ago</div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= 5
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          } mx-0.5`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    The course was incredibly well-structured and the
                    instructor's explanations were clear and concise. The
                    practical examples helped reinforce the concepts. Highly
                    recommended!
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="bg-purple-100 text-purple-800 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                        AS
                      </div>
                      <div>
                        <div className="font-semibold">Alice Smith</div>
                        <div className="text-xs text-gray-500">1 month ago</div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= 4
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          } mx-0.5`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Great content and very engaging. I've learned a lot and was
                    able to apply the knowledge immediately in my projects. The
                    only improvement I would suggest is to have more advanced
                    exercises.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  See All Reviews
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <div className="bg-indigo-100 text-indigo-800 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold mx-auto">
                    {course.profiles?.username?.charAt(0) || "I"}
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-lg">
                      {course.profiles?.username || "Instructor"}
                    </h3>
                    <div className="text-gray-500 text-sm">Expert Educator</div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Award size={16} className="text-indigo-500" />
                        <span className="text-sm">12 Courses</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Users size={16} className="text-indigo-500" />
                        <span className="text-sm">4,500+ Students</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Star size={16} className="text-indigo-500" />
                        <span className="text-sm">4.9 Average Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-3/4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed euismod, urna eu tincidunt consectetur, nisl nunc
                      euismod nisi, euismod consectetur nisl nunc euismod nisi.
                      Sed euismod, urna eu tincidunt consectetur, nisl nunc
                      euismod nisi, euismod consectetur nisl nunc euismod nisi.
                    </p>

                    <p>
                      With over 10 years of industry experience, I've worked
                      with leading companies to develop innovative solutions.
                      I'm passionate about sharing my knowledge and helping
                      students achieve their learning goals.
                    </p>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Areas of Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700"
                        >
                          Web Development
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700"
                        >
                          Data Science
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700"
                        >
                          AI/ML
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700"
                        >
                          Cloud Computing
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button variant="outline" className="gap-2">
                      <MessageSquare size={16} />
                      Contact Instructor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Courses */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Courses</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course cards (placeholders) */}
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="overflow-hidden transition-all hover:shadow-md border-none shadow-lg h-full flex flex-col"
              >
                <div className="relative">
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <BookOpen size={40} className="text-white" />
                  </div>
                </div>

                <CardHeader className="pt-6 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      {i === 1
                        ? "Beginner"
                        : i === 2
                        ? "Intermediate"
                        : "Advanced"}
                    </Badge>
                    <div className="flex items-center">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <span className="ml-1 text-sm text-gray-600">4.7</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-2">
                    {i === 1
                      ? "Web Development Fundamentals"
                      : i === 2
                      ? "Data Science with Python"
                      : "Advanced Machine Learning"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    by{" "}
                    {i === 1
                      ? "John Smith"
                      : i === 2
                      ? "Sarah Johnson"
                      : "David Chen"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-2 flex-grow">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {i === 1
                      ? "Learn the core concepts of web development, including HTML, CSS, and JavaScript."
                      : i === 2
                      ? "Master the fundamentals of data science using Python and popular libraries."
                      : "Dive deep into advanced machine learning techniques and algorithms."}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {i === 1 ? "6 weeks" : i === 2 ? "8 weeks" : "10 weeks"}
                    </div>
                    <div className="flex items-center">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {i === 1 ? "1,245" : i === 2 ? "983" : "756"}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t">
                  <Button
                    onClick={() => router.push(`/courses/${i}`)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Course
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
