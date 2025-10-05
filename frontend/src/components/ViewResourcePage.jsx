import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ViewResource from './viewresource.jsx';

function ViewResourcePage() {
    const { resourceId } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');
                const response = await fetch(`/api/resource/${resourceId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch resource');
                }
                const data = await response.json();
                setResource(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [resourceId]);

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
            <main>
                <ViewResource resource={resource} />
            </main>
        </div>
    );
}

export default ViewResourcePage;
