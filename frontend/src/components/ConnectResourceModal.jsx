import React, { useState } from 'react';

const RELATIONSHIP_TYPES = [
    'Related To',
    'Depends On',
    'Contradicts',
    'Is Example Of',
    'Inspired By'
];

function ConnectResourceModal({ sourceResource, userResources, onClose, onConnect }) {
    const [targetResourceId, setTargetResourceId] = useState('');
    const [relationshipType, setRelationshipType] = useState(RELATIONSHIP_TYPES[0]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetResourceId) {
            setError('Please select a resource to connect to.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('/api/relationships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    resource_a_id: sourceResource.resource_id,
                    resource_b_id: parseInt(targetResourceId, 10),
                    relationship_type: relationshipType,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to create connection.');
            }

            onConnect(); // Notify parent of success

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Connect "{sourceResource.title}" to another resource</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="target-resource">Connect to:</label>
                        <select
                            id="target-resource"
                            value={targetResourceId}
                            onChange={(e) => setTargetResourceId(e.target.value)}
                            required
                        >
                            <option value="">Select a resource...</option>
                            {userResources.map(res => (
                                <option key={res.resource_id} value={res.resource_id}>
                                    {res.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="relationship-type">As:</label>
                        <select id="relationship-type" value={relationshipType} onChange={(e) => setRelationshipType(e.target.value)}>
                            {RELATIONSHIP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Connecting...' : 'Connect'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ConnectResourceModal;