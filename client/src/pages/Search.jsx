import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Nav, Alert, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { FaGlobe, FaUser, FaSearch } from 'react-icons/fa';
import { blogAPI, countryAPI, userAPI } from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'country';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  
  // Countries for suggestions
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  
  // Load countries for suggestions
  useEffect(() => {
    const fetchCountries = async () => {
      if (searchType !== 'country') return;
      
      try {
        setCountriesLoading(true);
        const response = await countryAPI.getAllCountries();
        
        if (response.success) {
          setCountries(response.countries);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, [searchType]);
  
  // Perform search if URL has query params
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery, initialType);
    }
  }, [initialQuery, initialType]);
  
  // Filter countries based on search query
  const filteredCountries = searchQuery
    ? countries.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Update URL
    setSearchParams({ q: searchQuery, type: searchType });
    
    handleSearch(searchQuery, searchType);
  };
  
  const handleSearch = async (query, type) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      if (type === 'country') {
        const response = await blogAPI.getBlogsByCountry(query);
        setResults(response.success ? response.blogs : []);
      } else {
        // Search for blogs by username
        try {
          // First, get all blogs
          const response = await blogAPI.getAllBlogs(1, 100);
          if (response.success) {
            // Filter blogs by username
            const filteredBlogs = response.blogs.filter(blog => 
              blog.username && blog.username.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filteredBlogs);
          } else {
            setResults([]);
          }
        } catch (err) {
          console.error('Error searching by username:', err);
          setError('An error occurred while searching by username. Please try again.');
          setResults([]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setResults([]);
    setHasSearched(false);
  };
  
  return (
    <div>
      <h1 className="mb-4">Search TravelTales</h1>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Nav 
            variant="tabs" 
            className="mb-3"
            activeKey={searchType}
            onSelect={handleSearchTypeChange}
          >
            <Nav.Item>
              <Nav.Link 
                eventKey="country"
                style={{ color: searchType === 'country' ? '#007bff' : '#000' }}
              >
                <FaGlobe className="me-1" /> Search by Country
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="user"
                style={{ color: searchType === 'user' ? '#007bff' : '#000' }}
              >
                <FaUser className="me-1" /> Search by Username
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="searchQuery">
              <Form.Label>
                {searchType === 'country' ? 'Country Name' : 'Username'}
              </Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder={searchType === 'country' 
                    ? 'Enter country name' 
                    : 'Enter username to search'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  list={searchType === 'country' ? 'countrySuggestions' : undefined}
                  className="me-2"
                />
                <Button type="submit" variant="primary">
                  <FaSearch /> Search
                </Button>
              </div>
              
              {searchType === 'country' && (
                <datalist id="countrySuggestions">
                  {filteredCountries.map(country => (
                    <option key={country.code} value={country.name} />
                  ))}
                </datalist>
              )}
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Searching...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : hasSearched ? (
        results.length > 0 ? (
          <>
            <h2 className="mb-3">
              Search Results for "{searchQuery}"
              <span className="text-muted ms-2">({results.length} results)</span>
            </h2>
            
            <Row>
              {results.map(blog => (
                <Col md={6} lg={4} key={blog.id} className="mb-4">
                  <BlogCard blog={blog} />
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <Alert variant="info">
            <h4>No results found</h4>
            <p>
              We couldn't find any blogs matching your search for "{searchQuery}".
              <br />
              Try a different search term or browse all blogs on the 
              <Link to="/" className="mx-1">home page</Link>.
            </p>
          </Alert>
        )
      ) : (
        <Alert variant="light" className="text-center">
          <FaSearch className="mb-3" style={{ fontSize: '2rem' }} />
          <h4>Search for travel blogs</h4>
          <p>
            Enter a {searchType === 'country' ? 'country name' : 'username'} above to find related blogs.
          </p>
        </Alert>
      )}
    </div>
  );
};

export default Search; 