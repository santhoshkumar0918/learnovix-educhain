"use client";

import { useReadContract, useWriteContract } from "wagmi";
import LearnopolyABI from "@/lib/LearnopolyABI.json";
import { LEARNOPOLY_CONTRACT_ADDRESS } from "@/components/Web3Provider";

export function useLearnopolyContract() {
  const { writeContract, isPending, isSuccess, isError } = useWriteContract();

  // Create profile
  const createProfile = (username: string, bio: string, skills: string[]) => {
    return writeContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "createProfile",
      args: [username, bio, skills],
    });
  };

  // Create course
  const createCourse = (title: string, description: string) => {
    return writeContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "createCourse",
      args: [title, description],
    });
  };

  // Enroll in course
  const enrollInCourse = (courseId: number) => {
    return writeContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "enrollInCourse",
      args: [courseId],
    });
  };

  // Get course count
  const useCourseCount = () => {
    return useReadContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "courseCount",
    });
  };

  // Get course details
  const useCourseDetails = (courseId: number) => {
    return useReadContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "courses",
      args: [courseId],
    });
  };

  // Get user profile
  const useUserProfile = (address: `0x${string}` | undefined) => {
    return useReadContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "profiles",
      args: address ? [address] : undefined,
      ...(address ? { args: [address] } : {}),
    });
  };

  // Get user enrollments
  const useUserEnrollments = (address: `0x${string}` | undefined) => {
    return useReadContract({
      address: LEARNOPOLY_CONTRACT_ADDRESS,
      abi: LearnopolyABI,
      functionName: "getUserEnrollments",
      args: address ? [address] : undefined,
      ...(address ? { args: [address] } : {}),
    });
  };

  return {
    createProfile,
    createCourse,
    enrollInCourse,
    useCourseCount,
    useCourseDetails,
    useUserProfile,
    useUserEnrollments,
    isPending,
    isSuccess,
    isError,
  };
}
