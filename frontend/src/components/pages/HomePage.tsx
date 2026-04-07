import axios from 'axios';
import React, { useEffect, useState } from 'react';
import type { Post, UserData } from '../shared/types';

interface HomePageProps {
  userData: UserData;
}

const HomePage: React.FC<HomePageProps> = ({ userData }) => {
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
      const response = await axios.get<Post[]>(`http://localhost:5000/api/posts`, {
        params: { username: userData.username },
      });
      setPosts(response.data);
    } catch (err) {
      setError('Unable to load your posts.');
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

  return (
    <div className="space-y-6 pb-28">
      <section className="rounded-3xl border border-orange-200 bg-white/80 backdrop-blur p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-orange-500 font-semibold">Home</p>
            <h2 className="text-2xl font-bold text-slate-900">Your posts</h2>
          </div>
          <button onClick={fetchPosts} className="text-orange-600 font-semibold hover:text-orange-700 transition">Refresh</button>
        </div>
        <div className="flex gap-3 overflow-x-auto py-2">
          {['Stories', 'Trends', 'People', 'Events', 'Jobs'].map((story) => (
            <div key={story} className="min-w-[100px] rounded-3xl border border-gray-200 bg-orange-50/80 p-4 text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-lg">{story.charAt(0)}</div>
              <p className="text-xs font-semibold text-slate-700">{story}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">Create a new post</h3>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              placeholder="What are you working on?"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Caption</label>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              rows={4}
              placeholder="Share your progress, ideas or work updates"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Photo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-3 max-h-48 w-full rounded-3xl object-cover" />
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition disabled:opacity-60"
          >
            {saving ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </section>

      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm border border-slate-200">Loading your posts...</div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm border border-slate-200">
          <p className="text-lg font-semibold text-slate-900">No posts yet</p>
          <p className="mt-2 text-sm text-slate-600">Create your first post to appear on your personal feed.</p>
        </div>
      ) : (
        posts.map((post) => {
          const author = post.user?.username ?? userData.username;
          const isEditing = editingPostId === post.id;

          return (
            <article key={post.id ?? `${post.createdAt}-${post.title}`} className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold">{author.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{author}</p>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(post)} className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-orange-300 transition">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 transition">Delete</button>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Caption</label>
                      <textarea
                        value={editCaption}
                        onChange={(event) => setEditCaption(event.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Replace photo</label>
                      <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full" />
                      {editImagePreview && (
                        <img src={editImagePreview} alt="Preview" className="mt-3 max-h-48 w-full rounded-3xl object-cover" />
                      )}
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-3">
                      <button type="submit" className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition">Save</button>
                      <button type="button" onClick={cancelEdit} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 transition">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full max-h-96 object-cover" />}
                    <div className="px-0 pb-5 pt-4">
                      <h3 className="mb-3 text-xl font-semibold text-slate-900">{post.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{post.caption}</p>
                    </div>
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