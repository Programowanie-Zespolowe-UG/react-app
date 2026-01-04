'use client';
import { Card, CardActionArea, Typography, Box, Avatar, Stack } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';

export default function EntryCard({ entry, onClick }) {
  const isIncome = entry?.category?.type === 'income';
  
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea onClick={onClick}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
          <Avatar
            sx={{
              bgcolor: isIncome ? 'success.light' : 'error.light',
              color: isIncome ? 'success.dark' : 'error.dark'
            }}
          >
            {isIncome ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {entry.category ? entry.category.name : 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(entry.date).toLocaleDateString()} 
              {entry.description && ` • ${entry.description}`}
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color={isIncome ? 'success.main' : 'error.main'}
          >
            {isIncome ? '+' : '-'}{new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(entry.amount)}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
