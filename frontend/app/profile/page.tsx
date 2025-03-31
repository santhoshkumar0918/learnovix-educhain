"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import { mockCourses } from "@/lib/mock-data";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi";
import { useLearnopolyContract } from "@/hooks/useLearnopolyContract";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { createProfile, isPending, useUserProfile } = useLearnopolyContract();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "User",
    bio: "Tech enthusiast interested in blockchain and AI",
    skills: ["JavaScript", "React", "Solidity"],
  });

  // Mock enrolled courses (in a real app, we'd get this from the contract)
  const enrolledCourses = mockCourses.slice(0, 3);

  // Profile data from contract (will be undefined if not connected or profile doesn't exist)
  const { data: profileData } = useUserProfile(address);

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
      <main className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Connect Your Wallet
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please connect your wallet to view your profile and access all
              features.
            </p>
            <button
              onClick={handleConnectWallet}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="relative h-48 sm:h-64 bg-indigo-700 rounded-t-lg">
            <div className="absolute bottom-0 left-0 w-full p-6 pb-24 sm:pb-24">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-4xl font-bold">
                  {profileData?.username
                    ? profileData.username.substring(0, 2).toUpperCase()
                    : address?.substring(2, 4)}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pt-16 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData?.username || "Anonymous User"}
                </h1>
                <p className="text-sm text-gray-500">{address}</p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {profileData?.username ? "Edit Profile" : "Create Profile"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">About</h2>
              {!isEditing ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {profileData?.bio || formData.bio}
                  </p>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(profileData?.skills || formData.skills).map(
                        (skill: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="skills"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      value={formData.skills.join(", ")}
                      onChange={handleSkillsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateProfile}
                      disabled={isPending}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isPending ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Stats</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Reputation
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    {profileData?.reputation || "0"}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Courses</dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    {enrolledCourses.length}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Posts</dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    12
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Connections
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    48
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                      activeTab === "courses"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                      activeTab === "posts"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab("connections")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                      activeTab === "connections"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Connections
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "courses" && (
                  <div className="space-y-6">
                    {enrolledCourses.length > 0 ? (
                      enrolledCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex flex-col sm:flex-row gap-4 sm:items-center pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className="sm:flex-shrink-0 h-16 w-16 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {course.instructor} • {course.level}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: "35%" }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              35% complete
                            </p>
                          </div>
                          <div className="sm:flex-shrink-0">
                            <button className="w-full sm:w-auto px-4 py-2 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                              Continue
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                          No courses enrolled yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start learning by enrolling in a course.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Browse Courses
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "posts" && (
                  <div className="text-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No posts yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Share your thoughts and insights with the community.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Create Post
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "connections" && (
                  <div className="text-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No connections yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Connect with other professionals to grow your network.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Find Connections
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
