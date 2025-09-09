import React from 'react';

function Profile({ user, handleLogout }) {
  if (!user || !user.user) {
    return <div>Loading profile...</div>;
  }

  const { followers, following } = user.social_stats;

  return (
    <div className="App">
      <header>
        <h2>{user.user.username}!</h2>
      </header>
      <main>
        <div className="social-stats">
          <span>{followers} Followers</span>
          <span style={{ paddingLeft: '2rem' }}>{following} Following</span>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </main>
    </div>
  );
}

export default Profile;