import React, { useState } from 'react';

function Collections({ user}) {
  if (!user || !user.user) {
    return <div>Loading collections...</div>;
  }

  const { followers, following } = user.social_stats;

  return (
    <div className="App">
        <p>Collections avalaible</p>
    </div>
  );
}

export default Collections;