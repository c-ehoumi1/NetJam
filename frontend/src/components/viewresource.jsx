import React from 'react';

function ViewResource ({ resource }){
    if (!resource) {
        return null; // Or a loading/error state if you prefer
    }

    return(
        <div>
            <p>{resource.description || "No description available."}</p>
            <div className="tags-container">
                {resource.tags && resource.tags.split(',').map(tag => (
                    <span key={tag} className="tag">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default ViewResource;