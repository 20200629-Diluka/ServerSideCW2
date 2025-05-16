import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Row className="justify-content-center text-center py-5">
      <Col md={8}>
        <h1 className="display-1 mb-4">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead mb-5">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button as={Link} to="/" variant="primary" size="lg">
          Return to Home
        </Button>
      </Col>
    </Row>
  );
};

export default NotFound; 