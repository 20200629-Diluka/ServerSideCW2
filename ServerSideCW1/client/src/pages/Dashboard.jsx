import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { countriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Alert,
    Spinner
} from 'react-bootstrap';

export default function Dashboard() {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [selectedApiKey, setSelectedApiKey] = useState('');
    const [apiKeys, setApiKeys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [manualApiKey, setManualApiKey] = useState('');
    const [useManualKey, setUseManualKey] = useState(false);

    const { user } = useAuth();

    // Fetch API keys
    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                // Use the apiKeysAPI instead of raw fetch
                const response = await fetch('http://localhost:5000/api/keys', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch API keys');
                }

                const data = await response.json();

                // Check if API keys exist and are in the correct format
                if (data.keys && data.keys.length > 0) {
                    // Filter to only active keys and ensure we have the raw key
                    const keys = data.keys
                        .filter(key => key.is_active === 1) // Only use active keys
                        .map(key => {
                            return {
                                ...key,
                                key: key.key.trim() // Ensure there's no whitespace
                            };
                        });

                    setApiKeys(keys);

                    // Select the first key by default if there are any active keys
                    if (keys.length > 0) {
                        const selectedKey = keys[0].key;
                        setSelectedApiKey(selectedKey);
                    } else {
                        // If no active keys, show an error
                        setError('No active API keys found. Please activate a key or create a new one.');
                    }
                } else {
                    console.log('No API keys found');
                    setApiKeys([]);
                }
            } catch (err) {
                console.error('Error fetching API keys:', err);
                setError('Failed to load API keys. Please go to the API Keys page to create one.');
            }
        };

        fetchApiKeys();
    }, []);

    // Fetch all countries when an API key is selected
    useEffect(() => {
        if (selectedApiKey) {
            setLoading(false);
        }
    }, [selectedApiKey]);

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault();

        const apiKeyToUse = useManualKey ? manualApiKey : selectedApiKey;
        if (!apiKeyToUse) return;
        
        // Don't perform search if no search term is entered
        if (!searchTerm) return;

        setSearching(true);
        setError(null);

        try {
            // Only search by country name when search term is provided
            const response = await countriesAPI.getCountryByName(searchTerm, apiKeyToUse);

            // Handle single country response format
            if (response.data.data && Array.isArray(response.data.data)) {
                setCountries(response.data.data);
            } else if (response.data.data) {
                setCountries([response.data.data]);
            } else {
                setCountries([]);
            }
        } catch (err) {
            console.error('Error searching countries:', err);
            // Check for unauthorized error which indicates invalid API key
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Invalid API key. Please check your API key and try again.');
            } else {
                setError(`No results found for "${searchTerm}".`);
            }
            setCountries([]);
        } finally {
            setSearching(false);
        }
    };

    // Format currencies for display
    const formatCurrencies = (currencies) => {
        if (!currencies) return 'N/A';

        return Object.entries(currencies)
            .map(([code, currency]) => `${code}: ${currency.name} (${currency.symbol || 'No symbol'})`)
            .join(', ');
    };

    // Format languages for display
    const formatLanguages = (languages) => {
        if (!languages) return 'N/A';

        return Object.values(languages).join(', ');
    };

    // Function to activate all API keys
    const activateAllKeys = async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch('http://localhost:5000/api/keys/fix-inactive-keys', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to activate API keys');
            }

            const data = await response.json();
            console.log('API keys activation response:', data);

            // Reload the API keys after activation
            window.location.reload();
        } catch (err) {
            console.error('Error activating API keys:', err);
            setError('Failed to activate API keys. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h1 className="mb-4">Dashboard</h1>

            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="p-4">
                    <p className="text-muted mb-4">Search for country information using your API key.</p>

                    {apiKeys.length === 0 ? (
                        <Alert variant="warning" className="mb-4">
                            <p className="mb-2">You don't have any API keys yet.</p>
                            <Link to="/api-keys" className="btn btn-sm btn-outline-dark">
                                Create an API key
                            </Link>
                        </Alert>
                    ) : (
                        <div className="mb-4">
                            {apiKeys.filter(key => key.is_active === 1).length === 0 && (
                                <Alert variant="warning" className="mb-3">
                                    <p className="mb-2">You have API keys but none are active.</p>
                                    <Button
                                        onClick={activateAllKeys}
                                        variant="outline-dark"
                                        size="sm"
                                        disabled={loading}
                                    >
                                        {loading ? 'Activating...' : 'Activate All Keys'}
                                    </Button>
                                </Alert>
                            )}
                            
                            <Form.Group className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <Form.Check
                                        type="switch"
                                        id="useManualKey"
                                        label="Use manual API key"
                                        checked={useManualKey}
                                        onChange={() => setUseManualKey(!useManualKey)}
                                        className="me-2"
                                    />
                                </div>

                                {!useManualKey ? (
                                    <Form.Select
                                        value={selectedApiKey}
                                        onChange={(e) => setSelectedApiKey(e.target.value)}
                                        className="py-2"
                                    >
                                        <option value="" disabled>Select an API key</option>
                                        {apiKeys.map((key) => (
                                            <option key={key.id} value={key.key}>
                                                {key.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        type="text"
                                        placeholder="Paste your API key here"
                                        value={manualApiKey}
                                        onChange={(e) => setManualApiKey(e.target.value)}
                                        className="py-2"
                                    />
                                )}
                            </Form.Group>
                        </div>
                    )}

                    <Form onSubmit={handleSearch}>
                        <Row className="g-2">
                            <Col md={8}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter country name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="py-2"
                                />
                            </Col>
                            <Col md={4}>
                                <Button
                                    type="submit"
                                    variant="dark"
                                    className="w-100 py-2"
                                    disabled={!(useManualKey ? manualApiKey : selectedApiKey) || searching}
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {searching ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Row className="g-4">
                    {countries.map((country, index) => (
                        <Col key={index} xs={12} sm={6} md={4}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Img
                                    variant="top"
                                    src={country.flags.png}
                                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                                    style={{ height: "160px", objectFit: "cover" }}
                                />
                                <Card.Body>
                                    <Card.Title className="h5 mb-3">{country.name.common}</Card.Title>
                                    <div className="small">
                                        <div className="mb-2">
                                            <span className="fw-bold">Capital: </span>
                                            {country.capital && country.capital.length > 0
                                                ? country.capital.join(', ')
                                                : 'N/A'}
                                        </div>
                                        <div className="mb-2">
                                            <span className="fw-bold">Currencies: </span>
                                            {formatCurrencies(country.currencies)}
                                        </div>
                                        <div>
                                            <span className="fw-bold">Languages: </span>
                                            {formatLanguages(country.languages)}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}

                    {countries.length === 0 && !loading && !error && (
                        <Col xs={12} className="text-center py-5">
                            <p className="text-muted">
                                No countries to display. Try searching for a country.
                            </p>
                        </Col>
                    )}
                </Row>
            )}
        </Container>
    );
} 