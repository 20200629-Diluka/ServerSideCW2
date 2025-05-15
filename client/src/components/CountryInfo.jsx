import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Image, ListGroup } from 'react-bootstrap';
import { countryAPI } from '../services/api';

const CountryInfo = ({ countryName }) => {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading(true);
        // First try to search by name
        const result = await countryAPI.searchCountriesByName(countryName);
        if (result.success && result.countries.length > 0) {
          // Get the first matching country
          const countryCode = result.countries[0].code;
          // Get detailed country information
          const detailedResult = await countryAPI.getCountryByCode(countryCode);
          if (detailedResult.success) {
            setCountry(detailedResult.country);
          }
        } else {
          setError('Country not found');
        }
      } catch (err) {
        console.error('Error fetching country data:', err);
        setError('Failed to load country information');
      } finally {
        setLoading(false);
      }
    };

    if (countryName) {
      fetchCountryData();
    }
  }, [countryName]);

  if (loading) {
    return (
      <Card className="country-info shadow-sm">
        <Card.Body>
          <Card.Title>Loading country information...</Card.Title>
        </Card.Body>
      </Card>
    );
  }

  if (error || !country) {
    return (
      <Card className="country-info shadow-sm">
        <Card.Body>
          <Card.Title>Country Information</Card.Title>
          <Card.Text className="text-danger">{error || 'Country information not available'}</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="country-info shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">{country.name}</Card.Title>
        <Row>

          <Col md={12}>
          <Image 
              src={country.flag} 
              alt={country.flagAlt}
              className="country-flag img-fluid mb-2"
            />
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Capital:</strong> {country.capital}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Currency:</strong> {
                  country.currencies.length > 0 
                    ? country.currencies.map(c => `${c.name} (${c.symbol})`).join(', ') 
                    : 'N/A'
                }
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CountryInfo; 