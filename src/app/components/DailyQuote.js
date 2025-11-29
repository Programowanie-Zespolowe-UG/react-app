'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function DailyQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API: Advice Slip (Free, No Key)
    fetch('https://api.adviceslip.com/advice')
      .then(res => res.json())
      .then(data => {
        setQuote(data.slip.advice);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch quote', err);
        setQuote('Make today count!'); // Fallback
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton variant="rounded" height={80} />;

  return (
    <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.2 }}>
        <AutoAwesomeIcon sx={{ fontSize: 80 }} />
      </Box>
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
          Daily Wisdom
        </Typography>
        <Typography variant="h6" fontWeight="medium" sx={{ fontStyle: 'italic' }}>
          &quot;{quote}&quot;
        </Typography>
      </CardContent>
    </Card>
  );
}
