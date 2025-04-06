"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Tag,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { createCourse, isLoading, error } = useCourses();
  const [activeTab, setActiveTab] = useState("basic");
  const [scrolled, setScrolled] = useState(false);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    category: "web-development",
    duration: "4 weeks",
    sections: [
      {
        title: "Introduction",
        lessons: [{ title: "Getting Started", description: "" }],
      },
    ],
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/auth");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, authLoading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      const courseId = await createCourse(courseData);
      if (courseId) {
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const addSection = () => {
    setCourseData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "New Section",
          lessons: [{ title: "New Lesson", description: "" }],
        },
      ],
    }));
  };

  interface Lesson {
    title: string;
    description: string;
  }

  interface Section {
    title: string;
    lessons: Lesson[];
  }

  const addLesson = (sectionIndex: number) => {
    setCourseData((prev) => {
      const updatedSections: Section[] = [...prev.sections];
      updatedSections[sectionIndex].lessons.push({
        title: "New Lesson",
        description: "",
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const updateSectionTitle = (index: number, title: string) => {
    setCourseData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index].title = title;
      return { ...prev, sections: updatedSections };
    });
  };

  const updateLessonTitle = (
    sectionIndex: number,
    lessonIndex: number,
    title: string
  ) => {
    setCourseData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].lessons[lessonIndex].title = title;
      return { ...prev, sections: updatedSections };
    });
  };

  const updateLessonDescription = (
    sectionIndex: number,
    lessonIndex: number,
    description: string
  ) => {
    setCourseData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].lessons[lessonIndex].description =
        description;
      return { ...prev, sections: updatedSections };
    });
  };

  const removeSection = (index: number): void => {
    setCourseData((prev) => {
      const updatedSections: Section[] = prev.sections.filter(
        (_, i) => i !== index
      );
      return { ...prev, sections: updatedSections };
    });
  };

  interface RemoveLessonParams {
    sectionIndex: number;
    lessonIndex: number;
  }

  const removeLesson = ({
    sectionIndex,
    lessonIndex,
  }: RemoveLessonParams): void => {
    setCourseData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].lessons = updatedSections[
        sectionIndex
      ].lessons.filter((_, i) => i !== lessonIndex);
      return { ...prev, sections: updatedSections };
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect has been handled in useEffect, so we don't need the isConnected check here

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4"
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create a New Course
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Share your expertise with the Learnopoly community
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg sticky top-20">
              <CardContent className="p-4">
                <Tabs
                  defaultValue="basic"
                  orientation="vertical"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full flex flex-col h-auto bg-transparent space-y-1">
                    <TabsTrigger
                      value="basic"
                      className="w-full justify-start text-sm py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
                    >
                      Basic Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="curriculum"
                      className="w-full justify-start text-sm py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
                    >
                      Curriculum
                    </TabsTrigger>
                    <TabsTrigger
                      value="pricing"
                      className="w-full justify-start text-sm py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
                    >
                      Pricing & Settings
                    </TabsTrigger>
                    <TabsTrigger
                      value="review"
                      className="w-full justify-start text-sm py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
                    >
                      Review & Publish
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>

              <div className="px-4 pb-4">
                <Separator className="mb-4" />
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-xs text-amber-700">
                    Our guide on creating engaging courses is available to help
                    you build a successful learning experience.
                  </p>
                  <Button
                    variant="link"
                    className="text-amber-800 p-0 h-auto mt-2 text-xs"
                  >
                    View Course Creation Guide
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  Fill out the information below to create your course
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                {/* Important: The Tabs component needs to wrap the TabsContent components */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="basic" className="m-0">
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={courseData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Introduction to Blockchain Development"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Course Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={courseData.description}
                          onChange={handleInputChange}
                          placeholder="Provide a detailed description of your course..."
                          rows={6}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="level">Difficulty Level</Label>
                          <Select
                            value={courseData.level}
                            onValueChange={(value) =>
                              handleSelectChange("level", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={courseData.category}
                            onValueChange={(value) =>
                              handleSelectChange("category", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="web-development">
                                Web Development
                              </SelectItem>
                              <SelectItem value="blockchain">
                                Blockchain & Web3
                              </SelectItem>
                              <SelectItem value="data-science">
                                Data Science
                              </SelectItem>
                              <SelectItem value="machine-learning">
                                AI & Machine Learning
                              </SelectItem>
                              <SelectItem value="mobile-development">
                                Mobile Development
                              </SelectItem>
                              <SelectItem value="devops">
                                DevOps & Cloud
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Course Duration</Label>
                        <Select
                          value={courseData.duration}
                          onValueChange={(value) =>
                            handleSelectChange("duration", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                            <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="4 weeks">4 weeks</SelectItem>
                            <SelectItem value="8+ weeks">8+ weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Course Thumbnail</Label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <div className="mx-auto flex flex-col items-center">
                            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-3">
                              Drag and drop an image, or click to browse
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Upload size={14} />
                              Upload Image
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="curriculum" className="m-0">
                    <CardContent className="space-y-6">
                      <div className="space-y-6">
                        {courseData.sections.map((section, sIndex) => (
                          <div
                            key={sIndex}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 p-4 flex justify-between items-center">
                              <div className="flex-1">
                                <Input
                                  value={section.title}
                                  onChange={(e) =>
                                    updateSectionTitle(sIndex, e.target.value)
                                  }
                                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base font-medium"
                                  placeholder="Section title"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSection(sIndex)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>

                            <div className="p-4 space-y-3">
                              {section.lessons.map((lesson, lIndex) => (
                                <div
                                  key={lIndex}
                                  className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md"
                                >
                                  <div className="flex items-center justify-between">
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) =>
                                        updateLessonTitle(
                                          sIndex,
                                          lIndex,
                                          e.target.value
                                        )
                                      }
                                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                                      placeholder="Lesson title"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeLesson({
                                          sectionIndex: sIndex,
                                          lessonIndex: lIndex,
                                        })
                                      }
                                      className="text-gray-500 hover:text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={lesson.description}
                                    onChange={(e) =>
                                      updateLessonDescription(
                                        sIndex,
                                        lIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Lesson description (optional)"
                                    className="text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-0 h-10"
                                  />
                                </div>
                              ))}

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addLesson(sIndex)}
                                className="mt-3 w-full gap-2"
                              >
                                <Plus size={14} />
                                Add Lesson
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={addSection}
                          className="w-full gap-2"
                        >
                          <Plus size={16} />
                          Add Section
                        </Button>
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="pricing" className="m-0">
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Course Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="pl-8"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Leave at 0 for a free course
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="isPublished">Publish Status</Label>
                          <Select defaultValue="draft">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">
                                Draft (Save Now, Publish Later)
                              </SelectItem>
                              <SelectItem value="published">
                                Published (Available Immediately)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-800">
                        <h3 className="text-sm font-medium mb-2">
                          Publishing Information
                        </h3>
                        <p className="text-xs">
                          Draft courses can be previewed and edited before
                          making them available to students. Published courses
                          will be immediately visible in search results and the
                          course catalog.
                        </p>
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="review" className="m-0">
                    <CardContent className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {courseData.title || "Course Title"}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">
                              {courseData.level}
                            </span>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {courseData.duration}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">
                          {courseData.description ||
                            "Course description will appear here."}
                        </p>
                        <div>
                          <h4 className="font-medium mb-2">
                            Curriculum Overview
                          </h4>
                          <ul className="space-y-2">
                            {courseData.sections.map((section, i) => (
                              <li key={i}>
                                <div className="font-medium">
                                  {section.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {section.lessons.length} lesson
                                  {section.lessons.length !== 1 ? "s" : ""}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-amber-800">
                        <h3 className="text-sm font-medium mb-2">
                          Ready to Publish?
                        </h3>
                        <p className="text-xs mb-2">
                          Before publishing your course, please review all
                          details carefully. Once published, your course will be
                          available to students.
                        </p>
                        <p className="text-xs font-medium">
                          By publishing, you confirm that all content is your
                          original work or you have permission to use it.
                        </p>
                      </div>
                    </CardContent>
                  </TabsContent>
                </Tabs>

                <CardFooter className="justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/courses")}
                  >
                    Cancel
                  </Button>

                  <div className="flex gap-3">
                    {activeTab !== "basic" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const tabs = [
                            "basic",
                            "curriculum",
                            "pricing",
                            "review",
                          ];
                          const currentIndex = tabs.indexOf(activeTab);
                          setActiveTab(tabs[currentIndex - 1]);
                        }}
                      >
                        Previous
                      </Button>
                    )}

                    {activeTab !== "review" ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const tabs = [
                            "basic",
                            "curriculum",
                            "pricing",
                            "review",
                          ];
                          const currentIndex = tabs.indexOf(activeTab);
                          setActiveTab(tabs[currentIndex + 1]);
                        }}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !courseData.title ||
                          !courseData.description
                        }
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save size={16} />
                        {isLoading ? "Creating..." : "Publish Course"}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
