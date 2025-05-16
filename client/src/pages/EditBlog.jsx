import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import CountrySelector from '../components/CountrySelector';
import AuthContext from '../context/AuthContext';
import { blogAPI } from '../services/api';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    country_name: '',
    visit_date: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogById(id);
        
        if (response.success) {
          // Redirect if not the owner
          if (user.id !== response.blog.user_id) {
            navigate(`/blogs/${id}`);
            return;
          }
          
          // Format date for input
          const visitDate = new Date(response.blog.visit_date).toISOString().split('T')[0];
          
          setFormData({
            title: response.blog.title,
            content: response.blog.content,
            country_name: response.blog.country_name,
            visit_date: visitDate
          });
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
  }, [id, user, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleCountryChange = (value) => {
    setFormData({
      ...formData,
      country_name: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    setSubmitting(true);
    setError('');
    
    try {
      const response = await blogAPI.updateBlog(id, formData);
      
      if (response.success) {
        navigate(`/blogs/${id}`);
      } else {
        setError(response.message || 'Failed to update blog post');
      }
    } catch (err) {
      console.error('Error updating blog post:', err);
      setError('Failed to update blog post. Please try again.');
    } finally {
      setSubmitting(false);
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
  
  return (
    <div>
      <h1 className="mb-4">Edit Blog Post</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="shadow-sm">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a captivating title"
                required
                minLength={5}
                maxLength={100}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a title (5-100 characters).
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <CountrySelector
                  value={formData.country_name}
                  onChange={handleCountryChange}
                  isInvalid={validated && !formData.country_name}
                />
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="visitDate">
                  <Form.Label>Visit Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid visit date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="content">
              <Form.Label>Blog Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Share your travel experience..."
                required
                minLength={50}
              />
              <Form.Control.Feedback type="invalid">
                Please provide content (minimum 50 characters).
              </Form.Control.Feedback>
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(`/blogs/${id}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditBlog; 