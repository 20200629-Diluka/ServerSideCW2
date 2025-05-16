import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { FaHeart, FaThumbsDown, FaEdit, FaTrash, FaUser, FaCalendar, FaGlobe } from 'react-icons/fa';
import CountryInfo from '../components/CountryInfo';
import AuthContext from '../context/AuthContext';
import { blogAPI, commentAPI } from '../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeStatus, setLikeStatus] = useState(null); // true for like, false for dislike, null for none

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogById(id);
        
        if (response.success) {
          setBlog(response.blog);
        } else {
          setError('Failed to load blog post');
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!blog) return;
      
      try {
        setCommentLoading(true);
        const response = await commentAPI.getBlogComments(id);
        
        if (response.success) {
          setComments(response.comments);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setCommentLoading(false);
      }
    };

    fetchComments();
  }, [id, blog]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await commentAPI.addComment(id, newComment);
      
      if (response.success) {
        setComments([response.comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await commentAPI.deleteComment(commentId);
      
      if (response.success) {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLike = async (isLike) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // If already in same state, remove the like/dislike
      if (likeStatus === isLike) {
        await blogAPI.removeLike(id);
        setLikeStatus(null);
        
        // Update counts in blog state
        setBlog(prev => ({
          ...prev,
          like_count: isLike ? prev.like_count - 1 : prev.like_count,
          dislike_count: !isLike ? prev.dislike_count - 1 : prev.dislike_count
        }));
      } else {
        await blogAPI.likeBlog(id, isLike);
        
        // Update counts in blog state
        setBlog(prev => ({
          ...prev,
          like_count: isLike 
            ? prev.like_count + 1 
            : (likeStatus === true ? prev.like_count - 1 : prev.like_count),
          dislike_count: !isLike 
            ? prev.dislike_count + 1 
            : (likeStatus === false ? prev.dislike_count - 1 : prev.dislike_count)
        }));
        
        setLikeStatus(isLike);
      }
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await blogAPI.deleteBlog(id);
        
        if (response.success) {
          navigate('/');
        }
      } catch (err) {
        console.error('Error deleting blog:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading blog post...</p>
      </div>
    );
  }

  if (error || !blog) {
    return <Alert variant="danger">{error || 'Blog post not found'}</Alert>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary mb-3">
          &larr; Back to Blogs
        </Link>
        
        <h1 className="mb-3">{blog.title}</h1>
        
        <div className="d-flex flex-wrap mb-3">
          <Badge bg="primary" className="me-2 mb-2">
            <FaGlobe className="me-1" />
            <Link to={`/country/${blog.country_name}`} className="text-white text-decoration-none">
              {blog.country_name}
            </Link>
          </Badge>
          
          <Badge bg="secondary" className="me-2 mb-2">
            <FaUser className="me-1" />
            <Link to={`/user/${blog.user_id}/blogs`} className="text-white text-decoration-none">
              {blog.username}
            </Link>
          </Badge>
          
          <Badge bg="info" className="me-2 mb-2">
            <FaCalendar className="me-1" />
            {formatDate(blog.visit_date)}
          </Badge>
        </div>
        
        {isAuthenticated && user.id === blog.user_id && (
          <div className="mb-3">
            <Button 
              as={Link} 
              to={`/edit-blog/${blog.id}`} 
              variant="outline-primary" 
              className="me-2"
            >
              <FaEdit className="me-1" /> Edit
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={handleDelete}
            >
              <FaTrash className="me-1" /> Delete
            </Button>
          </div>
        )}
      </div>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div 
                className="blog-content"
                style={{
                  whiteSpace: 'pre-line',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}
              >
                {blog.content}
              </div>
              
              <hr />
              
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex">
                  <Button 
                    variant={likeStatus === true ? "success" : "outline-success"} 
                    className="me-2 d-flex align-items-center"
                    onClick={() => handleLike(true)}
                  >
                    <FaHeart className="me-1" /> {blog.like_count || 0}
                  </Button>
                  <Button 
                    variant={likeStatus === false ? "danger" : "outline-danger"} 
                    className="d-flex align-items-center"
                    onClick={() => handleLike(false)}
                  >
                    <FaThumbsDown className="me-1" /> {blog.dislike_count || 0}
                  </Button>
                </div>
                <small className="text-muted">
                  Posted on {formatDate(blog.created_at)}
                </small>
              </div>
            </Card.Body>
          </Card>
          
          {/* Comment Section */}
          <div className="comment-section">
            <h3 className="mb-3">Comments ({comments.length})</h3>
            
            {isAuthenticated && (
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <Form onSubmit={handleCommentSubmit}>
                    <Form.Group className="mb-3" controlId="newComment">
                      <Form.Label>Add a comment</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Share your thoughts..."
                        required
                      />
                    </Form.Group>
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}
            
            {commentLoading ? (
              <div className="text-center my-4">
                <Spinner animation="border" role="status" size="sm">
                  <span className="visually-hidden">Loading comments...</span>
                </Spinner>
                <span className="ms-2">Loading comments...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="comment mb-3">
                  <div className="comment-meta">
                    <div>
                      <Link to={`/user/${comment.user_id}/blogs`} className="fw-bold text-decoration-none">
                        {comment.username}
                      </Link>
                      <span className="text-muted ms-2">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    {isAuthenticated && (user.id === comment.user_id || user.id === blog.user_id) && (
                      <Button 
                        variant="link" 
                        className="text-danger p-0"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                  <div>{comment.content}</div>
                </div>
              ))
            ) : (
              <Alert variant="light">No comments yet. Be the first to share your thoughts!</Alert>
            )}
          </div>
        </Col>
        
        <Col md={4}>
          <CountryInfo countryName={blog.country_name} />
        </Col>
      </Row>
    </div>
  );
};

export default BlogDetail; 