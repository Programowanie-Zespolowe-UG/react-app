'use client';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AddCircleIcon from '@mui/icons-material/AddCircleRounded';
import ListIcon from '@mui/icons-material/ListRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import AssessmentIcon from '@mui/icons-material/AssessmentRounded';

export default function BottomNav({ value, onChange }) {
  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, borderRadius: 0 }} 
      elevation={5}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
        sx={{ height: 64 }}
      >
        <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Add" icon={<AddCircleIcon />} />
        <BottomNavigationAction label="Entries" icon={<ListIcon />} />
        <BottomNavigationAction label="Categories" icon={<CategoryIcon />} />
        <BottomNavigationAction label="Reports" icon={<AssessmentIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
