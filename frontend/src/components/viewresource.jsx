import React, { useState } from 'react';

function ViewResource ({ resource }){
    // State for edit mode
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [isEditingTags, setIsEditingTags] = useState(false);

    // State to hold the values of the inputs while editing
    const [description, setDescription] = useState(resource ? resource.description : '');
    const [notes, setNotes] = useState(resource ? resource.notes : '');
    const [tags, setTags] = useState(resource ? resource.tags : '');

    if (!resource) {
        return null;
    }

    const handleSave = async (field) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        let body;
        switch(field) {
            case 'description':
                body = { description };
                break;
            case 'notes':
                body = { notes };
                break;
            case 'tags':
                body = { tags };
                break;
            default:
                return;
        }

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
            if (field === 'description') setIsEditingDescription(false);
            if (field === 'notes') setIsEditingNotes(false);
            if (field === 'tags') setIsEditingTags(false);

        } catch (error) {
            console.error('Save failed:', error);
        }
    };


    return(
        <div>
            <div className="connection-selector-container">
                <button>Connect to</button>
                <button>Disconnect from</button>
                <button>Add to a collection</button>
            </div>
            <div className='description-container'>
                <label htmlFor="description">Description:</label>
                <textarea id="description" readOnly={!isEditingDescription} value={description} onChange={(e) => setDescription(e.target.value)} />
                <button onClick={() => isEditingDescription ? handleSave('description') : setIsEditingDescription(true)}>
                    {isEditingDescription ? 'Save' : 'Edit'}
                </button>
            </div>
            <div className="notes-container">
                <label htmlFor="notes">Notes:</label>
                <textarea id="notes" readOnly={!isEditingNotes} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <button onClick={() => isEditingNotes ? handleSave('notes') : setIsEditingNotes(true)}>
                    {isEditingNotes ? 'Save' : 'Edit'}
                </button>
            </div>
            <div className="tags-container">
                {isEditingTags ? (
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
                ) : (
                    resource.tags && resource.tags.split(',').map(tag => (
                        <span key={tag} className="tag">
                            {tag}
                        </span>
                    ))
                )}
                <button onClick={() => isEditingTags ? handleSave('tags') : setIsEditingTags(true)}>{isEditingTags ? 'Save' : 'Edit'}</button>
            </div>
        </div>
    );
}

export default ViewResource;