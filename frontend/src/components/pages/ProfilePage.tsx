import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { UserData, Post } from '../shared/types';

interface ProfilePageProps {
  userData: UserData;
  onLogout: () => void;
  onProfileUpdated: (user: UserData) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, onLogout, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [formValues, setFormValues] = useState({
    username: userData.username,
    about: userData.about || '',
    skills: userData.skills || '',
    interests: userData.interests || '',
    experience: userData.experience || '',
  });

  useEffect(() => {
    setFormValues({
      username: userData.username,
      about: userData.about || '',
      skills: userData.skills || '',
      interests: userData.interests || '',
      experience: userData.experience || '',
    });
  }, [userData]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await axios.get<Post[]>(`http://localhost:5000/api/posts`, {
        params: { username: userData.username },
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userData.username]);

  const handleInputChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await axios.put<UserData>(`http://localhost:5000/api/users/${encodeURIComponent(userData.username)}`, {
        newUsername: formValues.username,
        about: formValues.about,
        skills: formValues.skills,
        interests: formValues.interests,
        experience: formValues.experience,
      });

      onProfileUpdated(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

      {/* Profile header */}
      <div style={cardStyle}>
        <div style={{ height: '120px', background: '#f3ede9ff' }} />
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '-40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid #fff',
              background: '#fafaf9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              color: '#1c1917',
              flexShrink: 0,
            }}>
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em' }}>{userData.username}</h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#e85d04',
                  background: '#fef0e6',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>Student</span>
              </div>
              <p style={{ fontSize: '13px', color: '#a8a29e', marginTop: '2px' }}>{userData.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button onClick={() => setIsEditing((current) => !current)} style={btnOutline}>
              {isEditing ? 'Cancel edit' : 'Edit profile'}
            </button>
            <button onClick={onLogout} style={{ ...btnOutline, color: '#dc2626', borderColor: '#fecaca' }}>
              Log out
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#a8a29e', marginTop: '12px' }}>
            Member since {new Date(userData.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '16px', letterSpacing: '-0.01em' }}>Edit profile</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input value={formValues.username} onChange={(e) => handleInputChange('username', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input value={userData.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>About</label>
              <textarea
                value={formValues.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="What do you do? What drives you?"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Skills</label>
                <input value={formValues.skills} onChange={(e) => handleInputChange('skills', e.target.value)} style={inputStyle} placeholder="Design, AI, Leadership" />
                <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '4px' }}>Comma separated</p>
              </div>
              <div>
                <label style={labelStyle}>Interests</label>
                <input value={formValues.interests} onChange={(e) => handleInputChange('interests', e.target.value)} style={inputStyle} placeholder="Community, Startups" />
                <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '4px' }}>Comma separated</p>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Experience</label>
              <textarea
                value={formValues.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Roles, projects, or achievements"
              />
            </div>

            {error && <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={() => { setIsEditing(false); setError(''); }} style={btnOutline}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* About */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>About</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} style={{ ...btnOutline, padding: '6px 14px', fontSize: '12px' }}>Edit</button>
          )}
        </div>
        {userData.about ? (
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#57534e' }}>{userData.about}</p>
        ) : (
          <p style={{ fontSize: '13px', color: '#a8a29e' }}>No about information added yet.</p>
        )}
      </div>

      {/* Experience & Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '12px' }}>Experience</h2>
          {userData.experience ? (
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#57534e' }}>{userData.experience}</p>
          ) : (
            <p style={{ fontSize: '13px', color: '#a8a29e' }}>No experience added yet.</p>
          )}
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '12px' }}>Skills & Interests</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {userData.skills && userData.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
              <span key={`s-${skill}`} style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#44403c',
                background: '#fafaf9',
                border: '1px solid #e7e5e4',
                padding: '4px 12px',
                borderRadius: '8px',
              }}>{skill}</span>
            ))}
            {userData.interests && userData.interests.split(',').map((i) => i.trim()).filter(Boolean).map((interest) => (
              <span key={`i-${interest}`} style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#44403c',
                background: '#fafaf9',
                border: '1px solid #e7e5e4',
                padding: '4px 12px',
                borderRadius: '8px',
              }}>{interest}</span>
            ))}
            {(!userData.skills || !userData.skills.split(',').some(s => s.trim())) &&
             (!userData.interests || !userData.interests.split(',').some(i => i.trim())) && (
              <span style={{ fontSize: '13px', color: '#a8a29e' }}>No skills or interests added yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>Posts</h2>
          <span style={{ fontSize: '12px', color: '#a8a29e' }}>{posts.length} posts</span>
        </div>

        {loadingPosts ? (
          <p style={{ fontSize: '13px', color: '#78716c' }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#a8a29e' }}>No posts yet. Create your first post from the home page.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.slice(0, 5).map((post) => (
              <article key={post.id ?? `${post.createdAt}-${post.title}`} style={{ borderRadius: '12px', border: '1px solid #e7e5e4', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#1c1917',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {userData.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{userData.username}</p>
                      <span style={{ fontSize: '11px', color: '#a8a29e' }}>·</span>
                      <p style={{ fontSize: '11px', color: '#a8a29e' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917', marginBottom: '4px' }}>{post.title}</h3>
                    <p style={{ fontSize: '13px', color: '#57534e', lineHeight: 1.5 }}>{post.caption}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }} />
                    )}
                  </div>
                </div>
              </article>
            ))}
            {posts.length > 5 && (
              <p style={{ fontSize: '13px', color: '#a8a29e', textAlign: 'center' }}>And {posts.length - 5} more posts...</p>
            )}
          </div>
        )}
      </div>

      {/* Network */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '16px' }}>Network</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1c1917' }}>0</p>
            <p style={{ fontSize: '13px', color: '#78716c' }}>Followers</p>
            <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>Coming soon</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1c1917' }}>0</p>
            <p style={{ fontSize: '13px', color: '#78716c' }}>Following</p>
            <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '2px' }}>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;