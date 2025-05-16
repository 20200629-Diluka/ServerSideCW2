import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import { blogAPI, userAPI } from '../services/api';

const UserBlogs = () => {
  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 9
  });
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userAPI.getUserProfile(id);
        
        if (response.success) {
          setUser(response.user);
        } else {
          setError('Failed to load user information');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user information');
      }
    };

    fetchUser();
  }, [id]);
  
  // Fetch user blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogsByUserId(id, page, 9);
        
        if (response.success) {
          setBlogs(response.blogs);
          setPagination(response.pagination);
        } else {
          setError('Failed to load blog posts');
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [id, page]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  return (
    <div>
      <Link to="/" className="btn btn-outline-secondary mb-3">
        &larr; Back to All Blogs
      </Link>
      
      <h1 className="mb-4">
        {user ? (
          <>
            {user.username}'s Travel Blogs
            <Link 
              to={`/profile/${id}`} 
              className="btn btn-sm btn-outline-primary ms-3"
            >
              View Profile
            </Link>
          </>
        ) : (
          'User Blogs'
        )}
      </h1>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading blog posts...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : blogs.length === 0 ? (
        <Alert variant="info">
          {user ? `${user.username} hasn't published any blogs yet.` : 'No blog posts found.'}
        </Alert>
      ) : (
        <>
          <h2 className="mb-3">Blog Posts ({pagination.totalItems})</h2>
          
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
      )}
    </div>
  );
};

export default UserBlogs; 