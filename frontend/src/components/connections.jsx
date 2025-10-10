import React from 'react';
import { Link } from 'react-router-dom';

const RelationshipLabels = {
    'outgoing': {
        'Related To': 'is related to',
        'Depends On': 'depends on',
        'Contradicts': 'contradicts',
        'Is Example Of': 'is an example of',
        'Inspired By': 'was inspired by'
    },
    'incoming': {
        'Related To': 'is related to',
        'Depends On': 'is a dependency for',
        'Contradicts': 'is contradicted by',
        'Is Example Of': 'has as an example',
        'Inspired By': 'inspired'
    }
};

function Connections({ relationships, onConnectionDeleted }) {

    const handleDelete = async (rel) => {
        if (!window.confirm(`Are you sure you want to remove this connection?`)) return;

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('/api/relationships', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    resource_a_id: rel.resource_a_id,
                    resource_b_id: rel.resource_b_id,
                    relationship_type: rel.relationship_type,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to delete connection');
            }
            onConnectionDeleted(); // Trigger re-fetch in parent
        } catch (error) {
            console.error("Delete failed:", error);
            alert(error.message);
        }
    };

    const renderConnection = (rel, isOwner) => {
        const targetId = rel.direction === 'outgoing' ? rel.resource_b_id : rel.resource_a_id;
        const label = RelationshipLabels[rel.direction][rel.relationship_type] || rel.relationship_type;

        return (
            <li key={`${rel.resource_a_id}-${rel.resource_b_id}-${rel.relationship_type}`}>
                <span className="relationship-label">{label}</span>
                <Link to={`/resource/${targetId}`}>{rel.other_resource_title}</Link>
                {isOwner && <button className="delete-connection-btn" onClick={() => handleDelete(rel)}>x</button>}
                {!isOwner && <span className="connection-author"> (by {rel.username})</span>}
            </li>
        );
    };

    const { my_connections = [], others_connections = [] } = relationships || {};

    if (my_connections.length === 0 && others_connections.length === 0) {
        return <p>No connections yet. Connect this resource to another to build your knowledge graph!</p>;
    }

    return (
        <div className="connections-list">
            {my_connections.length > 0 && (
                <div className="connection-group">
                    <h4>My Connections</h4>
                    <ul>
                        {my_connections.map(rel => renderConnection(rel, true))}
                    </ul>
                </div>
            )}
            {others_connections.length > 0 && (
                <div className="connection-group">
                    <h4>Community Connections</h4>
                    <ul>
                        {others_connections.map(rel => renderConnection(rel, false))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Connections;
