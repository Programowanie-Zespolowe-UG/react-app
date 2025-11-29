'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide, Stack, Divider, Typography
} from '@mui/material';
import React from 'react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SettingsDialog({ open, onClose, user, onUpdateUser, onPasswordChange }) {
  const [name, setName] = useState('');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
    // Reset password fields and error on open
    if (open) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setError('');
    }
  }, [user, open]);

  const handleNameSave = () => {
    onUpdateUser({ name });
    onClose();
  };
  
  const handlePasswordChange = async () => {
      setError('');
      if (passwordData.newPassword !== passwordData.confirmPassword) {
          setError("New passwords don't match");
          return;
      }
      try {
          await onPasswordChange(passwordData);
          onClose();
      } catch (err) {
          setError(err.message || 'An error occurred.');
      }
  }

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="alert-dialog-slide-description"
      PaperProps={{
        sx: { borderRadius: '16px', p: 1 }
      }}
    >
      <DialogTitle fontWeight="bold">Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
             <Typography variant="subtitle1" fontWeight="bold">Profile</Typography>
             <TextField
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                variant="outlined"
             />
             <Button onClick={handleNameSave} variant="contained">Save Name</Button>
             
             <Divider sx={{ my: 2 }} />

             <Typography variant="subtitle1" fontWeight="bold">Change Password</Typography>
             <TextField
                label="Old Password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                fullWidth
                variant="outlined"
             />
             <TextField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                fullWidth
                variant="outlined"
             />
             <TextField
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                fullWidth
                variant="outlined"
             />
             {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}
             <Button onClick={handlePasswordChange} variant="contained" color="secondary">Change Password</Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
