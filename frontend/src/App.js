import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');
  const [tenant, setTenant] = useState(() => localStorage.getItem('tenant') || '');
  const [notes, setNotes] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);

  // Persist session and fetch notes on token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('tenant', tenant);
      fetchNotes(token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('tenant');
      setNotes([]);
    }
    // eslint-disable-next-line
  }, [token, role, tenant]);

  const login = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  setRole(data.role);
  setTenant(data.tenant);
  fetchNotes(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNotes = async (tk = token) => {
    setError('');
    setLimitReached(false);
    const res = await fetch(`${API}/notes`, {
      headers: { Authorization: `Bearer ${tk}` }
    });
    if (res.status === 403) setLimitReached(true);
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
  };

  const createNote = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (res.status === 403) {
        setLimitReached(true);
        return;
      }
      const note = await res.json();
      setNotes([...notes, note]);
      setTitle('');
      setContent('');
    } catch (err) {
      setError('Failed to create note');
    }
  };

  const deleteNote = async id => {
    setError('');
    await fetch(`${API}/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotes(notes.filter(n => n._id !== id));
  };

  const upgrade = async () => {
    setError('');
    try {
      const res = await fetch(`${API}/tenants/${tenant}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Upgrade failed');
      setLimitReached(false);
      fetchNotes();
    } catch (err) {
      setError('Upgrade failed');
    }
  };

  const logout = () => {
    setToken('');
    setRole('');
    setTenant('');
    setNotes([]);
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 320, margin: '40px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Login</h2>
        <form onSubmit={login}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
          <button type="submit" style={{ width: '100%' }}>Login</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <div style={{ fontSize: 12, marginTop: 16 }}>
          <b>Test Accounts:</b><br />
          admin@acme.test<br />
          user@acme.test<br />
          admin@globex.test<br />
          user@globex.test<br />
          (password: password)
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h2>Notes ({tenant})</h2>
      <div style={{ marginBottom: 16 }}>
  <b>Role:</b> {role} <button onClick={logout}>Logout</button>
      </div>
      <form onSubmit={createNote} style={{ marginBottom: 16 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: 200, marginRight: 8 }} />
        <input placeholder="Content" value={content} onChange={e => setContent(e.target.value)} required style={{ width: 200, marginRight: 8 }} />
        <button type="submit">Add Note</button>
      </form>
      {limitReached && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          Free plan limit reached. {role === 'admin' && <button onClick={upgrade}>Upgrade to Pro</button>}
        </div>
      )}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map(note => (
          <li key={note._id} style={{ border: '1px solid #ccc', borderRadius: 6, marginBottom: 8, padding: 8 }}>
            <b>{note.title}</b><br />
            {note.content}<br />
            <button onClick={() => deleteNote(note._id)} style={{ marginTop: 4 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
