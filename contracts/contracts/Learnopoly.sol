// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;


/**

 * @title Learnopoly

 * @dev A platform for tech enthusiasts to learn, connect and grow together

 */

contract Learnopoly {

    // Structure for a user profile

    struct UserProfile {

        string username;

        string bio;

        string[] skills;

        uint256 reputation;

        bool exists;

    }

    

    // Structure for a course

    struct Course {

        string title;

        string description;

        address creator;

        uint256 enrollmentCount;

        bool exists;

    }

    

    // Structure for a post/update in the feed

    struct Post {

        string content;

        address author;

        uint256 timestamp;

        uint256 likes;

    }

    

    // Mapping from address to user profile

    mapping(address => UserProfile) public profiles;

    

    // Mapping of course ID to course

    mapping(uint256 => Course) public courses;

    

    // Mapping of user address to courses they're enrolled in

    mapping(address => uint256[]) public enrollments;

    

    // Mapping of addresses that a user is connected with

    mapping(address => address[]) public connections;

    

    // Array of all posts

    Post[] public posts;

    

    // Array of all users

    address[] public users;

    

    // Course counter

    uint256 public courseCount;

    

    // Events

    event ProfileCreated(address indexed user, string username);

    event ProfileUpdated(address indexed user, string username);

    event CourseCreated(uint256 indexed courseId, string title, address creator);

    event CourseEnrolled(address indexed user, uint256 indexed courseId);

    event ReputationIncreased(address indexed user, uint256 newReputation);

    event ConnectionAdded(address indexed user, address indexed connection);

    event PostCreated(address indexed author, uint256 indexed postId);

    event PostLiked(address indexed user, uint256 indexed postId);

    

    /**

     * @dev Create a new user profile

     * @param _username Username for the profile

     * @param _bio Short biography

     * @param _skills Array of skills

     */

    function createProfile(string memory _username, string memory _bio, string[] memory _skills) public {

        require(!profiles[msg.sender].exists, "Profile already exists");

        

        profiles[msg.sender] = UserProfile({

            username: _username,

            bio: _bio,

            skills: _skills,

            reputation: 0,

            exists: true

        });

        

        users.push(msg.sender);

        emit ProfileCreated(msg.sender, _username);

    }

    

    /**

     * @dev Update an existing user profile

     * @param _username New username

     * @param _bio New biography

     * @param _skills New array of skills

     */

    function updateProfile(string memory _username, string memory _bio, string[] memory _skills) public {

        require(profiles[msg.sender].exists, "Profile doesn't exist");

        

        profiles[msg.sender].username = _username;

        profiles[msg.sender].bio = _bio;

        profiles[msg.sender].skills = _skills;

        

        emit ProfileUpdated(msg.sender, _username);

    }

    

    /**

     * @dev Create a new course

     * @param _title Course title

     * @param _description Course description

     */

    function createCourse(string memory _title, string memory _description) public {

        require(profiles[msg.sender].exists, "Profile doesn't exist");

        

        uint256 courseId = courseCount;

        courses[courseId] = Course({

            title: _title,

            description: _description,

            creator: msg.sender,

            enrollmentCount: 0,

            exists: true

        });

        

        courseCount++;

        emit CourseCreated(courseId, _title, msg.sender);

    }

    

    /**

     * @dev Enroll in a course

     * @param _courseId ID of the course

     */

    function enrollInCourse(uint256 _courseId) public {

        require(profiles[msg.sender].exists, "Profile doesn't exist");

        require(courses[_courseId].exists, "Course doesn't exist");

        

        enrollments[msg.sender].push(_courseId);

        courses[_courseId].enrollmentCount++;

        

        emit CourseEnrolled(msg.sender, _courseId);

    }

    

    /**

     * @dev Create a new post

     * @param _content Content of the post

     */

    function createPost(string memory _content) public {

        require(profiles[msg.sender].exists, "Profile doesn't exist");

        

        posts.push(Post({

            content: _content,

            author: msg.sender,

            timestamp: block.timestamp,

            likes: 0

        }));

        

        emit PostCreated(msg.sender, posts.length - 1);

    }

    

    /**

     * @dev Like a post

     * @param _postId ID of the post

     */

    function likePost(uint256 _postId) public {

        require(profiles[msg.sender].exists, "Profile doesn't exist");

        require(_postId < posts.length, "Post doesn't exist");

        

        posts[_postId].likes++;

        

        emit PostLiked(msg.sender, _postId);

    }

    

    /**

     * @dev Add a connection (similar to LinkedIn)

     * @param _connection Address to connect with

     */

    function addConnection(address _connection) public {

        require(profiles[msg.sender].exists, "Your profile doesn't exist");

        require(profiles[_connection].exists, "Connection profile doesn't exist");

        require(msg.sender != _connection, "Cannot connect with yourself");

        

        bool connectionExists = false;

        for (uint256 i = 0; i < connections[msg.sender].length; i++) {

            if (connections[msg.sender][i] == _connection) {

                connectionExists = true;

                break;

            }

        }

        

        require(!connectionExists, "Connection already exists");

        

        connections[msg.sender].push(_connection);

        connections[_connection].push(msg.sender);

        

        emit ConnectionAdded(msg.sender, _connection);

    }

    

    /**

     * @dev Increase a user's reputation (simplification - in a real app this would have more controls)

     * @param _user Address of the user

     * @param _amount Amount to increase

     */

    function increaseReputation(address _user, uint256 _amount) public {

        // In a real app, this would have access controls

        require(profiles[_user].exists, "Profile doesn't exist");

        

        profiles[_user].reputation += _amount;

        emit ReputationIncreased(_user, profiles[_user].reputation);

    }

    

    /**

     * @dev Get all courses a user is enrolled in

     * @param _user Address of the user

     * @return Array of course IDs

     */

    function getUserEnrollments(address _user) public view returns (uint256[] memory) {

        return enrollments[_user];

    }

    

    /**

     * @dev Get all connections of a user

     * @param _user Address of the user

     * @return Array of connection addresses

     */

    function getUserConnections(address _user) public view returns (address[] memory) {

        return connections[_user];

    }

    

    /**

     * @dev Get user count

     * @return Number of users

     */

    function getUserCount() public view returns (uint256) {

        return users.length;

    }

    

    /**

     * @dev Get post count

     * @return Number of posts

     */

    function getPostCount() public view returns (uint256) {

        return posts.length;

    }

}