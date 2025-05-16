import React, { useState, useEffect } from 'react';
import { Row, Col, Button, ButtonGroup, Form, Alert, Spinner } from 'react-bootstrap';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import { blogAPI } from '../services/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    limit: 10
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getAllBlogs(page, 10, sortBy);
        
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
  }, [page, sortBy]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1); // Reset to first page when changing sort
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Welcome to TravelTales</h1>
          <p className="lead">
            Explore travel stories from around the world. Share your own adventures and connect with fellow travelers.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} md={6}>
          <h2>Travel Stories</h2>
        </Col>
        <Col xs={12} md={6} className="text-md-end">
          <Form.Group controlId="sortBy">
            <Form.Label className="me-2">Sort by:</Form.Label>
            <ButtonGroup>
              <Button 
                variant={sortBy === 'newest' ? 'primary' : 'outline-primary'} 
                onClick={() => handleSortChange('newest')}
              >
                Newest
              </Button>
              <Button 
                variant={sortBy === 'liked' ? 'primary' : 'outline-primary'} 
                onClick={() => handleSortChange('liked')}
              >
                Most Liked
              </Button>
              <Button 
                variant={sortBy === 'commented' ? 'primary' : 'outline-primary'} 
                onClick={() => handleSortChange('commented')}
              >
                Most Commented
              </Button>
            </ButtonGroup>
          </Form.Group>
        </Col>
      </Row>

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
        <Alert variant="info">No blog posts found. Be the first to share your travel experience!</Alert>
      ) : (
        <>
          <Row>
            {blogs.map(blog => (
              <Col xs={12} md={6} lg={4} key={blog.id} className="mb-4">
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

export default Home; 