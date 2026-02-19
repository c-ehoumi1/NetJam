import React, { useState, useEffect } from 'react';

function Comments({ resourceId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchComments = async () => {
        if (!resourceId) return;
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`/api/resource/${resourceId}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch comments.');
            }
            const data = await response.json();
            setComments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [resourceId]);

    const handleSaveComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`/api/resource/${resourceId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ comment_text: newComment }),
            });
            if (!response.ok) {
                throw new Error('Failed to save comment.');
            }
            const savedComment = await response.json();
            setComments(prevComments => [...prevComments, savedComment]);
            setNewComment(''); // Clear textarea
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="comments-section">
            {isLoading && <p>Loading comments...</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="comments-list">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.comment_id} className="comment-item">
                            <p><strong>{comment.username}</strong> <span className="comment-date">({new Date(comment.created_at).toLocaleString()})</span></p>
                            <p>{comment.comment_text}</p>
                        </div>
                    ))
                ) : (
                    !isLoading && <p>No comments yet. Be the first to comment!</p>
                )}
            </div>

            <form onSubmit={handleSaveComment} className="comment-form">
                <textarea
                    id="comment"
                    name="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    required
                />
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

export default Comments;
