"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { mockCourses } from "@/lib/mock-data";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi";
import { useLearnopolyContract } from "@/hooks/useLearnopolyContract";
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
import Link from "next/link";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { createProfile, isPending, useUserProfile } = useLearnopolyContract();

  interface UserProfile {
    username?: string;
    bio?: string;
    skills?: string[];
    reputation?: number;
  }

  const [activeTab, setActiveTab] = useState("courses");
  const [isEditing, setIsEditing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "User",
    bio: "Tech enthusiast interested in blockchain and AI",
    skills: ["JavaScript", "React", "Solidity"],
  });

  // Mock enrolled courses (in a real app, we'd get this from the contract)
  const enrolledCourses = mockCourses.slice(0, 3);

  // Profile data from contract (will be undefined if not connected or profile doesn't exist)
  const { data: profileData } = useUserProfile(address) as {
    data: UserProfile | undefined;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleConnectWallet = () => {
    connect({ connector: injected() });
  };

  const handleCreateProfile = () => {
    createProfile(formData.username, formData.bio, formData.skills);
    setIsEditing(false);
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

  // If not connected, show connect wallet message
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Navigation />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-4 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
              <p className="mt-2 text-indigo-100">
                Access your personalized learning dashboard
              </p>
            </div>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Connect your wallet to access your profile, courses, and network
                with other professionals.
              </p>
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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
              <AvatarFallback className="bg-white text-indigo-700 text-4xl font-bold">
                {profileData?.username
                  ? profileData.username.substring(0, 2).toUpperCase()
                  : address?.substring(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-6 pb-2 text-white">
              <h1 className="text-3xl font-bold">
                {profileData?.username || "Anonymous User"}
              </h1>
              <p className="text-indigo-100 font-mono text-sm truncate max-w-xs sm:max-w-md">
                {address}
              </p>
            </div>
            <div className="ml-auto pb-2">
              {!isEditing && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-white text-indigo-700 hover:bg-gray-100"
                      size="sm"
                    >
                      <Pencil size={16} className="mr-2" />
                      {profileData?.username
                        ? "Edit Profile"
                        : "Create Profile"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {profileData?.username
                          ? "Edit Profile"
                          : "Create Profile"}
                      </DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
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
                        onClick={handleCreateProfile}
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Saving..." : "Save Profile"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p className="mb-4">{profileData?.bio || formData.bio}</p>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(profileData?.skills || formData.skills).map(
                      (skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-600"
                        >
                          {skill}
                        </Badge>
                      )
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
                      {profileData?.reputation || "0"}
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
                      12
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Posts
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 text-amber-600 mb-1" />
                    <span className="text-2xl font-bold text-amber-700">
                      48
                    </span>
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
                  {enrolledCourses.length > 0 ? (
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
                              <span>{course.instructor}</span>
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
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                              Continue
                            </Button>
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
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Browse Courses
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="p-6 m-0">
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
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <PlusCircle size={18} className="mr-2" />
                      Create Post
                    </Button>
                  </div>
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
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Find Connections
                    </Button>
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
                          Course Completion
                        </h4>
                        <p className="text-sm text-gray-600">
                          Completed "Blockchain Fundamentals"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="mt-1 rounded-full p-1.5 bg-purple-100">
                        <TrendingUp size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Streak Milestone
                        </h4>
                        <p className="text-sm text-gray-600">
                          7-day learning streak
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
                    <span>View all achievements</span>
                    <ChevronRight size={16} />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar size={18} className="text-indigo-600 mr-2" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="mt-1 rounded-full p-1.5 bg-green-100">
                        <Users size={18} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          AI Networking Event
                        </h4>
                        <p className="text-sm text-gray-600">
                          Tomorrow, 6:00 PM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                      <div className="mt-1 rounded-full p-1.5 bg-amber-100">
                        <BookOpen size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Web3 Workshop
                        </h4>
                        <p className="text-sm text-gray-600">
                          April 5, 3:00 PM
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
                    <span>View all events</span>
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
