"use client";

import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  User,
  BookOpen,
  Settings,
  MessageSquare,
  Globe,
  Search,
  Menu as MenuIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

const navigation = [
  { name: "Feed", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Network", href: "/network" },
  { name: "Communities", href: "/communities" },
];

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navigation({ scrolled = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [showSearch, setShowSearch] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const navClasses = scrolled
    ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800"
    : "bg-transparent";

  return (
    <Disclosure
      as="nav"
      className={`sticky top-0 z-40 transition-all duration-200 ${navClasses}`}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="flex-shrink-0 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                >
                  Learnopoly
                </Link>
                <div className="hidden sm:ml-10 sm:block">
                  <div className="flex space-x-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? "bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 max-w-lg mx-4 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for courses, people, topics..."
                    className="pl-9 bg-gray-50 border-gray-200 w-full dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-center">
                {/* Mobile search toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </Button>

                {user ? (
                  <>
                    {/* Notifications */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative"
                        >
                          <Bell
                            size={20}
                            className="text-gray-600 dark:text-gray-300"
                          />
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <div className="flex items-center justify-between p-2 border-b">
                          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAllAsRead()}
                              className="text-xs text-indigo-600 h-auto py-1"
                            >
                              Mark all as read
                            </Button>
                          )}
                        </div>
                        <DropdownMenuSeparator />
                        <div className="max-h-96 overflow-y-auto">
                          {notifications && notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`flex gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${
                                  !notification.is_read
                                    ? "bg-indigo-50 dark:bg-gray-800/60"
                                    : ""
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div
                                  className={`rounded-full h-2 w-2 mt-2 flex-shrink-0 ${
                                    !notification.is_read
                                      ? "bg-indigo-600"
                                      : "bg-transparent"
                                  }`}
                                ></div>
                                <div className="flex-1">
                                  <p className="text-sm">
                                    {notification.content}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      notification.created_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No notifications
                            </div>
                          )}
                        </div>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center text-indigo-600"
                          onClick={() => router.push("/notifications")}
                        >
                          View all notifications
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User menu */}
                    <Menu as="div" className="relative ml-3">
                      <Menu.Button className="relative flex rounded-full bg-white dark:bg-gray-800 p-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                            {profile?.username
                              ?.substring(0, 2)
                              ?.toUpperCase() ||
                              user?.email?.substring(0, 2)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium">
                              {profile?.username || "User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/profile"
                                className={classNames(
                                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                                )}
                              >
                                <User
                                  size={16}
                                  className="mr-3 text-gray-400"
                                />
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/courses"
                                className={classNames(
                                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                                )}
                              >
                                <BookOpen
                                  size={16}
                                  className="mr-3 text-gray-400"
                                />
                                My Courses
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/messages"
                                className={classNames(
                                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                                )}
                              >
                                <MessageSquare
                                  size={16}
                                  className="mr-3 text-gray-400"
                                />
                                Messages
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/settings"
                                className={classNames(
                                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                                )}
                              >
                                <Settings
                                  size={16}
                                  className="mr-3 text-gray-400"
                                />
                                Settings
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleSignOut}
                                className={classNames(
                                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full"
                                )}
                              >
                                <LogOut
                                  size={16}
                                  className="mr-3 text-gray-400"
                                />
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <Button
                    onClick={() => router.push("/auth")}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Sign In
                  </Button>
                )}

                {/* Mobile menu button */}
                <div className="sm:hidden ml-3">
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          {showSearch && (
            <div className="px-4 py-3 sm:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for courses, people, topics..."
                  className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
                />
              </div>
            </div>
          )}

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Disclosure.Button
                    as="div"
                    className={classNames(
                      pathname === item.href
                        ? "bg-indigo-50 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium transition-colors"
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
