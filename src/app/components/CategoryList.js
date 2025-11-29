'use client';
import { 
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Box, Paper 
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';

export default function CategoryList({ categories, title, onEdit, onDelete }) {
  if (categories.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, ml: 1 }} color="text.primary">{title}</Typography>
      <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: '16px' }}>
        <List disablePadding>
          {categories.map((cat, index) => (
            <ListItem 
              key={cat.id} 
              divider={index < categories.length - 1}
              sx={{ px: 2, py: 1.5 }}
            >
              <ListItemText 
                primary={cat.name} 
                primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                secondary={cat.is_default ? "Default" : "Custom"}
              />
              <ListItemSecondaryAction>
                 <IconButton edge="end" onClick={() => onEdit(cat)} sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                 </IconButton>
                 {!cat.is_default && (
                    <IconButton edge="end" onClick={() => onDelete(cat.id)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                 )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
