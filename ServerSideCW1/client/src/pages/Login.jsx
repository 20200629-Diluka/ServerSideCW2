import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const { success, error } = await login(formData);

            if (success) {
                navigate('/dashboard');
            } else {
                setError(error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={5} lg={4}>
                    <div className="text-center mb-4">
                        <h1 className="h3">Login</h1>
                        <p className="text-muted">Sign in to your account</p>
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
                                
                                <Form.Group className="mb-4">
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
                                </Form.Group>
                                
                                <Button
                                    type="submit"
                                    variant="dark"
                                    className="w-100 py-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    
                    <div className="mt-3 text-center">
                        <p className="mb-0">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-decoration-none">
                                Register here
                            </Link>
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
} 