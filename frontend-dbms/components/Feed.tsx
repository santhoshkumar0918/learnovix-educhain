"use client";

import { useState, useEffect } from "react";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Plus,
  Image as ImageIcon,
  Tag as TagIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";

type FeedTab = "all" | "following" | "trending";

export default function Feed() {
  const { user, profile } = useAuth();
  const { getFeedPosts, createPost, likePost, hasLikedPost, isLoading, error } =
    usePosts();
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getFeedPosts({ tab: activeTab });
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

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !user) return;

    setIsSubmitting(true);

    try {
      await createPost({
        content: newPostContent,
        tags: newPostTags.length > 0 ? newPostTags : undefined,
      });

      setNewPostContent("");
      setNewPostTags([]);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "#" && !e.repeat) {
      // Extract words from the textarea
      const words = newPostContent.split(/\s+/);
      const lastWord = words[words.length - 1];

      // If the last word starts with #, extract the tag and add it
      if (lastWord && lastWord.startsWith("#") && lastWord.length > 1) {
        const newTag = lastWord.slice(1); // Remove the #
        if (newTag && !newPostTags.includes(newTag)) {
          setNewPostTags([...newPostTags, newTag]);

          // Remove the tag from the post content
          setNewPostContent(newPostContent.replace(lastWord, "").trim());
        }
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPostTags(newPostTags.filter((tag) => tag !== tagToRemove));
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

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

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      {user && (
        <Card className="overflow-hidden transition-all hover:shadow-sm">
          <CardHeader className="p-4 pb-0">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {profile?.username?.substring(0, 2)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share something with the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  onKeyDown={handleTagAdd}
                  className="min-h-16 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
                />

                {newPostTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPostTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag}
                        <span className="text-xs hover:text-indigo-900 cursor-pointer">
                          ✕
                        </span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardFooter className="p-4 flex justify-between border-t mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-indigo-600"
              >
                <ImageIcon size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-indigo-600"
                onClick={() => {
                  setNewPostContent((prev) => prev + " #");
                }}
              >
                <TagIcon size={18} />
              </Button>
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              size="sm"
              disabled={!newPostContent.trim() || isSubmitting}
              onClick={handlePostSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Post
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Feed Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as FeedTab)}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Latest
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Trending
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6 mt-0">
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-2">No posts found</p>
              <p className="text-sm text-gray-400">
                Be the first to share something with the community!
              </p>
            </div>
          ) : (
            renderPosts()
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6 mt-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={30} className="animate-spin text-indigo-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No trending posts at the moment</p>
            </div>
          ) : (
            renderPosts()
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-6 mt-0">
          {!user ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-700">
              <p>Sign in to see posts from people you follow</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={30} className="animate-spin text-indigo-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-2">
                No posts from people you follow
              </p>
              <p className="text-sm text-gray-400">
                Start following people to see their posts here
              </p>
            </div>
          ) : (
            renderPosts()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderPosts() {
    return posts.map((post) => (
      <Card
        key={post.id}
        className="overflow-hidden transition-all hover:shadow-sm"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                {post.profiles?.username?.substring(0, 2)?.toUpperCase() ||
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
            <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
          )}
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {post.content}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: string, index: number) => (
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
                  className={likedPosts.has(post.id) ? "fill-indigo-600" : ""}
                />
              )}
              {post.likes_count || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-indigo-600 flex items-center gap-2"
            >
              <MessageCircle size={18} /> {post.comments_count || 0}
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
    ));
  }
}
