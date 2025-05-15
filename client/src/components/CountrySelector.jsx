import React, { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { countryAPI } from '../services/api';

const CountrySelector = ({ value, onChange, isInvalid }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const res = await countryAPI.getAllCountries();
        if (res.success) {
          setCountries(res.countries);
        } else {
          setError('Failed to load countries');
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" role="status" variant="primary" size="sm">
          <span className="visually-hidden">Loading countries...</span>
        </Spinner>
        <span className="ms-2">Loading countries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Form.Group className="mb-3">
        <Form.Label>Country</Form.Label>
        <div className="text-danger">{error}</div>
      </Form.Group>
    );
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>Country</Form.Label>
      <Form.Select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        isInvalid={isInvalid}
        required
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.name}>
            {country.name}
          </option>
        ))}
      </Form.Select>
      <Form.Control.Feedback type="invalid">
        Please select a country.
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default CountrySelector; 