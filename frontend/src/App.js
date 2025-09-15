
import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import StarIcon from '@mui/icons-material/Star';
import {
  AppBar, Toolbar, Typography, Container, Card, CardContent, Button, TextField, Alert, List, ListItem, ListItemText, IconButton, Box, Stack, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [tab, setTab] = useState(0);
  const [showPay, setShowPay] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [plan, setPlan] = useState('free');
  const [showProSnackbar, setShowProSnackbar] = useState(false);

  const fetchInvitedUsers = async (tk = token) => {
    setError('');
    try {
      const res = await fetch(`${API}/invite/invited`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      if (!res.ok) throw new Error('Failed to fetch invited users');
      const data = await res.json();
      setInvitedUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setInvitedUsers([]);
    }
  };

  const handleInvite = async e => {
    e.preventDefault();
    setInviteSuccess('');
    setError('');
    try {
      const res = await fetch(`${API}/invite/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invite failed');
      setInviteSuccess(`User ${inviteEmail} invited as ${inviteRole}`);
      setInviteEmail('');
      setInviteRole('member');
      fetchInvitedUsers(token);
    } catch (err) {
      setError(err.message);
    }
  };

  // Persist session and fetch notes on token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('tenant', tenant);
      fetchNotes(token);
      if (role === 'admin') fetchInvitedUsers(token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('tenant');
      setNotes([]);
      setInvitedUsers([]);
    }
    // eslint-disable-next-line
  }, [token, role, tenant]);

  // Fetch plan status
  const fetchPlan = async (tk = token) => {
    if (!tenant) return;
    try {
      const res = await fetch(`${API}/tenants/${tenant}`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      if (!res.ok) throw new Error('Failed to fetch plan');
      const data = await res.json();
      setPlan(data.plan);
      setIsPro(data.plan === 'pro');
    } catch {
      setPlan('free');
      setIsPro(false);
    }
  };

  useEffect(() => {
    fetchPlan(token);
    // eslint-disable-next-line
  }, [token, tenant]);

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

  const upgrade = () => {
    setShowPay(true);
  };

  const handlePay = async () => {
    setError('');
    setShowPay(false);
    try {
      const res = await fetch(`${API}/tenants/${tenant}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Upgrade failed');
      setLimitReached(false);
      fetchNotes();
      fetchPlan(token);
      setShowProSnackbar(true);
    } catch (err) {
      setError('Upgrade failed');
    }
  };

  const handleDeactivatePro = async () => {
    setError('');
    try {
      const res = await fetch(`${API}/tenants/${tenant}/downgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Downgrade failed');
      setLimitReached(notes.length > 2);
      fetchPlan(token);
    } catch (err) {
      setError('Downgrade failed');
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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>Login</Typography>
            <Box component="form" onSubmit={login} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth autoFocus />
              <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Login</Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ fontSize: 13, mt: 3, color: 'text.secondary' }}>
              <b>Test Accounts:</b><br />
              admin@acme.test<br />
              user@acme.test<br />
              admin@globex.test<br />
              user@globex.test<br />
              (password: password)
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            SaaS Notes ({tenant})
            {isPro && (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ color: 'gold', mr: 0.5 }} />
                <Typography variant="subtitle2" sx={{ color: 'gold', fontWeight: 700 }}>Pro</Typography>
              </Box>
            )}
          </Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="secondary" sx={{ mr: 2 }}>
            <Tab label="Notes" />
            <Tab label="Settings" />
          </Tabs>
          <Typography variant="body1" sx={{ mr: 2 }}>Role: {role}</Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Dialog open={showPay} onClose={() => setShowPay(false)}>
        <DialogTitle>Upgrade to Pro</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Pay $10 to unlock unlimited notes for your company.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPay(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handlePay}>Pay & Upgrade</Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="md" sx={{ mt: 5 }}>
        {tab === 0 && (
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Notes</Typography>
              {role === 'admin' && (
                <Card elevation={1} sx={{ mb: 3, p: 2, bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Invite User</Typography>
                  <Box component="form" onSubmit={handleInvite} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField label="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required size="small" sx={{ flex: 2 }} />
                    <TextField select label="Role" value={inviteRole} onChange={e => setInviteRole(e.target.value)} size="small" sx={{ flex: 1 }}>
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                    <Button type="submit" variant="contained" size="small">Invite</Button>
                  </Box>
                  {inviteSuccess && <Alert severity="success" sx={{ mt: 1 }}>{inviteSuccess}</Alert>}
                  {/* Invited users list */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Invited Users:</Typography>
                    {(!invitedUsers || invitedUsers.length === 0) ? (
                      <Typography variant="body2" color="text.secondary">No invited users yet.</Typography>
                    ) : (
                      <List dense>
                        {invitedUsers.map((user, idx) => (
                          <ListItem key={user._id || idx} sx={{ pl: 0 }}>
                            <ListItemText
                              primary={user.email}
                              secondary={<>
                                Status: <b style={{ color: user.status === 'accepted' ? 'green' : '#bfa500' }}>{user.status}</b>
                                {user.role && (
                                  <span style={{ marginLeft: 12, color: '#888' }}>Role: {user.role}</span>
                                )}
                              </>}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </Card>
              )}
              <Box component="form" onSubmit={e => {
                e.preventDefault();
                if (!isPro && notes.length >= 3) {
                  setLimitReached(true);
                  return;
                }
                createNote(e);
              }} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required sx={{ flex: 1 }} />
                <TextField label="Content" value={content} onChange={e => setContent(e.target.value)} required sx={{ flex: 2 }} />
                <Button type="submit" variant="contained">Add Note</Button>
              </Box>
              {limitReached && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Free plan limit reached. Upgrade to Pro to add more notes.
                  <Button onClick={handlePay} size="small" variant="outlined" sx={{ ml: 2 }}>Activate Pro Plan</Button>
                </Alert>
              )}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <List>
                {notes.map(note => (
                  <Card key={note._id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>{note.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{note.content}</Typography>
                        </Box>
                        <IconButton edge="end" color="error" onClick={() => deleteNote(note._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        {tab === 1 && (
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Settings</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>User: <b>{email || localStorage.getItem('email') || 'Current User'}</b></Typography>
              <Typography variant="body1">Tenant: <b>{tenant}</b></Typography>
              <Typography variant="body1">Role: <b>{role}</b></Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>Current Plan: <b style={{ color: isPro ? 'gold' : '#888' }}>{isPro ? 'Pro' : 'Free'}</b></Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="warning" onClick={handlePay} disabled={isPro}>Activate Pro Plan</Button>
                <Button variant="outlined" color="secondary" onClick={handleDeactivatePro} disabled={!isPro}>Deactivate Pro Plan</Button>
              </Box>
              {isPro && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ color: 'gold', mr: 0.5 }} />
                  <Typography variant="subtitle2" sx={{ color: 'gold', fontWeight: 700 }}>Pro Plan Active</Typography>
                </Box>
              )}
              {!isPro && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>You are on the Free plan. Activate Pro to unlock unlimited notes.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    {/* Pro Plan Activated Snackbar */}
    <Snackbar
      open={showProSnackbar}
      autoHideDuration={3500}
      onClose={() => setShowProSnackbar(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      ContentProps={{
        sx: {
          background: 'linear-gradient(90deg, #FFD700 0%, #FFFACD 100%)',
          color: '#333',
          fontWeight: 700,
          fontSize: 18,
          boxShadow: 6,
          border: '2px solid #FFD700',
        }
      }}
      message={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StarIcon sx={{ color: 'gold', fontSize: 28, mb: '-2px' }} />
          Pro Plan Activated!
        </span>
      }
    />
    </Box>
  );
}
