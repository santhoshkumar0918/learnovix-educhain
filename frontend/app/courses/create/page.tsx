"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useLearnopolyContract } from "@/hooks/useLearnopolyContract";

export default function CreateCoursePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createCourse, isPending, isSuccess } = useLearnopolyContract();

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet to create a course");
      return;
    }

    createCourse(courseData.title, courseData.description);
  };

  // Redirect if not connected
  if (!isConnected) {
    router.push("/courses");
    return null;
  }

  // Redirect after successful creation
  if (isSuccess) {
    router.push("/courses");
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Create a New Course
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Share your expertise with the Learnopoly community
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Introduction to Blockchain Development"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={6}
                  value={courseData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Provide a detailed description of your course..."
                />
              </div>

              {/* This would normally have more fields but keeping it simple for this demo */}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/courses")}
                  className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isPending || !courseData.title || !courseData.description
                  }
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create Course"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
