import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const { username, email, password } = formData;
            const { success, error } = await register({ username, email, password });

            if (success) {
                navigate('/dashboard');
            } else {
                setError(error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={5} lg={4}>
                    <div className="text-center mb-4">
                        <h1 className="h3">Register</h1>
                        <p className="text-muted">Create your account</p>
                    </div>

                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}

                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                        className="py-2"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="py-2"
                                    />
                                    <Form.Text className="text-muted">
                                        Must be at least 6 characters
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>
                                
                                <Button
                                    type="submit"
                                    variant="dark"
                                    className="w-100 py-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    
                    <div className="mt-3 text-center">
                        <p className="mb-0">
                            Already have an account?{' '}
                            <Link to="/login" className="text-decoration-none">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
} 