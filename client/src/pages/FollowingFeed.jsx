import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import { blogAPI } from '../services/api';

const FollowingFeed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 9
  });
  
  useEffect(() => {
    const fetchFollowingFeed = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getFollowingFeed(page, 9);
        
        if (response.success) {
          setBlogs(response.blogs);
          setPagination(response.pagination);
        } else {
          setError('Failed to load blog posts');
        }
      } catch (err) {
        console.error('Error fetching following feed:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingFeed();
  }, [page]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  return (
    <div>
      <h1 className="mb-4">Following Feed</h1>
      <p className="lead mb-4">
        Blog posts from travelers you follow
      </p>
      
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
          <h4>No posts in your feed yet</h4>
          <p>
            You're not following anyone or the users you follow haven't posted any blogs yet.
            <br />
            Explore and follow more travelers to see their posts here!
          </p>
        </Alert>
      ) : (
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
      )}
    </div>
  );
};

export default FollowingFeed; 