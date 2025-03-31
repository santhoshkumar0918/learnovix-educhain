"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { mockProfiles } from "@/lib/mock-data";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get unique skills across all profiles
  const allSkills = [
    ...new Set(mockProfiles.flatMap((profile) => profile.skills)),
  ].sort();

  const filteredProfiles = mockProfiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (filterSkill === "all") return matchesSearch;
    return matchesSearch && profile.skills.includes(filterSkill);
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-5">
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
                <Select value={filterSkill} onValueChange={setFilterSkill}>
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
              </div>
            </div>
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
                value="recommended"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                Recommended
              </TabsTrigger>
              <TabsTrigger
                value="mynetwork"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                My Network
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommended" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.slice(0, 3).map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mynetwork" className="m-0">
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
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Find Connections
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

interface Profile {
  id: number;
  name: string;
  title: string;
  location: string;
  connections: number;
  about: string;
  skills: string[];
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-none shadow-lg">
      <CardHeader className="p-0">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
          <div className="absolute -bottom-10 left-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              <AvatarFallback className="bg-white text-indigo-600 text-xl font-bold">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-12 px-6">
        <div className="mb-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {profile.name}
          </h3>
          <p className="text-gray-600 flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-400" />
            {profile.title}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{profile.connections} connections</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-gray-600 text-sm">{profile.about}</p>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-indigo-50 text-indigo-600"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 border-t border-gray-100 flex gap-3">
        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          <UserPlus size={16} className="mr-2" />
          Connect
        </Button>
        <Button variant="outline" className="flex-1">
          <MessageSquare size={16} className="mr-2" />
          Message
        </Button>
      </CardFooter>
    </Card>
  );
}
