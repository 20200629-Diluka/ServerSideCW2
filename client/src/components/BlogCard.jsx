import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { FaHeart, FaThumbsDown, FaComment, FaUser, FaGlobe, FaCalendar } from 'react-icons/fa';

const BlogCard = ({ blog }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate content
  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  return (
    <Card className="blog-card shadow-sm">
      <Card.Body>
        <Card.Title>
          <Link to={`/blogs/${blog.id}`} className="text-decoration-none text-dark">
            {blog.title}
          </Link>
        </Card.Title>
        
        <Row className="mb-2">
          <Col>
            <Badge bg="primary" className="me-2">
              <FaGlobe className="me-1" />
              <Link to={`/country/${blog.country_name}`} className="text-white text-decoration-none">
                {blog.country_name}
              </Link>
            </Badge>
            
            <Badge bg="secondary" className="me-2">
              <FaUser className="me-1" />
              <Link to={`/user/${blog.user_id}/blogs`} className="text-white text-decoration-none">
                {blog.username}
              </Link>
            </Badge>
            
            <Badge bg="info" className="me-2">
              <FaCalendar className="me-1" />
              {formatDate(blog.visit_date)}
            </Badge>
          </Col>
        </Row>
        
        <Card.Text>
          {truncateContent(blog.content)}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex">
            <div className="me-3 text-success">
              <FaHeart className="me-1" />
              {blog.like_count || 0}
            </div>
            <div className="me-3 text-danger">
              <FaThumbsDown className="me-1" />
              {blog.dislike_count || 0}
            </div>
            <div className="text-primary">
              <FaComment className="me-1" />
              {blog.comment_count || 0}
            </div>
          </div>
          <small className="text-muted">
            Posted on {formatDate(blog.created_at)}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BlogCard; 