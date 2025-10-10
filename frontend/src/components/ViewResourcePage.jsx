import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ViewResource from './viewresource.jsx';
import References from './References.jsx';

function ViewResourcePage() {
    const { resourceId } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relationships, setRelationships] = useState({ my_connections: [], others_connections: [] });
    const [userResources, setUserResources] = useState([]);

    const fetchRelationships = async () => {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/api/resource/${resourceId}/relationships`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            console.error('Failed to fetch relationships');
            return;
        }
        const data = await response.json();
        setRelationships(data);
    };

    useEffect(() => {
        const fetchResource = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');

                // Fetch resource, relationships, and user's other resources in parallel
                const [resResource, resRelationships, resProfile] = await Promise.all([
                    fetch(`/api/resource/${resourceId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                    fetch(`/api/resource/${resourceId}/relationships`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                    fetch(`/api/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                ]);

                if (!resResource.ok) throw new Error('Failed to fetch resource');
                
                setResource(await resResource.json());
                if (resRelationships.ok) setRelationships(await resRelationships.json());
                if (resProfile.ok) setUserResources((await resProfile.json()).resources);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [resourceId]); // Re-fetch when resourceId changes

    if (loading) {
        return <div className="App">Loading resource...</div>;
    }

    if (error) {
        return <div className="App">Error: {error}</div>;
    }

    if (!resource) {
        return <div className="App">Resource not found.</div>;
    }

    return (
        <div className="App">
            <header>
                <Link to="/profile">
                    <button>Back to Profile</button>
                </Link>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                        src={resource.preview} 
                        alt={resource.title} 
                        style={{ 
                            height: '3rem',
                            objectFit: 'cover' 
                        }} 
                    />
                    {resource.title}
                </h2>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <button className="source">Go to source</button>
                </a>
            </header>
            <main className="resource-view-main">
                <ViewResource 
                    resource={resource} 
                    userResources={userResources.filter(r => r.resource_id !== resource.resource_id)}
                    onConnectionCreated={fetchRelationships}
                />
                <aside>
                    <References relationships={relationships} onConnectionDeleted={fetchRelationships} />
                </aside>
            </main>
        </div>
    );
}

export default ViewResourcePage;
