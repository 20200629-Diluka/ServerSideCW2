import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Container, Nav, Button, Offcanvas } from 'react-bootstrap';

export default function AppNavbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowOffcanvas(false);
    };

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="md" className="py-2">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold">Countries API</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" onClick={handleShowOffcanvas} />
                    
                    <Navbar.Collapse id="navbar-nav" className="d-none d-md-flex">
                        <Nav className="me-auto">
                            {isAuthenticated && (
                                <>
                                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                                    <Nav.Link as={Link} to="/api-keys">API Keys</Nav.Link>
                                    <Nav.Link as={Link} to="/api-key-logs">API Logs</Nav.Link>
                                </>
                            )}
                        </Nav>
                        <Nav>
                            {isAuthenticated ? (
                                <div className="d-flex align-items-center">
                                    <span className="text-light me-3 d-none d-md-block">
                                        {user?.username}
                                    </span>
                                    <Button 
                                        variant="outline-light"
                                        size="sm"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="d-flex gap-2">
                                    <Button 
                                        as={Link} 
                                        to="/login" 
                                        variant="outline-light"
                                        size="sm"
                                    >
                                        Login
                                    </Button>
                                    <Button 
                                        as={Link} 
                                        to="/register" 
                                        variant="light"
                                        size="sm"
                                    >
                                        Register
                                    </Button>
                                </div>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Mobile Offcanvas Menu */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} className="bg-light">
                <Offcanvas.Header closeButton className="border-bottom">
                    <Offcanvas.Title>Countries API</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        {isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard" onClick={handleCloseOffcanvas} className="py-2">
                                    Dashboard
                                </Nav.Link>
                                <Nav.Link as={Link} to="/api-keys" onClick={handleCloseOffcanvas} className="py-2">
                                    API Keys
                                </Nav.Link>
                                <Nav.Link as={Link} to="/api-key-logs" onClick={handleCloseOffcanvas} className="py-2">
                                    API Logs
                                </Nav.Link>
                                <hr />
                                <div className="text-muted mb-3">
                                    Logged in as {user?.username}
                                </div>
                                <Button 
                                    variant="outline-dark" 
                                    size="sm"
                                    onClick={handleLogout}
                                    className="w-100"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-2">
                                    Login
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register" onClick={handleCloseOffcanvas} className="py-2">
                                    Register
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
} 