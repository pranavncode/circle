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

  return (
    <div className="space-y-6 pb-28">
      <section className="rounded-[2rem] overflow-hidden shadow-lg">
        <div className="h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" />
        <div className="bg-white px-6 pb-6 pt-4">
          <div className="-mt-16 flex items-end gap-5">
            <div className="h-32 w-32 rounded-[2rem] border-4 border-white bg-slate-100 shadow-lg flex items-center justify-center text-4xl font-bold text-orange-600">
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <div className="grow">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{userData.username}</h1>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Student</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{userData.email}</p>
              <p className="mt-1 text-sm text-slate-500">Member since {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={onLogout} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800">
                Log out
              </button>
              <button onClick={() => setIsEditing((current) => !current)} className="rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-orange-600 shadow-sm hover:border-orange-300 transition">
                {isEditing ? 'Close edit' : 'Edit profile'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {isEditing ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Edit profile</h2>
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                <input
                  value={formValues.username}
                  onChange={(event) => handleInputChange('username', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  value={userData.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">About</label>
              <textarea
                value={formValues.about}
                onChange={(event) => handleInputChange('about', event.target.value)}
                rows={4}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                placeholder="Share what you do, what you care about, and what you want to build."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Skills</label>
                <input
                  value={formValues.skills}
                  onChange={(event) => handleInputChange('skills', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  placeholder="e.g. Design, AI, Leadership"
                />
                <p className="mt-2 text-xs text-slate-500">Separate values with commas.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Interests</label>
                <input
                  value={formValues.interests}
                  onChange={(event) => handleInputChange('interests', event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  placeholder="e.g. Community, Startups, Mentoring"
                />
                <p className="mt-2 text-xs text-slate-500">Use commas to separate interests.</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Experience</label>
              <textarea
                value={formValues.experience}
                onChange={(event) => handleInputChange('experience', event.target.value)}
                rows={4}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                placeholder="Describe your recent experience, roles, or projects."
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormValues({
                    username: userData.username,
                    about: userData.about || '',
                    skills: userData.skills || '',
                    interests: userData.interests || '',
                    experience: userData.experience || '',
                  });
                  setIsEditing(false);
                  setError('');
                }}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">About</h2>
          <button onClick={() => setIsEditing(true)} className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition">
            Edit
          </button>
        </div>
        {userData.about ? (
          <p className="mt-3 text-sm leading-7 text-slate-600">{userData.about}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No about information added yet.</p>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Experience</h2>
              <span className="text-xs text-slate-500">Updated</span>
            </div>
            {userData.experience ? (
              <div className="mt-5 rounded-3xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Profile experience</p>
                <p className="mt-3 text-sm text-slate-600">{userData.experience}</p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">No experience details added yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Skills & Interests</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {userData.skills && userData.skills.split(',').map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                <span key={`skill-${skill}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{skill}</span>
              ))}
              {userData.interests && userData.interests.split(',').map((interest) => interest.trim()).filter(Boolean).map((interest) => (
                <span key={`interest-${interest}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{interest}</span>
              ))}
              {(!userData.skills || userData.skills.split(',').filter(s => s.trim()).length === 0) && 
               (!userData.interests || userData.interests.split(',').filter(i => i.trim()).length === 0) && (
                <span className="text-sm text-slate-500">No skills or interests added yet.</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">My Posts</h2>
          <span className="text-sm text-slate-500">{posts.length} posts</span>
        </div>

        {loadingPosts ? (
          <p className="text-sm text-slate-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts yet. Create your first post from the home page.</p>
        ) : (
          <div className="space-y-4">
            {posts.slice(0, 5).map((post) => (
              <article key={post.id ?? `${post.createdAt}-${post.title}`} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                    {userData.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-900">{userData.username}</p>
                      <span className="text-xs text-slate-500">•</span>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{post.caption}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} className="w-full max-h-48 object-cover rounded-3xl" />
                    )}
                  </div>
                </div>
              </article>
            ))}
            {posts.length > 5 && (
              <p className="text-sm text-slate-500 text-center">And {posts.length - 5} more posts...</p>
            )}
          </div>
        )}
      </section>
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Network</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">0</p>
            <p className="text-sm text-slate-500">Followers</p>
            <p className="text-xs text-slate-400 mt-1">Coming soon</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">0</p>
            <p className="text-sm text-slate-500">Following</p>
            <p className="text-xs text-slate-400 mt-1">Coming soon</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;