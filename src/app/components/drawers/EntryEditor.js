'use client';
import { useState, useEffect } from 'react';
import { 
  Drawer, Box, Typography, TextField, Button, Stack, ToggleButton, ToggleButtonGroup, IconButton, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import { useTheme } from '@mui/material/styles';

export default function EntryEditor({ open, onClose, entry, onSave, onDelete, categories }) {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: ''
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        amount: entry.amount,
        type: entry.type,
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        category_id: entry.category_id,
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

  const filteredCategories = categories.filter(c => c.type === formData.type);

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

            <TextField
                select
                label="Category"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                fullWidth
                required
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
            >
                <option value="" disabled>Select Category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </TextField>

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
