import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Button, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { FaUserEdit, FaUserPlus, FaUserMinus, FaBlog, FaUsers, FaUserFriends } from 'react-icons/fa';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import AuthContext from '../context/AuthContext';
import { userAPI, blogAPI } from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('blogs');
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 6
  });
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserProfile(id);
        
        if (response.success) {
          setProfile(response.user);
          
          // Check if current user is following this profile
          if (isAuthenticated) {
            const followingResponse = await userAPI.getUserFollowing(user.id);
            if (followingResponse.success) {
              const isAlreadyFollowing = followingResponse.following.some(
                followedUser => followedUser.id === parseInt(id)
              );
              setIsFollowing(isAlreadyFollowing);
            }
          }
        } else {
          setError('Failed to load user profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, isAuthenticated]);
  
  // Fetch user blogs
  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (activeTab !== 'blogs') return;
      
      try {
        setBlogsLoading(true);
        const response = await blogAPI.getBlogsByUserId(id, page, 6);
        
        if (response.success) {
          setBlogs(response.blogs);
          setPagination(response.pagination);
        }
      } catch (err) {
        console.error('Error fetching user blogs:', err);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchUserBlogs();
  }, [id, page, activeTab]);
  
  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      if (activeTab !== 'followers') return;
      
      try {
        const response = await userAPI.getUserFollowers(id);
        
        if (response.success) {
          setFollowers(response.followers);
        }
      } catch (err) {
        console.error('Error fetching followers:', err);
      }
    };

    if (profile) {
      fetchFollowers();
    }
  }, [id, profile, activeTab]);
  
  // Fetch following
  useEffect(() => {
    const fetchFollowing = async () => {
      if (activeTab !== 'following') return;
      
      try {
        const response = await userAPI.getUserFollowing(id);
        
        if (response.success) {
          setFollowing(response.following);
        }
      } catch (err) {
        console.error('Error fetching following:', err);
      }
    };

    if (profile) {
      fetchFollowing();
    }
  }, [id, profile, activeTab]);
  
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(id);
        setIsFollowing(false);
        // Update follower count
        setProfile({
          ...profile,
          followerCount: profile.followerCount - 1
        });
      } else {
        await userAPI.followUser(id);
        setIsFollowing(true);
        // Update follower count
        setProfile({
          ...profile,
          followerCount: profile.followerCount + 1
        });
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
    }
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }
  
  if (error || !profile) {
    return <Alert variant="danger">{error || 'User not found'}</Alert>;
  }
  
  return (
    <div>
      <div className="profile-header mb-4">
        <Row>
          <Col md={9}>
            <h1 className="mb-3">{profile.username}'s Profile</h1>
            <p className="text-muted">Member since {formatDate(profile.created_at)}</p>
          </Col>
          <Col md={3} className="text-md-end">
            {isAuthenticated && user.id !== parseInt(id) && (
              <Button 
                variant={isFollowing ? "outline-danger" : "outline-primary"} 
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <FaUserMinus className="me-1" /> Unfollow
                  </>
                ) : (
                  <>
                    <FaUserPlus className="me-1" /> Follow
                  </>
                )}
              </Button>
            )}
            {isAuthenticated && user.id === parseInt(id) && (
              <Button variant="outline-primary" as={Link} to="/edit-profile">
                <FaUserEdit className="me-1" /> Edit Profile
              </Button>
            )}
          </Col>
        </Row>
        
        <Row className="mt-4">
          <Col md={4} className="mb-3 mb-md-0">
            <div className="stats-card">
              <div className="stats-number">{profile.blogCount}</div>
              <div className="stats-label">
                <FaBlog className="me-1" /> Blogs
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <div className="stats-card">
              <div className="stats-number">{profile.followerCount}</div>
              <div className="stats-label">
                <FaUsers className="me-1" /> Followers
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="stats-card">
              <div className="stats-number">{profile.followingCount}</div>
              <div className="stats-label">
                <FaUserFriends className="me-1" /> Following
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        className="mb-4"
      >
        <Tab eventKey="blogs" title="Blogs">
          {blogsLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Loading blogs...</span>
              </Spinner>
              <span className="ms-2">Loading blogs...</span>
            </div>
          ) : blogs.length > 0 ? (
            <>
              <Row>
                {blogs.map(blog => (
                  <Col md={6} lg={4} key={blog.id} className="mb-4">
                    <BlogCard blog={blog} />
                  </Col>
                ))}
              </Row>
              
              <Pagination 
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <Alert variant="info">
              {user.id === parseInt(id) 
                ? "You haven't created any blogs yet. Share your travel experiences!" 
                : "This user hasn't created any blogs yet."}
            </Alert>
          )}
        </Tab>
        
        <Tab eventKey="followers" title="Followers">
          {followers.length > 0 ? (
            <Row>
              {followers.map(follower => (
                <Col md={6} lg={4} key={follower.id} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        <Link to={`/profile/${follower.id}`} className="text-decoration-none">
                          {follower.username}
                        </Link>
                      </Card.Title>
                      <Card.Text className="text-muted">
                        Member since {formatDate(follower.created_at)}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={`/user/${follower.id}/blogs`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View Blogs
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              {user.id === parseInt(id) 
                ? "You don't have any followers yet." 
                : "This user doesn't have any followers yet."}
            </Alert>
          )}
        </Tab>
        
        <Tab eventKey="following" title="Following">
          {following.length > 0 ? (
            <Row>
              {following.map(followedUser => (
                <Col md={6} lg={4} key={followedUser.id} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        <Link to={`/profile/${followedUser.id}`} className="text-decoration-none">
                          {followedUser.username}
                        </Link>
                      </Card.Title>
                      <Card.Text className="text-muted">
                        Member since {formatDate(followedUser.created_at)}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={`/user/${followedUser.id}/blogs`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View Blogs
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              {user.id === parseInt(id) 
                ? "You aren't following anyone yet." 
                : "This user isn't following anyone yet."}
            </Alert>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default Profile; 