import { expect } from "chai";
import { ethers } from "hardhat";
import { Learnopoly } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Learnopoly", function () {
  let learnopolyContract: Learnopoly;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const LearnopolyFactory = await ethers.getContractFactory("Learnopoly");
    learnopolyContract = await LearnopolyFactory.deploy();
    await learnopolyContract.waitForDeployment();
  });

  describe("Profile Management", function () {
    it("Should create a user profile", async function () {
      const username = "testuser";
      const bio = "Test bio";
      const skills = ["JavaScript", "Solidity"];

      await learnopolyContract
        .connect(user1)
        .createProfile(username, bio, skills);

      const profile = await learnopolyContract.profiles(user1.address);

      expect(profile.username).to.equal(username);
      expect(profile.bio).to.equal(bio);
      expect(profile.reputation).to.equal(0);
      expect(profile.exists).to.equal(true);
    });

    it("Should not allow creating duplicate profiles", async function () {
      await learnopolyContract
        .connect(user1)
        .createProfile("user1", "Bio 1", ["Skill1"]);

      await expect(
        learnopolyContract
          .connect(user1)
          .createProfile("user1_new", "New bio", ["Skill2"])
      ).to.be.revertedWith("Profile already exists");
    });

    it("Should update a user profile", async function () {
      // Create profile
      await learnopolyContract
        .connect(user1)
        .createProfile("initial", "Initial bio", ["Skill1"]);

      // Update profile
      const updatedUsername = "updated";
      const updatedBio = "Updated bio";
      const updatedSkills = ["Skill1", "Skill2", "Skill3"];

      await learnopolyContract
        .connect(user1)
        .updateProfile(updatedUsername, updatedBio, updatedSkills);

      const profile = await learnopolyContract.profiles(user1.address);

      expect(profile.username).to.equal(updatedUsername);
      expect(profile.bio).to.equal(updatedBio);
    });
  });

  describe("Course Management", function () {
    beforeEach(async function () {
      // Create profiles for users
      await learnopolyContract
        .connect(user1)
        .createProfile("teacher", "I teach", ["Teaching"]);
      await learnopolyContract
        .connect(user2)
        .createProfile("student", "I learn", ["Learning"]);
    });

    it("Should create a course", async function () {
      const title = "Blockchain 101";
      const description = "Introduction to blockchain technology";

      await learnopolyContract.connect(user1).createCourse(title, description);

      const courseId = 0; // First course has ID 0
      const course = await learnopolyContract.courses(courseId);

      expect(course.title).to.equal(title);
      expect(course.description).to.equal(description);
      expect(course.creator).to.equal(user1.address);
      expect(course.enrollmentCount).to.equal(0);
      expect(course.exists).to.equal(true);
    });

    it("Should allow users to enroll in courses", async function () {
      // Create a course
      await learnopolyContract
        .connect(user1)
        .createCourse("Course Title", "Description");

      // User2 enrolls in the course
      await learnopolyContract.connect(user2).enrollInCourse(0);

      // Check enrollment
      const enrollments = await learnopolyContract.getUserEnrollments(
        user2.address
      );
      expect(enrollments.length).to.equal(1);
      expect(enrollments[0]).to.equal(0);

      // Check course enrollment count
      const course = await learnopolyContract.courses(0);
      expect(course.enrollmentCount).to.equal(1);
    });
  });

  describe("Social Features", function () {
    beforeEach(async function () {
      // Create profiles
      await learnopolyContract
        .connect(user1)
        .createProfile("user1", "Bio 1", ["Skill1"]);
      await learnopolyContract
        .connect(user2)
        .createProfile("user2", "Bio 2", ["Skill2"]);
    });

    it("Should create a post", async function () {
      const content = "Hello Learnopoly!";

      await learnopolyContract.connect(user1).createPost(content);

      // Get post count
      const postCount = await learnopolyContract.getPostCount();
      expect(postCount).to.equal(1);

      // Get post
      const post = await learnopolyContract.posts(0);
      expect(post.content).to.equal(content);
      expect(post.author).to.equal(user1.address);
      expect(post.likes).to.equal(0);
    });

    it("Should like a post", async function () {
      // Create a post
      await learnopolyContract.connect(user1).createPost("Test post");

      // User2 likes the post
      await learnopolyContract.connect(user2).likePost(0);

      // Check post likes
      const post = await learnopolyContract.posts(0);
      expect(post.likes).to.equal(1);
    });

    it("Should connect users", async function () {
      // User1 connects with User2
      await learnopolyContract.connect(user1).addConnection(user2.address);

      // Check connections
      const user1Connections = await learnopolyContract.getUserConnections(
        user1.address
      );
      const user2Connections = await learnopolyContract.getUserConnections(
        user2.address
      );

      expect(user1Connections.length).to.equal(1);
      expect(user1Connections[0]).to.equal(user2.address);

      expect(user2Connections.length).to.equal(1);
      expect(user2Connections[0]).to.equal(user1.address);
    });

    it("Should not allow connecting with yourself", async function () {
      await expect(
        learnopolyContract.connect(user1).addConnection(user1.address)
      ).to.be.revertedWith("Cannot connect with yourself");
    });
  });

  describe("Reputation System", function () {
    beforeEach(async function () {
      await learnopolyContract
        .connect(user1)
        .createProfile("user1", "Bio 1", ["Skill1"]);
    });

    it("Should increase user reputation", async function () {
      const reputationAmount = 10;

      await learnopolyContract.increaseReputation(
        user1.address,
        reputationAmount
      );

      const profile = await learnopolyContract.profiles(user1.address);
      expect(profile.reputation).to.equal(reputationAmount);
    });
  });
});
