import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-3 bg-dark text-white">
      <Container>
        {/* <hr className="my-3 bg-light" /> */}
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; {currentYear} TravelTales. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 