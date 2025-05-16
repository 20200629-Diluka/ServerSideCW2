import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import CountrySelector from '../components/CountrySelector';
import { blogAPI } from '../services/api';

const CreateBlog = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    country_name: '',
    visit_date: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    setLoading(true);
    setError('');
    
    try {
      const response = await blogAPI.createBlog(formData);
      
      if (response.success) {
        navigate(`/blogs/${response.blog.id}`);
      } else {
        setError(response.message || 'Failed to create blog post');
      }
    } catch (err) {
      console.error('Error creating blog post:', err);
      setError('Failed to create blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="mb-4">Create New Travel Blog</h1>
      
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
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateBlog; 