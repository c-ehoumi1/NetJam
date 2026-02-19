import React from 'react';

function Collections({ collections }) {
  const hasCollections = collections && collections.length > 0;

  return (
    <div className="collections-section">
      <button>Create a new collection</button>
      
      {hasCollections ? (
        <div className="collections-list">
          {collections.map(collection => (
            <div key={collection.collection_id} className="collection-item">
              <h3>{collection.collection_name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p>No collections yet.</p>
      )}
    </div>
  );
}

export default Collections;