"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCommunities } from "@/hooks/useCommunities";
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
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Globe,
  Lock,
  ArrowRight,
  MessagesSquare,
  BookOpen,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunitiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    getCommunities,
    getUserCommunities,
    joinCommunity,
    isLoading,
    error,
  } = useCommunities();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [processingJoin, setProcessingJoin] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadCommunities();
    if (user) {
      loadUserCommunities();
    }
  }, [user]);

  const loadCommunities = async () => {
    try {
      const data = await getCommunities({
        category: filter !== "all" ? filter : undefined,
        search: searchTerm || undefined,
      });
      setCommunities(data || []);
    } catch (err) {
      console.error("Error loading communities:", err);
    }
  };

  const loadUserCommunities = async () => {
    try {
      const data = await getUserCommunities();
      setUserCommunities(data || []);
    } catch (err) {
      console.error("Error loading user communities:", err);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setProcessingJoin((prev) => new Set(prev).add(communityId));

    try {
      const success = await joinCommunity(communityId);
      if (success) {
        // Refresh the communities data
        loadCommunities();
        loadUserCommunities();
      }
    } catch (err) {
      console.error("Error joining community:", err);
    } finally {
      setProcessingJoin((prev) => {
        const updated = new Set(prev);
        updated.delete(communityId);
        return updated;
      });
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    loadCommunities();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCommunities();
  };

  const isMemberOf = (communityId: string) => {
    return userCommunities.some((comm) => comm.id === communityId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation scrolled={scrolled} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-12 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Join Tech Communities
            </h1>
            <p className="text-lg text-indigo-100 mb-6">
              Connect with like-minded professionals, share knowledge, and grow
              together in specialized tech communities.
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
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 w-full"
                  />
                </div>
                <Select value={filter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="web-development">
                      Web Development
                    </SelectItem>
                    <SelectItem value="blockchain">
                      Blockchain & Web3
                    </SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="machine-learning">
                      AI & Machine Learning
                    </SelectItem>
                    <SelectItem value="mobile-development">
                      Mobile Development
                    </SelectItem>
                    <SelectItem value="devops">DevOps & Cloud</SelectItem>
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Explore Communities</h2>
          {user && (
            <Link href="/communities/create">
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <PlusCircle size={16} />
                Create Community
              </Button>
            </Link>
          )}
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm mb-6">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              All Communities
            </TabsTrigger>
            <TabsTrigger
              value="my"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              My Communities
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Failed to load communities. Please try again later.
              </div>
            ) : communities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No communities found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? `No communities matching "${searchTerm}"`
                    : "No communities are available at the moment."}
                </p>
                {user && (
                  <Link href="/communities/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Create a Community
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={isMemberOf(community.id)}
                    onJoin={() => handleJoinCommunity(community.id)}
                    isProcessing={processingJoin.has(community.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
            {!user ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-700 my-8">
                <p className="text-center">
                  Please sign in to see your communities
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : userCommunities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  You haven't joined any communities yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Explore communities and connect with like-minded professionals
                </p>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() =>
                    document
                      .querySelector('[data-state="inactive"][value="all"]')
                      ?.click?.call(
                        document.querySelector(
                          '[data-state="inactive"][value="all"]'
                        ) as HTMLElement
                      )
                  }
                >
                  Explore Communities
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={true}
                    onJoin={() => {}}
                    isProcessing={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show top communities by member count */}
              {communities
                .sort((a, b) => b.members_count - a.members_count)
                .slice(0, 6)
                .map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={isMemberOf(community.id)}
                    onJoin={() => handleJoinCommunity(community.id)}
                    isProcessing={processingJoin.has(community.id)}
                    isTrending={true}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard
              title="Web Development"
              count={37}
              icon={<Globe size={18} />}
              color="from-blue-500 to-cyan-500"
              href="/communities?category=web-development"
            />
            <CategoryCard
              title="Blockchain & Web3"
              count={24}
              icon={<MessagesSquare size={18} />}
              color="from-purple-500 to-pink-500"
              href="/communities?category=blockchain"
            />
            <CategoryCard
              title="Data Science"
              count={42}
              icon={<BookOpen size={18} />}
              color="from-green-500 to-emerald-500"
              href="/communities?category=data-science"
            />
            <CategoryCard
              title="AI & Machine Learning"
              count={28}
              icon={<Calendar size={18} />}
              color="from-amber-500 to-orange-500"
              href="/communities?category=machine-learning"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

interface Community {
  id: string;
  name: string;
  description: string;
  created_by: string;
  members_count: number;
  category?: string;
  is_private: boolean;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

function CommunityCard({
  community,
  isMember,
  onJoin,
  isProcessing,
  isTrending = false,
}: {
  community: Community;
  isMember: boolean;
  onJoin: () => void;
  isProcessing: boolean;
  isTrending?: boolean;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-none shadow-lg h-full flex flex-col">
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Users size={40} className="text-white" />
        </div>
        {isTrending && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber-500 hover:bg-amber-600">Trending</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pt-6 pb-2">
        <div className="flex justify-between items-start">
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            {community.category || "General"}
          </Badge>
          {community.is_private && (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700 border-gray-200"
            >
              <Lock size={12} className="mr-1" /> Private
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-2">{community.name}</CardTitle>
        <CardDescription className="text-gray-600">
          by{" "}
          <span className="font-medium text-gray-700">
            {community.profiles?.username || "Creator"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3">
          {community.description}
        </p>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Users size={14} className="mr-1 text-gray-400" />
            {community.members_count}{" "}
            {community.members_count === 1 ? "member" : "members"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        {isMember ? (
          <Link href={`/communities/${community.id}`} className="w-full">
            <Button variant="outline" className="w-full gap-2">
              View Community <ArrowRight size={14} />
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onJoin}
            disabled={isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isProcessing ? "Joining..." : "Join Community"}
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
            <p className="text-sm text-white/80 mb-4">{count} communities</p>
            <div className="mt-auto flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
              Browse communities <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
