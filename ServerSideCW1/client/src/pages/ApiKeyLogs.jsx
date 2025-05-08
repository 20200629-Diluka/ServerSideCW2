import { useState, useEffect } from 'react';
import { apiKeysAPI } from '../services/api';
import {
    Container,
    Card,
    Table,
    Alert,
    Spinner,
    Form,
    Button,
    InputGroup,
    Badge
} from 'react-bootstrap';

export default function ApiKeyLogs() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all API key logs
    const fetchAllLogs = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiKeysAPI.getAllLogs();
            const logsData = response.data.logs || [];
            setLogs(logsData);
            setFilteredLogs(logsData);
        } catch (err) {
            console.error('Error fetching API key logs:', err);
            setError('Failed to load API key logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load logs on component mount
    useEffect(() => {
        fetchAllLogs();
    }, []);

    // Handle search filter change
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredLogs(logs);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = logs.filter(
            log => log.key_name.toLowerCase().includes(term)
        );

        setFilteredLogs(filtered);
    }, [searchTerm, logs]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            timeZone: 'UTC',
            dateStyle: 'medium',
            timeStyle: 'medium'
        });
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchAllLogs();
    };

    return (
        <Container>
            <h1 className="mb-4">API Key Usage Logs</h1>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                        <h2 className="h5 mb-3 mb-md-0">API Request Logs</h2>
                        <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="px-3 py-1"
                        >
                            {loading ? 'Refreshing...' : 'Refresh Logs'}
                        </Button>
                    </div>

                    <InputGroup className="mb-4">
                        <Form.Control
                            placeholder="Search by key name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-2"
                        />
                        {searchTerm && (
                            <Button 
                                variant="outline-dark"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear
                            </Button>
                        )}
                    </InputGroup>

                    {/* Error message */}
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="d-flex justify-content-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted mb-0">
                                {logs.length === 0
                                    ? "No API key usage logs found."
                                    : "No logs match your search criteria."}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead>
                                    <tr className="table-light">
                                        <th>Date/Time</th>
                                        <th>Key Name</th>
                                        <th>Endpoint</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log.usage_id}>
                                            <td className="small">{formatDate(log.request_timestamp)}</td>
                                            <td>{log.key_name}</td>
                                            <td>
                                                <Badge bg="dark" className="px-2 py-1 text-white">
                                                    {log.endpoint}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
} 