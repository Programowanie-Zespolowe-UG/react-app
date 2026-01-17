'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Box, TextField, Button, Typography, Container, Link, IconButton, useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useColorMode } from '../context/ThemeContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { mode } = useColorMode();
  const theme = useTheme();

  const fetchCaptcha = useCallback(async () => {
    try {
        const res = await fetch(`/api/auth/captcha?theme=${mode}`);
        if (res.ok) {
            const svg = await res.text();
            setCaptchaSvg(svg);
        }
    } catch (e) {
        console.error('Failed to fetch captcha');
    }
  }, [mode]);

  useEffect(() => {
      fetchCaptcha();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha: captchaValue }),
      });

      if (res.ok) {
        toast.success('Registration successful!');
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setCaptchaValue('');
        fetchCaptcha(); // Refresh captcha on error
      }
    } catch (err) {
      setError('An error occurred');
      setCaptchaValue('');
      fetchCaptcha();
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />


          <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
             <Box 
                sx={{ 
                    borderRadius: 1, 
                    overflow: 'hidden', 
                    border: '1px solid',
                    borderColor: 'divider',
                    lineHeight: 0,
                    bgcolor: 'background.paper' 
                }}
                dangerouslySetInnerHTML={{ __html: captchaSvg }} 
             />
             <IconButton onClick={fetchCaptcha} title="Refresh Captcha">
                <RefreshIcon />
             </IconButton>
          </Box>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Captcha Result"
            value={captchaValue}
            onChange={(e) => setCaptchaValue(e.target.value)}
            helperText="Solve the math equation above"
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              {"Already have an account? Sign In"}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
