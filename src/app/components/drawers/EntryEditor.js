'use client';
import { useState, useEffect } from 'react';
import { 
  Drawer, Box, Typography, TextField, Button, Stack, ToggleButton, ToggleButtonGroup, IconButton, Divider,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';

export default function EntryEditor({ open, onClose, entry, onSave, onDelete, categories = [] }) {
  
  const [formData, setFormData] = useState(() => ({
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: ''
  }));

  useEffect(() => {
    if (!open) return;

    // Schedule state updates asynchronously to avoid cascading renders
    queueMicrotask(() => {
      if (entry) {
        setFormData({
          amount: entry.amount,
          type: entry.category?.type || entry.type || 'expense',
          date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
          category_id: entry.categoryId || entry.category_id,
          description: entry.description || ''
        });
      } else {
        // Reset for add mode
        setFormData({
          amount: '',
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          category_id: '',
          description: ''
        });
      }
    });
  }, [entry, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setFormData({ ...formData, type: newType, category_id: '' });
    }
  };

  const handleSubmit = () => {
    onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        id: entry ? entry.id : undefined 
    });
    onClose();
  };

  const uniqueCategoriesArray = Array.from(new Set(categories));
  const filteredCategories = uniqueCategoriesArray.filter(c => c.type === formData.type);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '90vh'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {entry ? 'Edit Entry' : 'New Entry'}
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Stack spacing={3}>
           <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
            >
              <ToggleButton value="expense" color="error">Expense</ToggleButton>
              <ToggleButton value="income" color="success">Income</ToggleButton>
            </ToggleButtonGroup>

            <TextField
                label="Amount (PLN)"
                name="amount"
                value={formData.amount}
                onChange={(e) => {
                    const val = e.target.value;
                    // Allow positive numbers with up to 2 decimal places
                    if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
                        setFormData({ ...formData, amount: val });
                    }
                }}
                fullWidth
                required
                slotProps={{
                    htmlInput: { inputMode: 'decimal', placeholder: '0.00' }
                }}
                InputProps={{
                    style: { fontSize: '1.5rem', fontWeight: 'bold' }
                }}
            />

            <Stack direction="row" spacing={2}>
                 <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                />
            </Stack>

            <FormControl fullWidth required>
              <InputLabel 
                id="category-select-label" 
                shrink
                sx={{
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                    backgroundColor: 'background.paper',
                    padding: '0 4px',
                  },
                }}
              >
                Category
              </InputLabel>
              <Select
                labelId="category-select-label"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                label="Category"
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em style={{ disabled: true, color: '#b3b3b3' }}>Select Category</em>;
                  }
                  const category = filteredCategories.find(c => c.id === parseInt(selected));
                  return category ? category.name : '';
                }}
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '12px',
                  },
                  '& .MuiInputLabel-root': {
                    zIndex: 1,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      mt: 1,
                      maxHeight: 300,
                      '& .MuiMenuItem-root': {
                        borderRadius: '8px',
                        mx: 1,
                        my: 0.5,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {filteredCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
            />

            <Button 
                variant="contained" 
                size="large" 
                onClick={handleSubmit}
                disabled={!formData.amount || !formData.category_id}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
                {entry ? 'Save Changes' : 'Add Entry'}
            </Button>
            
            {entry && (
                <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                        onDelete(entry.id);
                        onClose();
                    }}
                >
                    Delete Entry
                </Button>
            )}
        </Stack>
      </Box>
    </Drawer>
  );
}
