"use client";
import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseRounded";

export default function CategoryEditor({ open, onClose, category, onSave }) {
  const [formData, setFormData] = useState(() => ({
    name: "",
    type: "expense",
  }));

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (category) {
        setFormData({
          name: category.name,
          type: category.type,
        });
      } else {
        setFormData({
          name: "",
          type: "expense",
        });
      }
    });
  }, [category, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      id: category ? category.id : undefined,
    });
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" fontWeight="bold">
            {category ? "Edit Category" : "New Category"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={3}>
          <ToggleButtonGroup
            value={formData.type}
            exclusive
            onChange={(e, val) =>
              val && setFormData({ ...formData, type: val })
            }
            fullWidth
            disabled={!!category}
          >
            <ToggleButton value="expense" color="error">
              Expense
            </ToggleButton>
            <ToggleButton value="income" color="success">
              Income
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!formData.name}
          >
            {category ? "Update Category" : "Create Category"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
