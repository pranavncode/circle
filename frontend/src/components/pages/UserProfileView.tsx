import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { UserData, Post } from '../shared/types';
import { useSocket } from '../shared/SocketContext';

interface UserProfileViewProps {
  userData: UserData;
  viewUsername: string;
  onBack: () => void;
  onSendMessage: (username: string) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ userData, viewUsername, onBack, onSendMessage }) => {
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, postsRes, countsRes, statusRes] = await Promise.all([
          axios.get<UserData>(`http://localhost:5000/api/users/${encodeURIComponent(viewUsername)}`),
          axios.get<Post[]>('http://localhost:5000/api/posts', { params: { username: viewUsername } }),
          axios.get<{ followers: number; following: number }>(`http://localhost:5000/api/follow/counts/${encodeURIComponent(viewUsername)}`),
          axios.get<{ isFollowing: boolean }>('http://localhost:5000/api/follow/status', {
            params: { follower: userData.username, following: viewUsername },
          }),
        ]);
        setProfileUser(userRes.data);
        setPosts(postsRes.data);
        setFollowersCount(countsRes.data.followers);
        setFollowingCount(countsRes.data.following);
        setIsFollowing(statusRes.data.isFollowing);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewUsername, userData.username]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      // Re-fetch counts dynamically
      axios.get<{ followers: number; following: number }>(`http://localhost:5000/api/follow/counts/${encodeURIComponent(viewUsername)}`)
        .then(res => {
          setFollowersCount(res.data.followers);
          setFollowingCount(res.data.following);
        }).catch(() => {});
    };

    socket.on('new_notification', handleUpdate);
    return () => {
      socket.off('new_notification', handleUpdate);
    };
  }, [socket, viewUsername]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.delete('http://localhost:5000/api/follow', {
          data: { followerUsername: userData.username, followingUsername: viewUsername },
        });
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await axios.post('http://localhost:5000/api/follow', {
          followerUsername: userData.username,
          followingUsername: viewUsername,
        });
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch {
      // silently fail
    } finally {
      setFollowLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e7e5e4',
    overflow: 'hidden',
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#78716c', fontSize: '14px' }}>Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>User not found</p>
          <button onClick={onBack} style={{ ...btnOutline, marginTop: '16px' }}>Go back</button>
        </div>
      </div>
    );
  }

  const isOwnProfile = profileUser.username === userData.username;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

      {/* Back button */}
      <button onClick={onBack} style={{ ...btnOutline, alignSelf: 'flex-start', padding: '8px 16px', fontSize: '12px' }}>
        ← Back
      </button>

      {/* Profile header */}
      <div style={cardStyle}>
        <div style={{ height: '120px', background: '#f3ede9ff' }} />
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '-36px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '4px solid #fff',
              background: '#fafaf9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 800,
              color: '#1c1917',
              flexShrink: 0,
            }}>
              {profileUser.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em' }}>{profileUser.username}</h1>
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
              <p style={{ fontSize: '13px', color: '#a8a29e', marginTop: '2px' }}>{profileUser.email}</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917' }}>{followersCount}</span>
              <span style={{ fontSize: '13px', color: '#78716c', marginLeft: '4px' }}>Followers</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917' }}>{followingCount}</span>
              <span style={{ fontSize: '13px', color: '#78716c', marginLeft: '4px' }}>Following</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917' }}>{posts.length}</span>
              <span style={{ fontSize: '13px', color: '#78716c', marginLeft: '4px' }}>Posts</span>
            </div>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isFollowing ? '1.5px solid #e7e5e4' : 'none',
                  background: isFollowing ? 'transparent' : '#1c1917',
                  color: isFollowing ? '#44403c' : '#fff',
                  opacity: followLoading ? 0.5 : 1,
                }}
              >
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </button>
              <button onClick={() => onSendMessage(viewUsername)} style={btnOutline}>
                Message
              </button>
            </div>
          )}

          <p style={{ fontSize: '12px', color: '#a8a29e', marginTop: '12px' }}>
            Member since {new Date(profileUser.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* About */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '8px' }}>About</h2>
        {profileUser.about ? (
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#57534e' }}>{profileUser.about}</p>
        ) : (
          <p style={{ fontSize: '13px', color: '#a8a29e' }}>No about information added yet.</p>
        )}
      </div>

      {/* Experience & Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '12px' }}>Experience</h2>
          {profileUser.experience ? (
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#57534e' }}>{profileUser.experience}</p>
          ) : (
            <p style={{ fontSize: '13px', color: '#a8a29e' }}>No experience added yet.</p>
          )}
        </div>

        <div style={{ ...cardStyle, padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginBottom: '12px' }}>Skills & Interests</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profileUser.skills && profileUser.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
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
            {profileUser.interests && profileUser.interests.split(',').map((i) => i.trim()).filter(Boolean).map((interest) => (
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
            {(!profileUser.skills || !profileUser.skills.split(',').some((s) => s.trim())) &&
             (!profileUser.interests || !profileUser.interests.split(',').some((i) => i.trim())) && (
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

        {posts.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#a8a29e' }}>No posts yet.</p>
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
                    {profileUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{profileUser.username}</p>
                      <span style={{ fontSize: '11px', color: '#a8a29e' }}>·</span>
                      <p style={{ fontSize: '11px', color: '#a8a29e' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917', marginBottom: '4px' }}>{post.title}</h3>
                    <p style={{ fontSize: '13px', color: '#57534e', lineHeight: 1.5 }}>{post.caption}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }} />
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
    </div>
  );
};

export default UserProfileView;
