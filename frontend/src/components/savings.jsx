import React from 'react';
import { Link } from 'react-router-dom';

function Savings({ resources, handleResourceDelete }) {
  if (!resources || resources.length === 0) {
    return <div>No saved resources yet.</div>;
  }

  return (
    <div className="App">
      <h2>Your Saved Resources</h2>
      {resources.map(resource => (
          <div key={resource.resource_id}>
            <h3>{resource.title}</h3>
            <div className="image-container">
                <img
                  src={resource.preview}
                  alt={resource.title}
                />
                <div className="hover-buttons-overlay">
                  <Link to={`/resource/${resource.resource_id}`}>
                    <button className="view">View</button>
                  </Link>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <button className="source">Go to source</button>
                  </a>
                  <button 
                    className="delete"
                    onClick={() => handleResourceDelete(resource.resource_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            <hr></hr>
          </div>
      ))}
    </div>
  );
}

export default Savings;