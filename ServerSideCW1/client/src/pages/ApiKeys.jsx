import { useState, useEffect } from 'react';
import { apiKeysAPI } from '../services/api';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Table,
    Alert,
    Modal,
    Badge,
    Spinner
} from 'react-bootstrap';

export default function ApiKeys() {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [newKeyName, setNewKeyName] = useState('');
    const [expiryDays, setExpiryDays] = useState(30);
    const [creatingKey, setCreatingKey] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);

    // Fetch API keys
    const fetchApiKeys = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiKeysAPI.getAllKeys();
            // Format the keys for display purposes only, but keep original keys intact for functionality
            const keys = (response.data.keys || []).map(key => ({
                ...key,
                displayKey: formatApiKey(key.key)
            }));
            setApiKeys(keys);
        } catch (err) {
            console.error('Error fetching API keys:', err);
            setError('Failed to load API keys. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load API keys on component mount
    useEffect(() => {
        fetchApiKeys();
    }, []);

    // Create a new API key
    const handleCreateKey = async (e) => {
        e.preventDefault();

        if (!newKeyName.trim()) {
            setError('Please enter a name for your API key');
            return;
        }

        setCreatingKey(true);
        setError(null);
        setSuccessMessage('');

        try {
            const response = await apiKeysAPI.createKey({
                name: newKeyName,
                expiryDays: parseInt(expiryDays, 10) || 30
            });

            // Store the newly created key to display it to the user
            setNewlyCreatedKey(response.data.key);

            // Clear form
            setNewKeyName('');
            setExpiryDays(30);

            // Refresh the list of keys
            fetchApiKeys();

            setSuccessMessage('API key created successfully.');
        } catch (err) {
            console.error('Error creating API key:', err);
            setError('Failed to create API key. Please try again.');
        } finally {
            setCreatingKey(false);
        }
    };

    // Toggle API key (activate/deactivate)
    const handleToggleKey = async (keyId) => {
        setError(null);
        setSuccessMessage('');

        try {
            await apiKeysAPI.toggleKey(keyId);

            // Update the key in the local state
            setApiKeys(apiKeys.map(key => {
                if (key.id === keyId) {
                    return { ...key, is_active: key.is_active ? 0 : 1 };
                }
                return key;
            }));

            setSuccessMessage('API key status updated successfully');
        } catch (err) {
            console.error('Error toggling API key:', err);
            setError('Failed to update API key status. Please try again.');
        }
    };

    // Confirmation dialog for deleting a key
    const confirmDeleteKey = (key) => {
        setKeyToDelete(key);
        setShowConfirmation(true);
    };

    // Delete an API key
    const handleDeleteKey = async () => {
        if (!keyToDelete) return;

        setError(null);
        setSuccessMessage('');

        try {
            await apiKeysAPI.deleteKey(keyToDelete.id);

            // Remove the key from the local state
            setApiKeys(apiKeys.filter(key => key.id !== keyToDelete.id));

            setSuccessMessage('API key deleted successfully');
        } catch (err) {
            console.error('Error deleting API key:', err);
            setError('Failed to delete API key. Please try again.');
        } finally {
            setShowConfirmation(false);
            setKeyToDelete(null);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            timeZone: 'UTC',
            dateStyle: 'medium',
            timeStyle: 'medium'
        });
    };

    // Copy API key to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccessMessage('API key copied to clipboard!');
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    // Format API key for display (mask the key except first and last 4 characters)
    const formatApiKey = (key) => {
        if (!key || key.length < 10) return key;
        const firstFour = key.substring(0, 4);
        const lastFour = key.substring(key.length - 4);
        return `${firstFour}...${lastFour}`;
    };

    return (
        <Container>
            <h1 className="mb-4">API Key Management</h1>

            {/* Create new API key */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                    <h2 className="h5 mb-3">Create a New API Key</h2>

                    <Form onSubmit={handleCreateKey}>
                        <Row className="g-3">
                            <Col xs={12} sm={6}>
                                <Form.Group>
                                    <Form.Label>Key Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="keyName"
                                        placeholder="Enter api key name"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Form.Group>
                                    <Form.Label>Expires After (days)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        id="expiryDays"
                                        value={expiryDays}
                                        onChange={(e) => setExpiryDays(e.target.value)}
                                        min="0"
                                        max="365"
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Button
                                    type="submit"
                                    variant="dark"
                                    disabled={creatingKey}
                                    className="py-2 px-4"
                                >
                                    {creatingKey ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create API Key'
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Success message */}
            {successMessage && (
                <Alert variant="success" className="mb-4">
                    {successMessage}
                </Alert>
            )}

            {/* Error message */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Newly created key */}
            {newlyCreatedKey && (
                <Alert variant="info" className="mb-4">
                    <h5>Your new API key:</h5>
                    <div className="bg-light p-3 my-3 border rounded d-flex align-items-center justify-content-between">
                        <code className="text-break fs-6 text-dark">{newlyCreatedKey.key}</code>
                        <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={() => copyToClipboard(newlyCreatedKey.key)}
                        >
                            Copy
                        </Button>
                    </div>
                    <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => setNewlyCreatedKey(null)}
                    >
                        Dismiss
                    </Button>
                </Alert>
            )}

            {/* API keys list */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <h2 className="h5 mb-4">Your API Keys</h2>

                    {loading ? (
                        <div className="d-flex justify-content-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">You don't have any API keys yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead>
                                    <tr className="table-light">
                                        <th>Name</th>
                                        <th>Key</th>
                                        <th>Created</th>
                                        <th>Expires</th>
                                        <th>Last Used</th>
                                        <th>Usage Count</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiKeys.map((key) => (
                                        <tr key={key.id}>
                                            <td>{key.name}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <code className="me-2 small">
                                                        {key.displayKey}
                                                    </code>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(key.key)}
                                                        title="Copy API key"
                                                    >
                                                        Copy
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="small">{formatDate(key.created_at)}</td>
                                            <td className="small">{formatDate(key.expires_at)}</td>
                                            <td className="small">{formatDate(key.last_used_at)}</td>
                                            <td className="text-center">{key.usage_count || 0}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Form.Check
                                                        type="switch"
                                                        checked={Boolean(key.is_active)}
                                                        onChange={() => handleToggleKey(key.id)}
                                                        className="me-2"
                                                    />
                                                    <Badge bg={key.is_active ? "success" : "secondary"} className="px-2 py-1">
                                                        {key.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => confirmDeleteKey(key)}
                                                    title="Delete key"
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Confirmation Modal */}
            <Modal
                show={showConfirmation}
                onHide={() => setShowConfirmation(false)}
                centered
                size="sm"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="h5">Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete the API key "{keyToDelete?.name}"?</p>
                    <p className="mb-0 text-danger small">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" size="sm" onClick={() => setShowConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDeleteKey}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
} 