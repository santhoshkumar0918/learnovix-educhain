"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCommunities } from "@/hooks/useCommunities";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  User,
  Settings,
  ArrowLeft,
  PlusCircle,
  MessageSquare,
  ThumbsUp,
  Share2,
  Globe,
  Lock,
  Calendar,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    getCommunityById,
    getCommunityMembers,
    isCommunityMember,
    getUserCommunityRole,
    joinCommunity,
    leaveCommunity,
    isLoading: communityLoading,
    error: communityError,
  } = useCommunities();
  const {
    getCommunityPosts,
    createPost,
    likePost,
    hasLikedPost,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts();

  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadCommunityData();
    }
  }, [id, user]);

  const loadCommunityData = async () => {
    try {
      // Get community details
      const communityData = await getCommunityById(id as string);
      if (communityData) {
        setCommunity(communityData);
      }

      // Get community members
      const membersData = await getCommunityMembers(id as string);
      if (membersData) {
        setMembers(membersData);
      }

      // Get community posts
      const postsData = await getCommunityPosts(id as string);
      if (postsData) {
        setPosts(postsData);

        // Check which posts the current user has liked
        if (user) {
          const likedStatus = new Set<string>();
          for (const post of postsData) {
            const isLiked = await hasLikedPost(post.id);
            if (isLiked) {
              likedStatus.add(post.id);
            }
          }
          setLikedPosts(likedStatus);
        }
      }

      // Check if user is a member
      if (user) {
        const membershipStatus = await isCommunityMember(id as string);
        setIsMember(membershipStatus);

        // Get user's role in community
        const role = await getUserCommunityRole(id as string);
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error loading community data:", error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setIsProcessing(true);
    try {
      const success = await joinCommunity(id as string);
      if (success) {
        setIsMember(true);
        setUserRole("member");
        // Reload members to update the list
        const membersData = await getCommunityMembers(id as string);
        if (membersData) {
          setMembers(membersData);
        }
      }
    } catch (error) {
      console.error("Error joining community:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const success = await leaveCommunity(id as string);
      if (success) {
        setIsMember(false);
        setUserRole(null);
        // Reload members to update the list
        const membersData = await getCommunityMembers(id as string);
        if (membersData) {
          setMembers(membersData);
        }
      }
    } catch (error) {
      console.error("Error leaving community:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !user || !isMember) return;

    setIsSubmittingPost(true);
    try {
      await createPost({
        content: newPostContent,
        communityId: id as string,
      });

      setNewPostContent("");

      // Reload posts
      const postsData = await getCommunityPosts(id as string);
      if (postsData) {
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmittingPost(false);
    }
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

  if (communityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (communityError || !community) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Community Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, the community you're looking for doesn't exist or couldn't be
            loaded.
          </p>
          <Button
            onClick={() => router.push("/communities")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Communities
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      {/* Community Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-indigo-100 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/communities")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Communities
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {community.category || "General"}
                </Badge>
                {community.is_private && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                    <Lock size={12} className="mr-1" /> Private
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {community.name}
              </h1>
              <p className="text-indigo-100 text-lg mb-6">
                {community.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-indigo-100">
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>{community.profiles?.username || "Creator"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2" />
                  <span>Created {formatDate(community.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Users size={18} className="mr-2" />
                  <span>
                    {community.members_count}{" "}
                    {community.members_count === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col space-y-3">
              {!isMember ? (
                <Button
                  className="w-full bg-white text-indigo-700 hover:bg-indigo-50"
                  disabled={isProcessing}
                  onClick={handleJoinCommunity}
                >
                  {isProcessing ? "Joining..." : "Join Community"}
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full bg-white text-indigo-700 hover:bg-indigo-50"
                    onClick={() => {
                      // Navigate to messages with this community
                      // This is a placeholder - implement your messaging navigation
                      console.log("Navigate to community messages");
                    }}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Community Chat
                  </Button>

                  {userRole === "admin" && (
                    <Button
                      className="w-full bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => {
                        // Navigate to community settings
                        // This is a placeholder - implement your settings navigation
                        console.log("Navigate to community settings");
                      }}
                    >
                      <Settings size={16} className="mr-2" />
                      Manage Community
                    </Button>
                  )}

                  {userRole !== "admin" && (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                      disabled={isProcessing}
                      onClick={handleLeaveCommunity}
                    >
                      {isProcessing ? "Leaving..." : "Leave Community"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm mb-6">
            <TabsTrigger
              value="discussions"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Discussions
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6">
            {/* Create Post (if member) */}
            {isMember && (
              <Card className="overflow-hidden transition-all hover:shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        {user?.email?.substring(0, 2)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Share something with the ${community.name} community...`}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-16 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="p-4 flex justify-end border-t mt-4">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    size="sm"
                    disabled={!newPostContent.trim() || isSubmittingPost}
                    onClick={handlePostSubmit}
                  >
                    {isSubmittingPost ? "Posting..." : "Post"}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Posts List */}
            {postsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm">
                <Users size={40} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No discussions yet</h3>
                <p className="text-gray-500 mb-4">
                  Be the first to start a conversation in this community!
                </p>
                {!isMember ? (
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleJoinCommunity}
                  >
                    Join to Post
                  </Button>
                ) : (
                  <p className="text-sm text-gray-400">
                    Share your thoughts or questions above
                  </p>
                )}
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
                          disabled={loadingLikes.has(post.id) || !isMember}
                        >
                          <ThumbsUp
                            size={18}
                            className={
                              likedPosts.has(post.id) ? "fill-indigo-600" : ""
                            }
                          />
                          {post.likes_count || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-indigo-600 flex items-center gap-2"
                          onClick={() => {
                            // Navigate to post detail view with comments
                            // This is a placeholder - implement your post detail navigation
                            console.log("Navigate to post detail");
                          }}
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
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Members</CardTitle>
                <CardDescription>
                  People who have joined this community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                          {member.profiles?.username
                            ?.substring(0, 2)
                            ?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {member.profiles?.username || "User"}
                        </div>
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              member.role === "admin"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : member.role === "moderator"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {member.role === "admin"
                              ? "Admin"
                              : member.role === "moderator"
                              ? "Moderator"
                              : "Member"}
                          </Badge>
                          {member.user_id === community.created_by && (
                            <span className="ml-2 text-xs text-gray-500">
                              • Creator
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600"
                        onClick={() => {
                          // Navigate to user profile
                          // This is a placeholder - implement your profile navigation
                          console.log("View profile", member.user_id);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {community.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {community.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <div className="w-32 text-gray-500">Category:</div>
                      <div>{community.category || "General"}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-gray-500">Created by:</div>
                      <div>{community.profiles?.username || "Creator"}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-gray-500">Created:</div>
                      <div>{formatDate(community.created_at)}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-gray-500">Privacy:</div>
                      <div className="flex items-center">
                        {community.is_private ? (
                          <>
                            <Lock size={14} className="mr-1" /> Private
                          </>
                        ) : (
                          <>
                            <Globe size={14} className="mr-1" /> Public
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-gray-500">Members:</div>
                      <div>{community.members_count}</div>
                    </div>
                  </div>
                </div>

                {/* Community Guidelines (placeholder - could be added to the community model) */}
                <div>
                  <h3 className="font-semibold mb-2">Community Guidelines</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>1. Be respectful to all members.</p>
                    <p>
                      2. Stay on topic with discussions relevant to the
                      community.
                    </p>
                    <p>3. No spam or self-promotion without permission.</p>
                    <p>4. Share knowledge and help others when possible.</p>
                  </div>
                </div>
              </CardContent>
              {userRole === "admin" && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      // Navigate to edit community
                      // This is a placeholder - implement your edit navigation
                      console.log("Edit community");
                    }}
                  >
                    <Settings size={16} />
                    Edit Community
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
