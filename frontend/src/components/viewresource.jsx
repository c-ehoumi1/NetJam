import React, { useState, useEffect } from 'react';
import ConnectResourceModal from './ConnectResourceModal.jsx';

function ViewResource ({ resource, userResources, onConnectionCreated }){
    // State for edit mode
    const [editingFields, setEditingFields] = useState({});
    const [isConnecting, setIsConnecting] = useState(false);

    // State to hold the values of the inputs while editing
    const [formState, setFormState] = useState({
        description: resource?.description || '',
        notes: resource?.notes || '',
        tags: resource?.tags || '',
    });

    // Effect to update local state when the resource prop changes
    useEffect(() => {
        if (resource) {
            setFormState({
                description: resource.description || '',
                notes: resource.notes || '',
                tags: resource.tags || '',
            });
        }
    }, [resource]);

    const handleConnectionSuccess = () => {
        setIsConnecting(false);
        if (onConnectionCreated) {
            onConnectionCreated();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const toggleEdit = (field) => {
        setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (!resource) {
        return null;
    }

    const handleSave = async (field) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const body = { [field]: formState[field] };

        try {
            const response = await fetch(`/api/resource/${resource.resource_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`Failed to update ${field}`);
            }
            // On successful save, exit editing mode
            toggleEdit(field);

        } catch (error) {
            console.error('Save failed:', error);
        }
    };


    return(
        <div>
            {isConnecting && (
                <ConnectResourceModal
                    sourceResource={resource}
                    userResources={userResources}
                    onClose={() => setIsConnecting(false)}
                    onConnect={handleConnectionSuccess}
                />
            )}
            <div className="connection-selector-container">
                <button onClick={() => setIsConnecting(true)}>Connect to</button>
                <button>Add to a collection</button>
            </div>
            <div className='description-container'>
                <label htmlFor="description">Description:</label>
                <textarea id="description" name="description" readOnly={!editingFields.description} value={formState.description} onChange={handleInputChange} />
                <button onClick={() => editingFields.description ? handleSave('description') : toggleEdit('description')}>
                    {editingFields.description ? 'Save' : 'Edit'}
                </button>
            </div>
            <div className="notes-container">
                <label htmlFor="notes">Notes:</label>
                <textarea id="notes" name="notes" readOnly={!editingFields.notes} value={formState.notes} onChange={handleInputChange} />
                <button onClick={() => editingFields.notes ? handleSave('notes') : toggleEdit('notes')}>
                    {editingFields.notes ? 'Save' : 'Edit'}
                </button>
            </div>
            <div className="tags-container">
                {editingFields.tags ? (
                    <input type="text" name="tags" value={formState.tags} onChange={handleInputChange} />
                ) : (
                    resource.tags && resource.tags.split(',').map(tag => (
                        <span key={tag} className="tag">
                            {tag}
                        </span>
                    ))
                )}
                <button onClick={() => editingFields.tags ? handleSave('tags') : toggleEdit('tags')}>{editingFields.tags ? 'Save' : 'Edit'}</button>
            </div>
        </div>
    );
}

export default ViewResource;