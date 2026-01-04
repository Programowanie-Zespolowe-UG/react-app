'use client';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatsCard({ title, amount, color, bgcolor }) {
  return (
    <Card sx={{ bgcolor: bgcolor || 'background.paper', color: color || 'text.primary', flex: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="inherit">
          {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount)}
        </Typography>
      </CardContent>
    </Card>
  );
}
