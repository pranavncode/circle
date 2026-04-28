import axios from 'axios';
import React, { useEffect, useState } from 'react';
import type { Post, UserData } from '../shared/types';

interface HomePageProps {
  userData: UserData;
  showCreatePost: boolean;
  onCloseCreatePost: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, showCreatePost, onCloseCreatePost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<Post[]>(`http://localhost:5000/api/posts/feed`, {
        params: { username: userData.username },
      });
      setPosts(response.data);
    } catch (err) {
      setError('Unable to load your feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userData.username]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview('');
    }
  };

  const handleEditImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setEditImageFile(file);
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setEditImagePreview('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !caption.trim()) {
      setError('Title and caption are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('title', title.trim());
      formData.append('caption', caption.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post<Post>('http://localhost:5000/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPosts((current) => [response.data, ...current]);
      setTitle('');
      setCaption('');
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setError('Unable to post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post.id ?? null);
    setEditTitle(post.title);
    setEditCaption(post.caption);
    setEditImageFile(null);
    setEditImagePreview(post.imageUrl ?? '');
    setError('');
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditCaption('');
    setEditImageFile(null);
    setEditImagePreview('');
    setError('');
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingPostId === null) return;
    if (!editTitle.trim() || !editCaption.trim()) {
      setError('Title and caption are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('title', editTitle.trim());
      formData.append('caption', editCaption.trim());
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      const response = await axios.put<Post>(`http://localhost:5000/api/posts/${editingPostId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPosts((current) => current.map((post) => (post.id === editingPostId ? response.data : post)));
      cancelEdit();
    } catch (err) {
      setError('Unable to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId?: number) => {
    if (!postId) return;
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        params: { username: userData.username },
      });
      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch (err) {
      setError('Unable to delete post. Please try again.');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e7e5e4',
    overflow: 'hidden',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '12px',
    border: '1.5px solid #e7e5e4',
    background: '#fafaf9',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1c1917',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#44403c',
    marginBottom: '6px',
  };

  const btnPrimary: React.CSSProperties = {
    background: '#1c1917',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'background 0.2s ease',
  };

  const btnOutline: React.CSSProperties = {
    background: 'transparent',
    color: '#44403c',
    fontWeight: 500,
    fontSize: '13px',
    padding: '10px 20px',
    border: '1.5px solid #e7e5e4',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>

      {/* Quick links */}
      <div style={{ ...cardStyle, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Feed</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em', marginTop: '2px' }}>Your feed</h2>
          </div>
          <button onClick={fetchPosts} style={{ ...btnOutline, padding: '8px 16px', fontSize: '12px' }}>Refresh</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 0' }}>
          {['Stories', 'Trends', 'People', 'Events', 'Jobs'].map((label) => (
            <div key={label} style={{
              minWidth: '80px',
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              padding: '14px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background 0.2s ease',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#fafaf9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#1c1917',
              }}>
                {label.charAt(0)}
              </div>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#78716c' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create post (shown via header button) */}
      {showCreatePost && (
        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', letterSpacing: '-0.01em' }}>New post</h3>
            <button onClick={onCloseCreatePost} style={{ ...btnOutline, padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                style={inputStyle}
                placeholder="What are you working on?"
              />
            </div>
            <div>
              <label style={labelStyle}>Caption</label>
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                rows={3}
                placeholder="Share your progress, ideas or updates"
              />
            </div>
            <div>
              <label style={labelStyle}>Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '13px', color: '#78716c' }} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ marginTop: '12px', maxHeight: '180px', width: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              )}
            </div>
            {error && <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>}
            <div>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts feed */}
      {loading ? (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#78716c', fontSize: '14px' }}>Loading your posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>No posts yet</p>
          <p style={{ fontSize: '13px', color: '#78716c', marginTop: '6px' }}>Create your first post to appear on your feed.</p>
        </div>
      ) : (
        posts.map((post) => {
          const author = post.user?.username ?? userData.username;
          const isOwnPost = author === userData.username;
          const isEditing = editingPostId === post.id;

          return (
            <article key={post.id ?? `${post.createdAt}-${post.title}`} style={cardStyle}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1c1917',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}>
                      {author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917' }}>{author}</p>
                      <p style={{ fontSize: '11px', color: '#a8a29e' }}>{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {isOwnPost && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(post)} style={{ ...btnOutline, padding: '6px 14px', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => handleDelete(post.id)} style={{ ...btnOutline, padding: '6px 14px', fontSize: '12px', color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Title</label>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Caption</label>
                      <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} rows={3} />
                    </div>
                    <div>
                      <label style={labelStyle}>Replace photo</label>
                      <input type="file" accept="image/*" onChange={handleEditImageChange} style={{ fontSize: '13px', color: '#78716c' }} />
                      {editImagePreview && (
                        <img src={editImagePreview} alt="Preview" style={{ marginTop: '12px', maxHeight: '180px', width: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                      )}
                    </div>
                    {error && <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" style={btnPrimary}>Save</button>
                      <button type="button" onClick={cancelEdit} style={btnOutline}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }} />}
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '6px', letterSpacing: '-0.01em' }}>{post.title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#57534e' }}>{post.caption}</p>
                  </>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
};

export default HomePage;