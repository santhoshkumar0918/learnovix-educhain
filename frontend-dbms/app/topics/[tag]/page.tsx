"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  ArrowLeft,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function TopicPage() {
  const { tag } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getFeedPosts, likePost, hasLikedPost, isLoading, error } = usePosts();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const [scrolled, setScrolled] = useState(false);

  // Decode tag from URL
  const decodedTag = typeof tag === "string" ? decodeURIComponent(tag) : "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (decodedTag) {
      loadPosts();
    }
  }, [decodedTag, user]);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getFeedPosts({
        tag: decodedTag,
      });
      setPosts(fetchedPosts || []);

      // Check which posts the current user has liked
      if (user) {
        const likedStatus = new Set<string>();

        for (const post of fetchedPosts) {
          const isLiked = await hasLikedPost(post.id);
          if (isLiked) {
            likedStatus.add(post.id);
          }
        }

        setLikedPosts(likedStatus);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setLoadingLikes((prev) => new Set(prev).add(postId));

    try {
      const liked = await likePost(postId);

      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (liked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });

      // Update the like count in the posts state
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: liked
                ? post.likes_count + 1
                : Math.max(0, post.likes_count - 1),
            };
          }
          return post;
        })
      );
    } finally {
      setLoadingLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Format the date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Get related topics (fictional data - in a real app, you'd fetch this from backend)
  const relatedTopics = [
    { name: "javascript", count: 1256 },
    { name: "programming", count: 2731 },
    { name: "webdev", count: 1832 },
    { name: "technology", count: 3421 },
    { name: "coding", count: 2145 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation scrolled={scrolled} />

      {/* Topic Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-8 text-white">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-indigo-100 hover:text-white hover:bg-white/10"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 text-sm">
                  <Hash size={16} className="mr-1" />
                  Topic
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                #{decodedTag}
              </h1>
              <p className="text-indigo-100">
                Showing all discussions tagged with #{decodedTag}
              </p>
            </div>
            <div>
              <Button
                className="bg-white text-indigo-700 hover:bg-indigo-50"
                onClick={() => {
                  // Create a post with this tag pre-filled
                  // This is a placeholder - implement your post creation navigation
                  router.push("/");
                }}
              >
                Post with #{decodedTag}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Posts List */}
          <div className="lg:w-3/4 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
                <AlertCircle size={18} className="mr-2" />
                <p>Failed to load posts. Please try again later.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm">
                <Hash size={40} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  No posts with #{decodedTag} tag
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to create a post with this tag!
                </p>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => router.push("/")}
                >
                  Create a Post
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="overflow-hidden transition-all hover:shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                            {post.profiles?.username
                              ?.substring(0, 2)
                              ?.toUpperCase() ||
                              post.user_id?.substring(0, 2)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {post.profiles?.username || "Anonymous"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {post.title && (
                        <h3 className="text-xl font-semibold mb-3">
                          {post.title}
                        </h3>
                      )}
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {post.content}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag: string, index: number) => (
                            <Link href={`/topics/${tag}`} key={index}>
                              <Badge
                                variant="secondary"
                                className={`bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ${
                                  tag === decodedTag
                                    ? "border-2 border-indigo-500"
                                    : ""
                                }`}
                              >
                                #{tag}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}

                      {post.image_url && (
                        <div className="mt-4 rounded-md overflow-hidden">
                          <img
                            src={post.image_url}
                            alt="Post image"
                            className="w-full object-cover"
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            likedPosts.has(post.id)
                              ? "text-indigo-600"
                              : "text-gray-500 hover:text-indigo-600"
                          }`}
                          onClick={() => handleLike(post.id)}
                          disabled={loadingLikes.has(post.id)}
                        >
                          {loadingLikes.has(post.id) ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <ThumbsUp
                              size={18}
                              className={
                                likedPosts.has(post.id) ? "fill-indigo-600" : ""
                              }
                            />
                          )}
                          {post.likes_count || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-indigo-600 flex items-center gap-2"
                        >
                          <MessageSquare size={18} /> {post.comments_count || 0}
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
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">About #{decodedTag}</h3>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>
                  This page shows all posts tagged with #{decodedTag}. Tags help
                  categorize content and make it easier to find discussions on
                  specific topics.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Related Topics</h3>
              </CardHeader>
              <CardContent className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {relatedTopics.map((topic) => (
                    <Link
                      href={`/topics/${topic.name}`}
                      key={topic.name}
                      className="inline-block"
                    >
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      >
                        #{topic.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
