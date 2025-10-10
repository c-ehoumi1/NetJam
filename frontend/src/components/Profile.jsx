import React, { useState, useEffect } from 'react';
import Savings from './savings.jsx';
import Collections from './collections.jsx';

function Profile({ user, handleLogout }) {
  const [view, setView] = useState('savings');
  const [resources, setResources] = useState(user.resources);

  const showSavings = () => setView('savings');
  const showCollections = () => setView('collections');

  if (!user || !user.user) {
    return <div>Loading profile...</div>;
  }

  const handleResourceDelete = async (resourceId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/resource/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete resource.');
      // Filter out the deleted resource from the state
      setResources(resources.filter(r => r.resource_id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };
  const { followers, following } = user.social_stats;

  return (
    <div className="App">
      <header>
        <div className='user-info'>
           <h2>{user.user.username}</h2>
        </div>
      </header>
      <main>
        <div className="social-stats">
          <span>{followers} Followers</span>
          <span style={{ paddingLeft: '1rem' }}>{following} Following</span>
        </div>
        <div className='savings-collections'>
          <button onClick={showSavings} >Savings</button>
          <button onClick={showCollections} style={{ marginLeft: '1rem' }}>Collections</button>
          {view === 'savings' && <Savings resources={resources} handleResourceDelete={handleResourceDelete} />}
          {view === 'collections' && <Collections collections={user.collections} />}
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white' }}>Logout</button>
      </main>
    </div>
  );
}

export default Profile;