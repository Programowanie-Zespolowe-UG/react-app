"use client";
import {
  Box,
  Stack,
  Typography,
  Fab,
  CircularProgress,
  Container,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Collapse,
  Tooltip,
  Input,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import EntryCard from "../../components/EntryCard";
import { useEffect, useState } from "react";

export const sortingType = {
    dateDesc: "date-desc",
    dateAsc: "date-asc",
    amountAsc: "amount-asc",
    amountDesc: "amount-desc"
}
export const filterType = {
   all: "all",
   expense: "expense",
   income: "income"
}

export default function RenderEntries({ entries, openEntryEditor }) {

    const [showFilters, setShowFilters] = useState(false);
    const [filterBy, setFilterBy] = useState(filterType.all); // 'all', 'income', 'expense'
    const [sortBy, setSortBy] = useState(sortingType.dateDesc);
    const [searchQuery, setSearchQuery] = useState('');

    console.log(entries);

    const getSignedAmount = (entry) => {
        const type = entry.type || entry.category?.type || 'expense';
        return type === 'expense' ? -entry.amount : entry.amount;
    };

    const filteredEntries = Array.from(entries || [])
    .filter((entry) => {

        if(entry == null || entry == undefined){
            return false;
        }

        const type = entry.type || entry.category?.type || 'expense';
        if(filterBy !== filterType.all && type !== filterBy) return false;

        if(searchQuery) {
            const query = searchQuery.toLowerCase();
            const description = entry.description?.toLowerCase() || "";
            const categoryName = entry.category?.name?.toLowerCase() || "";
            return description.includes(query) || categoryName.includes(query);
        }

        return true;
    })
    .sort((a, b) => {
         switch(sortBy) {
            case sortingType.dateDesc:
                return new Date(b.date) - new Date(a.date)
            case sortingType.dateAsc:
                return new Date(a.date) - new Date(b.date)
            case sortingType.amountAsc:
                return getSignedAmount(a) - getSignedAmount(b)
            case sortingType.amountDesc:
                return getSignedAmount(b) - getSignedAmount(a)
         }
    });


    return (
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Transactions
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
              >
                <FilterListIcon />
              </IconButton>
            </Stack>
          </Stack>
  
          <Collapse in={showFilters}>
            {/* Optimize Components */}
            <Box
              sx={{
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} overflow="auto" pb={1}>
    
                  <Chip
                    label="All"
                    color={filterBy === filterType.all ? "primary" : "default"}
                    onClick={() => setFilterBy(filterType.all)}
                    variant={filterBy === filterType.all ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Expenses"
                    color={filterBy === filterType.expense ? "error" : "default"}
                    onClick={() => setFilterBy(filterType.expense)}
                    variant={filterBy === filterType.expense ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Income"
                    color={filterBy === filterType.income ? "success" : "default"}
                    onClick={() => setFilterBy(filterType.income)}
                    variant={filterBy === filterType.income ? "filled" : "outlined"}
                  />
                </Stack>
  
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="date-desc">Newest First</MenuItem>
                    <MenuItem value="date-asc">Oldest First</MenuItem>
                    <MenuItem value="amount-desc">Highest Amount</MenuItem>
                    <MenuItem value="amount-asc">Lowest Amount</MenuItem>
                  </Select>
                </FormControl>
                <Paper
                  component="form"
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search Transactions"
                    inputProps={{ "aria-label": "search transactions" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <IconButton
                    type="button"
                    sx={{ p: "10px" }}
                    aria-label="search"
                  >
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Stack>
            </Box>
          </Collapse>
  
          <Box>
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => openEntryEditor(entry)}
              />
            ))}
            {filteredEntries.length === 0 && (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  {entries.length === 0
                    ? "No transactions yet."
                    : "No transactions match your filter."}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      );
}
