"use client";

import Navigation from "@/components/Navigation";
import { mockNewsFeed, mockCourses } from "../lib/mock-data";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Feed */}
          <div className="md:w-2/3">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Tech News Feed
            </h1>

            <div className="space-y-6">
              {mockNewsFeed.map((post) => (
                <div key={post.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {post.author.substring(0, 2)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {post.author}
                      </p>
                      <p className="text-xs text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <button className="flex items-center hover:text-indigo-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      {post.likes}
                    </button>
                    <button className="flex items-center hover:text-indigo-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {post.comments}
                    </button>
                    <button className="flex items-center hover:text-indigo-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Trending Courses
              </h2>
              <div className="space-y-4">
                {mockCourses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block group"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
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
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.instructor} • {course.level}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/courses"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View all courses →
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Join the Conversation
              </h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-1 mr-2">
                    #blockchain
                  </span>
                  <span className="text-sm text-gray-600">
                    348 active discussions
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-1 mr-2">
                    #machinelearning
                  </span>
                  <span className="text-sm text-gray-600">
                    275 active discussions
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-1 mr-2">
                    #webdev
                  </span>
                  <span className="text-sm text-gray-600">
                    412 active discussions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
