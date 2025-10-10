import React, { useState, useEffect } from 'react';
import Connections from './connections.jsx';
import Comments from'./comments.jsx';

function References ({ relationships, onConnectionDeleted }){
    const [view, setView] = useState('connections');
    
    const showConnections = () => setView('connections');
    const showComments = () => setView('comments');
    
    return(
        <div className='connections-comments'>
            <button onClick={showConnections}>Connections</button>
            <button onClick={showComments} style={{ marginLeft: '1rem' }}>Comments</button>
            {view === 'connections' && <Connections relationships={relationships} onConnectionDeleted={onConnectionDeleted} />}
            {view === 'comments' && <Comments/>}
        </div>
    );
}

export default References;
