"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { mockNewsFeed, mockCourses } from "../lib/mock-data";
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
  ThumbsUp,
  MessageCircle,
  Share2,
  BookOpen,
  UserPlus,
  Hash,
} from "lucide-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              >
                Explore Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
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
            <Tabs defaultValue="feed" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                  <TabsTrigger
                    value="feed"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-gray-700"
                  >
                    Latest Feed
                  </TabsTrigger>
                  <TabsTrigger
                    value="trending"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-gray-700"
                  >
                    Trending
                  </TabsTrigger>
                  <TabsTrigger
                    value="following"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-gray-700"
                  >
                    Following
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus-circle"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12h8"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                  Create Post
                </Button>
              </div>

              <TabsContent value="feed" className="space-y-6 mt-0">
                {mockNewsFeed.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6 mt-0">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800 flex items-center gap-3">
                  <p>Discover what's popular right now in tech communities.</p>
                </div>
                {mockNewsFeed.slice(0, 3).map((post) => (
                  <FeedCard
                    key={post.id}
                    post={{
                      ...post,
                      likes: post.likes * 3,
                      comments: post.comments * 2,
                    }}
                  />
                ))}
              </TabsContent>

              <TabsContent value="following" className="space-y-6 mt-0">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-800 flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  <p>Connect with more professionals to customize your feed.</p>
                </div>
                {mockNewsFeed.slice(2, 4).map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <ProfilePreview />
            <TrendingCourses courses={mockCourses.slice(0, 3)} />
            <TrendingTopics />
          </div>
        </div>
      </div>
    </main>
  );
}

interface Post {
  id: string | number;
  author: string;
  timestamp: string;
  title: string;
  content: string;
  tags?: string[];
  likes: number;
  comments: number;
}

function FeedCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              {post.author.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{post.author}</div>
            <div className="text-xs text-gray-500">{post.timestamp}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{post.content}</p>

        {post.tags && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-indigo-600 flex items-center gap-2"
          >
            <ThumbsUp size={18} /> {post.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-indigo-600 flex items-center gap-2"
          >
            <MessageCircle size={18} /> {post.comments}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-indigo-600"
        >
          <Share2 size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProfilePreview() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-md">
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              US
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">User</h3>
            <p className="text-sm text-gray-500">Tech enthusiast</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-600">12</div>
            <div className="text-xs text-gray-500">Courses</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-600">48</div>
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

interface Course {
  id: string | number;
  title: string;
  instructor: string;
  level: string;
}

function TrendingCourses({ courses }: { courses: Course[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen size={20} className="text-indigo-600" />
          Trending Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
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
                    {course.instructor} • {course.level}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
