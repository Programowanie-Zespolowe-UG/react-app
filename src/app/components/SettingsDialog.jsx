'use client';
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide, Stack, Divider, Typography, useMediaQuery
} from '@mui/material';
import React from 'react';
import { useTheme } from '@mui/material/styles';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SettingsDialog({ open, onClose, user, onUpdateUser, onPasswordChange }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState(() => user?.name || '');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;


    queueMicrotask(() => {
      if (user?.name !== undefined) {
      setName(user.name || '');
    }
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setError('');
    });
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
      fullScreen={fullScreen}
      keepMounted
      onClose={onClose}
      scroll="paper"
      aria-describedby="alert-dialog-slide-description"
      PaperProps={{
        sx: { borderRadius: fullScreen ? 0 : '16px', p: 1 }
      }}
    >
      <DialogTitle fontWeight="bold">Settings</DialogTitle>
      <DialogContent
        dividers
        sx={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Stack spacing={1.5} sx={{ mt: 1, minWidth: 0 }}>
             <Typography variant="subtitle1" fontWeight="bold">Profile</Typography>
             <TextField
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
             />
             <Button onClick={handleNameSave} variant="contained" size="small">Save Name</Button>
             
             <Divider sx={{ my: 2 }} />

             <Typography variant="subtitle1" fontWeight="bold">Change Password</Typography>
             <TextField
                label="Old Password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                fullWidth
                variant="outlined"
                size="small"
             />
             <TextField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                fullWidth
                variant="outlined"
                size="small"
             />
             <TextField
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                fullWidth
                variant="outlined"
                size="small"
             />
             {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}
             <Button onClick={handlePasswordChange} variant="contained" color="secondary" size="small">Change Password</Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
