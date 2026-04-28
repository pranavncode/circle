import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { UserData, FollowUser } from '../shared/types';

interface SearchPageProps {
  userData: UserData;
  onViewProfile: (username: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ userData, onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const res = await axios.get<FollowUser[]>('http://localhost:5000/api/search', {
          params: { q: query.trim(), username: userData.username },
        });
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, userData.username]);

  const handleFollowToggle = async (user: FollowUser) => {
    try {
      if (user.isFollowing) {
        await axios.delete('http://localhost:5000/api/follow', {
          data: { followerUsername: userData.username, followingUsername: user.username },
        });
      } else {
        await axios.post('http://localhost:5000/api/follow', {
          followerUsername: userData.username,
          followingUsername: user.username,
        });
      }
      setResults((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
        )
      );
    } catch {
      // silently fail
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
    borderRadius: '14px',
    border: '1.5px solid #e7e5e4',
    background: '#fff',
    padding: '14px 18px 14px 46px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1c1917',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a8a29e"
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px' }}
        >
          <circle cx="11" cy="11" r="8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21l-4.35-4.35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#e85d04';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232, 93, 4, 0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e7e5e4';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#78716c', fontSize: '14px' }}>
          Searching...
        </div>
      ) : results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((user) => (
            <div key={user.id} style={{ ...cardStyle, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Avatar */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#1c1917',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => onViewProfile(user.username)}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{ fontSize: '15px', fontWeight: 600, color: '#1c1917', cursor: 'pointer', letterSpacing: '-0.01em' }}
                    onClick={() => onViewProfile(user.username)}
                  >
                    {user.username}
                  </p>
                  {user.about && (
                    <p style={{ fontSize: '13px', color: '#78716c', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.about}
                    </p>
                  )}
                  {user.skills && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {user.skills.split(',').slice(0, 3).map((s) => s.trim()).filter(Boolean).map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            color: '#44403c',
                            background: '#fafaf9',
                            border: '1px solid #e7e5e4',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Follow button */}
                <button
                  onClick={() => handleFollowToggle(user)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    border: user.isFollowing ? '1.5px solid #e7e5e4' : 'none',
                    background: user.isFollowing ? 'transparent' : '#1c1917',
                    color: user.isFollowing ? '#44403c' : '#fff',
                  }}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : searched && !loading ? (
        <div style={{ ...cardStyle, padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>No users found</p>
          <p style={{ fontSize: '13px', color: '#78716c', marginTop: '6px' }}>Try searching with a different username</p>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>Discover</p>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.02em' }}>Find your circle</h2>
          <p style={{ fontSize: '14px', color: '#78716c', marginTop: '8px', lineHeight: 1.6 }}>
            Search for people by their username to connect and follow them.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
