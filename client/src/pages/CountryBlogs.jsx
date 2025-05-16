import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import BlogCard from '../components/BlogCard';
import CountryInfo from '../components/CountryInfo';
import Pagination from '../components/Pagination';
import { blogAPI } from '../services/api';

const CountryBlogs = () => {
  const { name } = useParams();
  
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
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogsByCountry(name, page, 9);
        
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
  }, [name, page]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  return (
    <div>
      <Link to="/" className="btn btn-outline-secondary mb-3">
        &larr; Back to All Blogs
      </Link>
      
      <h1 className="mb-4">Travel Blogs: {name}</h1>
      
      <CountryInfo countryName={name} />
      
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
          No blog posts found for {name}. Be the first to share your experience!
        </Alert>
      ) : (
        <>
          <h2 className="mt-4 mb-3">Blog Posts ({pagination.totalItems})</h2>
          
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

export default CountryBlogs; 