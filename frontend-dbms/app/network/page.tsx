"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Users,
  Briefcase,
  Search,
  Filter,
  MessageSquare,
  UserPlus,
  Globe,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NetworkPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    searchProfiles,
    getConnections,
    getConnectionRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    isLoading,
    error,
  } = useProfiles();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [processingConnect, setProcessingConnect] = useState<Set<string>>(
    new Set()
  );
  const [processingRequest, setProcessingRequest] = useState<Set<string>>(
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
    loadProfiles();
    if (user) {
      loadConnections();
      loadConnectionRequests();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      let skills = undefined;
      if (filterSkill !== "all") {
        skills = [filterSkill];
      }

      const data = await searchProfiles(searchTerm, { skills });
      // Filter out the current user
      const filtered = data.filter((profile: any) => profile.id !== user?.id);
      setProfiles(filtered || []);
    } catch (err) {
      console.error("Error loading profiles:", err);
    }
  };

  const loadConnections = async () => {
    try {
      const data = await getConnections();
      setConnections(data || []);
    } catch (err) {
      console.error("Error loading connections:", err);
    }
  };

  const loadConnectionRequests = async () => {
    try {
      const data = await getConnectionRequests();
      setConnectionRequests(data || []);
    } catch (err) {
      console.error("Error loading connection requests:", err);
    }
  };

  const handleConnect = async (profileId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setProcessingConnect((prev) => new Set(prev).add(profileId));

    try {
      const success = await sendConnectionRequest(profileId);
      if (success) {
        // Refresh data
        loadProfiles();
      }
    } catch (err) {
      console.error("Error sending connection request:", err);
    } finally {
      setProcessingConnect((prev) => {
        const updated = new Set(prev);
        updated.delete(profileId);
        return updated;
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest((prev) => new Set(prev).add(requestId));

    try {
      const success = await acceptConnectionRequest(requestId);
      if (success) {
        // Refresh data
        loadConnectionRequests();
        loadConnections();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setProcessingRequest((prev) => {
        const updated = new Set(prev);
        updated.delete(requestId);
        return updated;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest((prev) => new Set(prev).add(requestId));

    try {
      const success = await rejectConnectionRequest(requestId);
      if (success) {
        // Refresh data
        loadConnectionRequests();
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setProcessingRequest((prev) => {
        const updated = new Set(prev);
        updated.delete(requestId);
        return updated;
      });
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterSkill(value);
    loadProfiles();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProfiles();
  };

  // Get unique skills across all profiles
  const allSkills = [
    ...new Set(profiles.flatMap((profile) => profile.skills || [])),
  ].sort();

  const isConnected = (profileId: string) => {
    return connections.some((conn) => conn.profile?.id === profileId);
  };

  const isPendingRequest = (profileId: string) => {
    // Check if there's a pending outbound request
    return false; // This would need to be implemented with actual data
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation scrolled={scrolled} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-12 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Connect with Tech Professionals
            </h1>
            <p className="text-lg text-indigo-100 mb-6">
              Expand your network, find mentors, and collaborate with
              like-minded tech enthusiasts.
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
                    placeholder="Search professionals by name, title, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 w-full"
                  />
                </div>
                <Select value={filterSkill} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all">All Skills</SelectItem>
                    {allSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
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
        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                All Professionals
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                My Network
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                Requests
                {connectionRequests.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                    {connectionRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Location</DropdownMenuItem>
                <DropdownMenuItem>Industry</DropdownMenuItem>
                <DropdownMenuItem>Experience Level</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsContent value="all" className="m-0">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
                <AlertCircle size={18} className="mr-2" />
                <p>Failed to load profiles. Please try again later.</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No profiles found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || filterSkill !== "all"
                    ? "Try adjusting your search criteria"
                    : "No professionals available at the moment."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    isConnected={isConnected(profile.id)}
                    isPending={isPendingRequest(profile.id)}
                    onConnect={() => handleConnect(profile.id)}
                    isProcessing={processingConnect.has(profile.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="network" className="m-0">
            {!user ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-700 my-8">
                <p className="text-center">
                  Please sign in to see your network
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Your network is empty
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start connecting with professionals to build your network.
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
                  Find Connections
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((connection) => (
                  <ProfileCard
                    key={connection.id}
                    profile={connection.profile}
                    isConnected={true}
                    isPending={false}
                    onConnect={() => {}}
                    isProcessing={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="m-0">
            {!user ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-700 my-8">
                <p className="text-center">
                  Please sign in to see connection requests
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : connectionRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No pending connection requests
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  When someone wants to connect with you, you'll see their
                  request here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connectionRequests.map((request) => (
                  <Card key={request.id} className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={request.user_profile?.avatar_url}
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {request.user_profile?.username
                                ?.substring(0, 2)
                                ?.toUpperCase() || "US"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {request.user_profile?.username}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {request.user_profile?.bio?.substring(0, 60) ||
                                "Tech professional"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={processingRequest.has(request.id)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {processingRequest.has(request.id) ? (
                              <Loader2
                                size={14}
                                className="animate-spin mr-1"
                              />
                            ) : (
                              <Check size={14} className="mr-1" />
                            )}
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingRequest.has(request.id)}
                            variant="outline"
                            size="sm"
                          >
                            <X size={14} className="mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

interface Profile {
  id: string;
  username: string;
  bio?: string;
  location?: string;
  skills?: string[];
  avatar_url?: string;
}

function ProfileCard({
  profile,
  isConnected,
  isPending,
  onConnect,
  isProcessing,
}: {
  profile: Profile;
  isConnected: boolean;
  isPending: boolean;
  onConnect: () => void;
  isProcessing: boolean;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-none shadow-lg">
      <CardHeader className="p-0">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
          <div className="absolute -bottom-10 left-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-white text-indigo-600 text-xl font-bold">
                {profile.username
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-12 px-6">
        <div className="mb-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {profile.username}
          </h3>
          <p className="text-gray-600 flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-400" />
            {profile.bio?.split(" ").slice(0, 5).join(" ") ||
              "Tech Professional"}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-indigo-50 text-indigo-600"
                >
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 3 && (
                <Badge variant="outline" className="text-gray-500">
                  +{profile.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 border-t border-gray-100 flex gap-3">
        {isConnected ? (
          <Button variant="outline" className="flex-1">
            <MessageSquare size={16} className="mr-2" />
            Message
          </Button>
        ) : isPending ? (
          <Button variant="outline" disabled className="flex-1">
            Request Sent
          </Button>
        ) : (
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            onClick={onConnect}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <UserPlus size={16} className="mr-2" />
                Connect
              </>
            )}
          </Button>
        )}
        <Button
          variant={isConnected ? "default" : "outline"}
          className={
            isConnected ? "flex-1 bg-indigo-600 hover:bg-indigo-700" : "flex-1"
          }
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
