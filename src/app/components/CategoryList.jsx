'use client';
import { useState } from 'react';
import { 
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Box, Paper,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import { toast } from 'sonner';

export default function CategoryList({ categories, title, onEdit, onDeleteSuccess }) {
  const [deleteConflict, setDeleteConflict] = useState({ isOpen: false, categoryId: null, count: 0 });

  if (categories.length === 0) return null;

  const performDelete = async (id, options = {}) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options)
      });
      
      if (res.ok) {
        toast.success("Category deleted.");
        onDeleteSuccess();
        setDeleteConflict({ isOpen: false, categoryId: null, count: 0 });
      } else if (res.status === 409) {
         const data = await res.json();
         if (data.error === 'RELATION_EXISTS') {
             setDeleteConflict({ isOpen: true, categoryId: id, count: data.count });
         } else {
            toast.error("Failed to delete category.");
         }
      } else {
         const { error } = await res.json();
         toast.error(error || "Failed to delete category.");
      }
    } catch (error) {
       console.error("Delete failed", error);
       toast.error("Network error while deleting category.");
    }
  };

  const handleInitialDelete = async (id) => {
    if (confirm("Delete category?")) {
        await performDelete(id);
    }
  };

  const handleForceDelete = async () => {
      await performDelete(deleteConflict.categoryId, { force: true });
  };

  const handleReassignDelete = async () => {
    await performDelete(deleteConflict.categoryId, { reassignTo: 'other' });
  };

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
                secondary={!cat.userId ? "Default" : "Custom"}
              />
              <ListItemSecondaryAction>
                 {cat.userId && (
                    <IconButton edge="end" onClick={() => onEdit(cat)} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                 )}
                 {cat.userId && (
                    <IconButton edge="end" onClick={() => handleInitialDelete(cat.id)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                 )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={deleteConflict.isOpen}
        onClose={() => setDeleteConflict({ isOpen: false, categoryId: null, count: 0 })}
      >
        <DialogTitle>Cannot delete category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This category contains {deleteConflict.count} entries. 
            You cannot delete it without handling the existing entries.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConflict({ isOpen: false, categoryId: null, count: 0 })}>
            Cancel
          </Button>
          <Button onClick={handleReassignDelete} color="primary">
            Move to &apos;Other&apos;
          </Button>
          <Button onClick={handleForceDelete} color="error">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
