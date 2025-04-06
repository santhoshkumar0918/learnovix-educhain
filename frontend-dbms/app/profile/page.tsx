"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useCourses } from "@/hooks/useCourses";
import { useProfiles } from "@/hooks/useProfiles";
import { usePosts } from "@/hooks/usePosts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Pencil,
  Share2,
  Award,
  MessageSquare,
  Users,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { getUserEnrollments, isLoading: coursesLoading } = useCourses();
  const { updateProfile, isLoading: profileLoading } = useProfiles();
  const { getFeedPosts, isLoading: postsLoading } = usePosts();

  const [activeTab, setActiveTab] = useState("courses");
  const [isEditing, setIsEditing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    skills: [] as string[],
    location: "",
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/auth");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    if (user) {
      loadUserData();
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, authLoading, router]);

  useEffect(() => {
    // Update form data when profile is loaded
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        location: profile.location || "",
      });
    }
  }, [profile]);

  const loadUserData = async () => {
    try {
      // Load enrolled courses
      const enrollments = await getUserEnrollments();
      if (enrollments) {
        setEnrolledCourses(
          enrollments.map((enrollment: any) => enrollment.courses)
        );
      }

      // Load user posts
      if (user) {
        // We would typically want to filter posts by the current user
        const posts = await getFeedPosts();
        const filtered = posts.filter((post: any) => post.user_id === user.id);
        setUserPosts(filtered);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will be redirected in useEffect)
  if (!user) return null;

  const isLoading = coursesLoading || profileLoading || postsLoading;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-8 pb-24 relative overflow-hidden">
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-end">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-xl">
              <AvatarImage src={profile?.avatar_url ?? ""} />
              <AvatarFallback className="bg-white text-indigo-700 text-4xl font-bold">
                {profile?.username?.substring(0, 2)?.toUpperCase() ||
                  user?.email?.substring(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-6 pb-2 text-white">
              <h1 className="text-3xl font-bold">
                {profile?.username || "Your Profile"}
              </h1>
              <p className="text-indigo-100 font-mono text-sm truncate max-w-xs sm:max-w-md">
                {user.email}
              </p>
            </div>
            <div className="ml-auto pb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white text-indigo-700 hover:bg-gray-100"
                    size="sm"
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        className="text-right text-sm font-medium"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        className="text-right text-sm font-medium"
                        htmlFor="location"
                      >
                        Location
                      </label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., San Francisco, CA"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <label
                        className="text-right text-sm font-medium mt-2"
                        htmlFor="bio"
                      >
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        className="text-right text-sm font-medium"
                        htmlFor="skills"
                      >
                        Skills
                      </label>
                      <Input
                        id="skills"
                        placeholder="Comma separated skills"
                        value={formData.skills.join(", ")}
                        onChange={handleSkillsChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={profileLoading}
                      type="submit"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p className="mb-4">{profile?.bio || "No bio provided yet."}</p>

                {profile?.location && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      Location
                    </h3>
                    <p className="text-sm">{profile.location}</p>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-600"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No skills listed yet.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <Award className="h-6 w-6 text-indigo-600 mb-1" />
                    <span className="text-2xl font-bold text-indigo-700">
                      {profile?.reputation || "0"}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">
                      Reputation
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <BookOpen className="h-6 w-6 text-purple-600 mb-1" />
                    <span className="text-2xl font-bold text-purple-700">
                      {enrolledCourses.length}
                    </span>
                    <span className="text-xs text-purple-600 font-medium">
                      Courses
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-green-600 mb-1" />
                    <span className="text-2xl font-bold text-green-700">
                      {userPosts.length}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Posts
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 text-amber-600 mb-1" />
                    <span className="text-2xl font-bold text-amber-700">0</span>
                    <span className="text-xs text-amber-600 font-medium">
                      Connections
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-3">
            <Card className="border-none shadow-lg mb-6">
              {/* This is the fixed part: We need to have TabsContent inside the Tabs component */}
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <CardHeader className="p-0 pb-0 border-b">
                  <TabsList className="w-full h-auto p-0 bg-transparent rounded-none">
                    <TabsTrigger
                      value="courses"
                      className="flex-1 rounded-none border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4"
                    >
                      My Courses
                    </TabsTrigger>
                    <TabsTrigger
                      value="posts"
                      className="flex-1 rounded-none border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4"
                    >
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      value="connections"
                      className="flex-1 rounded-none border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4"
                    >
                      Connections
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                {/* TabsContent components must be direct children of the Tabs component */}
                <TabsContent value="courses" className="p-6 m-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2
                        size={30}
                        className="animate-spin text-indigo-600"
                      />
                    </div>
                  ) : enrolledCourses.length > 0 ? (
                    <div className="space-y-6">
                      {enrolledCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex flex-col sm:flex-row gap-4 sm:items-center pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className="sm:flex-shrink-0 h-16 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                            <BookOpen size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {course.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200"
                              >
                                {course.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                              <span>
                                {course.profiles?.username || "Instructor"}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center text-gray-500 text-xs">
                                <Calendar size={12} className="mr-1" /> Last
                                accessed 2 days ago
                              </span>
                            </p>
                            <div className="mb-2">
                              <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-indigo-600">
                                  35%
                                </span>
                              </div>
                              <Progress value={35} className="h-2" />
                            </div>
                          </div>
                          <div className="sm:flex-shrink-0 flex space-x-2">
                            <Link href={`/courses/${course.id}/learn`}>
                              <Button className="bg-indigo-600 hover:bg-indigo-700">
                                Continue
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                        <BookOpen size={32} className="text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No courses enrolled yet
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Start your learning journey by exploring our course
                        catalog and enrolling in a course that interests you.
                      </p>
                      <Link href="/courses">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          Browse Courses
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="p-6 m-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2
                        size={30}
                        className="animate-spin text-indigo-600"
                      />
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div className="space-y-6">
                      {userPosts.map((post) => (
                        <div
                          key={post.id}
                          className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {post.title && (
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {post.title}
                            </h3>
                          )}
                          <p className="text-gray-600 mb-4">{post.content}</p>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-indigo-50 text-indigo-600"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare size={14} />
                              {post.comments_count || 0} comments
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 size={14} />
                              Share
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                        <MessageSquare size={32} className="text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No posts yet
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Share your thoughts, insights, and learning experiences
                        with the community.
                      </p>
                      <Link href="/">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          <PlusCircle size={18} className="mr-2" />
                          Create Post
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="connections" className="p-6 m-0">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Users size={32} className="text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No connections yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Connect with other professionals to expand your network
                      and discover new opportunities.
                    </p>
                    <Link href="/network">
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Find Connections
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award size={18} className="text-indigo-600 mr-2" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                      <div className="mt-1 rounded-full p-1.5 bg-indigo-100">
                        <Award size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Joined Learnopoly
                        </h4>
                        <p className="text-sm text-gray-600">
                          Welcome to the learning community!
                        </p>
                      </div>
                    </div>
                    {enrolledCourses.length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div className="mt-1 rounded-full p-1.5 bg-purple-100">
                          <BookOpen size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Enrolled in First Course
                          </h4>
                          <p className="text-sm text-gray-600">
                            Started your learning journey!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 w-full justify-between"
                  >
                    <span>View all achievements</span>
                    <ChevronRight size={16} />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar size={18} className="text-indigo-600 mr-2" />
                    Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="mt-1 rounded-full p-1.5 bg-green-100">
                        <BookOpen size={18} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Web Development Fundamentals
                        </h4>
                        <p className="text-sm text-gray-600">
                          Popular course with beginners
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                      <div className="mt-1 rounded-full p-1.5 bg-amber-100">
                        <Users size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          JavaScript Developers
                        </h4>
                        <p className="text-sm text-gray-600">
                          Community with 2k+ members
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 w-full justify-between"
                  >
                    <span>View all recommendations</span>
                    <ChevronRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
