"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Stack,
  Typography,
  Fab,
  CircularProgress,
  Container,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip as MuiTooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import BottomNav from "./components/BottomNav";
import StatsCard from "./components/StatsCard";
import EntryCard from "./components/EntryCard";
import CategoryList from "./components/CategoryList";
import DailyQuote from "./components/DailyQuote";
import SettingsDialog from "./components/SettingsDialog";
import EntryEditor from "./components/drawers/EntryEditor";
import CategoryEditor from "./components/drawers/CategoryEditor";
import RenderEntries from "./components/filerAndSort/renderEntries";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  Label,
} from "recharts";
import { useColorMode } from "./context/ThemeContext";
import { useTheme } from "@mui/material/styles";

export default function Home() {
  const {
    isAuthenticated,
    user,
    logout,
    loading: authLoading,
    updateUser,
  } = useAuth();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const { toggleColorMode, mode } = useColorMode();
  const theme = useTheme();

  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [entryEditorOpen, setEntryEditorOpen] = useState(false);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [reportRange, setReportRange] = useState("last12m"); // 'last12m', 'last6m', 'last3m', 'last1m', '2025', etc.
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?range=last12m`, { cache: "no-store" });
      if (res.ok) setDashboardStats(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    try {
      let url = `/api/stats?range=${reportRange}`;
      // specific year logic
      if (!isNaN(reportRange)) {
        url = `/api/stats?year=${reportRange}`;
      }

      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) setReportStats(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [reportRange]);

  const fetchData = useCallback(async () => {
    try {
      const [resEntries, resCats] = await Promise.all([
        fetch("/api/entries", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      if (resEntries.status === 401 || resCats.status === 401) {
        logout();
        return;
      }

      if (resEntries.ok && resCats.ok) {
        setEntries(await resEntries.json());
        setCategories(await resCats.json());
      }

      fetchDashboardData();
      fetchReportData();
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }, [logout, fetchDashboardData, fetchReportData]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      queueMicrotask(() => {
        fetchData();
      });
    }
  }, [isAuthenticated, authLoading, fetchData, router, reportRange]);

  const handleUpdateUser = async (newUserData) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        setSnackbar({
          open: true,
          message: "Profile updated successfully.",
          severity: "success",
        });
      } else {
        const { error } = await res.json();
        setSnackbar({
          open: true,
          message: error || "Failed to update profile.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Failed to update user", error);
      setSnackbar({
        open: true,
        message: "Network error while updating profile.",
        severity: "error",
      });
    }
  };

  const handlePasswordChange = async (passwordData) => {
    const res = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    setSnackbar({
      open: true,
      message: "Password changed successfully.",
      severity: "success",
    });
  };

  const handleSaveEntry = async (entryData) => {
    try {
      const method = entryData.id ? "PUT" : "POST";
      const url = entryData.id
        ? `/api/entries/${entryData.id}`
        : "/api/entries";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setSnackbar({
          open: true,
          message: error || "Failed to save transaction.",
          severity: "error",
        });
        return;
      }
      fetchData();
      setSnackbar({
        open: true,
        message: entryData.id ? "Transaction updated." : "Transaction added.",
        severity: "success",
      });
    } catch (e) {
      console.error("Save failed", e);
      setSnackbar({
        open: true,
        message: "Network error while saving transaction.",
        severity: "error",
      });
    }
  };

  const handleDeleteEntry = async (id) => {
    if (confirm("Delete this entry?")) {
      try {
        const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const { error } = await res.json();
          setSnackbar({
            open: true,
            message: error || "Failed to delete transaction.",
            severity: "error",
          });
          return;
        }
        fetchData();
        setSnackbar({
          open: true,
          message: "Transaction deleted.",
          severity: "success",
        });
      } catch (e) {
        console.error("Delete failed", e);
        setSnackbar({
          open: true,
          message: "Network error while deleting transaction.",
          severity: "error",
        });
      }
    }
  };

  const handleSaveCategory = async (catData) => {
    try {
      const method = catData.id ? "PUT" : "POST";
      const url = catData.id
        ? `/api/categories/${catData.id}`
        : "/api/categories";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catData),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setSnackbar({
          open: true,
          message: error || "Failed to save category.",
          severity: "error",
        });
        return;
      }
      fetchData();
      setSnackbar({
        open: true,
        message: catData.id ? "Category updated." : "Category added.",
        severity: "success",
      });
    } catch (e) {
      console.error("Save cat failed", e);
      setSnackbar({
        open: true,
        message: "Network error while saving category.",
        severity: "error",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Delete category?")) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const { error } = await res.json();
          setSnackbar({
            open: true,
            message: error || "Failed to delete category.",
            severity: "error",
          });
          return;
        }
        fetchData();
        setSnackbar({
          open: true,
          message: "Category deleted.",
          severity: "success",
        });
      } catch (e) {
        console.error("Delete failed", e);
        setSnackbar({
          open: true,
          message: "Network error while deleting category.",
          severity: "error",
        });
      }
    }
  };

  const openEntryEditor = (entry = null) => {
    setEditingEntry(entry);
    setEntryEditorOpen(true);
  };

  const openCategoryEditor = (cat = null) => {
    setEditingCategory(cat);
    setCategoryEditorOpen(true);
  };

  if (authLoading)
    return (
      <Box
        suppressHydrationWarning
        sx={{ display: "flex", justifyContent: "center", mt: 10 }}
      >
        <CircularProgress />
      </Box>
    );

  const renderDashboard = () => {
    if (!dashboardStats)
      return (
        <Box suppressHydrationWarning>
          <CircularProgress />
        </Box>
      );

    const { totalIncome, totalExpense, balance, yearlyTrends } = dashboardStats;
    const trendData = yearlyTrends || [];

    return (
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="text.primary"
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              Hello, {user?.name || user?.email || "User"}! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 12 Months Overview
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexShrink={0}>
            <IconButton onClick={() => setSettingsOpen(true)} color="inherit">
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton onClick={logout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Stack>

        <DailyQuote />

        <Stack direction="row" spacing={2}>
          <StatsCard
            title="Income"
            amount={totalIncome}
            bgcolor={mode === "dark" ? "rgba(0, 200, 83, 0.1)" : "#e3f2fd"}
            color={mode === "dark" ? "#69f0ae" : "#1565c0"}
          />
          <StatsCard
            title="Expense"
            amount={totalExpense}
            bgcolor={mode === "dark" ? "rgba(255, 82, 82, 0.1)" : "#fce4ec"}
            color={mode === "dark" ? "#ff5252" : "#c2185b"}
          />
        </Stack>
        <StatsCard
          title="Total Balance"
          amount={balance}
          bgcolor={
            mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : balance >= 0
              ? "#e8f5e9"
              : "#ffebee"
          }
          color={
            mode === "dark"
              ? balance >= 0
                ? "#69f0ae"
                : "#ff5252"
              : balance >= 0
              ? "#2e7d32"
              : "#c62828"
          }
        />

        <Box
          sx={{
            height: 300,
            bgcolor: "background.paper",
            borderRadius: "16px",
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            color="text.primary"
          >
            Trends (Last 12 Months)
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              minHeight: 0,
              "& *:focus": { outline: "none !important" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                />
                <RechartsTooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderRadius: 12,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                  formatter={(value) =>
                    new Intl.NumberFormat("pl-PL", {
                      style: "currency",
                      currency: "PLN",
                    }).format(value)
                  }
                />
                <Bar
                  dataKey="income"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                  activeBar={false}
                />
                <Bar
                  dataKey="expense"
                  fill={theme.palette.secondary.main}
                  radius={[4, 4, 0, 0]}
                  activeBar={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Stack>
    );
  };

  const renderReports = () => {
    if (!reportStats)
      return (
        <Box suppressHydrationWarning>
          <CircularProgress />
        </Box>
      );

    const { totalIncome, totalExpense, categoryStats } = reportStats;
    const savingsRate =
      totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
    const savingsValue = Math.round(savingsRate * 100);
    // Create data for gauge: [Savings, Remaining]
    const savingsData = [
      { name: "Savings", value: savingsValue },
      { name: "Remaining", value: 100 - savingsValue },
    ];
    const COLORS = [
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#8884d8",
      "#82ca9d",
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 4 }, (_, i) =>
      (currentYear - i).toString()
    ); // [2026, 2025, 2024, 2023]
    const ranges = [
      { label: "1M", value: "last1m" },
      { label: "3M", value: "last3m" },
      { label: "6M", value: "last6m" },
      { label: "1Y", value: "last12m" },
    ];

    return (
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Reports
          </Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              variant="outlined"
              sx={{
                borderRadius: 3,
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.divider,
                },
              }}
            >
              {ranges.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
              <MenuItem disabled>Years</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box
          sx={{
            minHeight: 350,
            bgcolor: "background.paper",
            borderRadius: "16px",
            p: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.primary"
            >
              Savings Rate
            </Typography>
            <MuiTooltip
              title="Percentage of income saved after expenses (Income - Expenses) / Income"
              arrow
            >
              <InfoOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ cursor: "help" }}
              />
            </MuiTooltip>
          </Stack>
          <Box
            sx={{
              width: "100%",
              height: 250,
              mt: 2,
              "& *:focus": { outline: "none !important" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={savingsData}
                  cx="50%"
                  cy="70%"
                  innerRadius={80}
                  outerRadius={110}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={0}
                >
                  <Cell fill={theme.palette.primary.main} />
                  <Cell
                    fill={theme.palette.mode === "dark" ? "#333" : "#e0e0e0"}
                  />
                  <Label
                    value={`${savingsValue}%`}
                    position="center"
                    dy={-5}
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      fill: theme.palette.text.primary,
                    }}
                  />
                </Pie>
                <RechartsTooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderRadius: 12,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  payload={[
                    {
                      value: "Savings",
                      type: "square",
                      id: "ID01",
                      color: theme.palette.primary.main,
                    },
                    {
                      value: "Remaining",
                      type: "square",
                      id: "ID02",
                      color: theme.palette.text.secondary,
                    },
                  ]}
                  formatter={(value) => (
                    <span style={{ color: theme.palette.text.primary }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box
          sx={{
            minHeight: 350,
            bgcolor: "background.paper",
            borderRadius: "16px",
            p: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            color="text.primary"
          >
            Expenses Breakdown
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 250,
              mt: 2,
              "& *:focus": { outline: "none !important" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats.filter((c) => c.type === "expense")}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryStats
                    .filter((c) => c.type === "expense")
                    .map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("pl-PL", {
                      style: "currency",
                      currency: "PLN",
                    }).format(value)
                  }
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderRadius: 12,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            justifyContent="center"
            mt={2}
          >
            {categoryStats
              .filter((c) => c.type === "expense")
              .map((c, i) => (
                <Box
                  key={c.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: COLORS[i % COLORS.length],
                      borderRadius: "50%",
                      mr: 0.5,
                    }}
                  />
                  {c.name}
                </Box>
              ))}
          </Stack>
        </Box>
      </Stack>
    );
  };

  const renderCategories = () => (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Categories
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => openCategoryEditor()}>
          New
        </Button>
      </Stack>

      <CategoryList
        title="Income"
        categories={categories.filter((c) => c.type === "income")}
        onEdit={openCategoryEditor}
        onDelete={handleDeleteCategory}
      />

      <CategoryList
        title="Expenses"
        categories={categories.filter((c) => c.type === "expense")}
        onEdit={openCategoryEditor}
        onDelete={handleDeleteCategory}
      />
    </Stack>
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pb: "calc(64px + env(safe-area-inset-bottom))", // Space for bottom nav + safe area
      }}
    >
      <Container maxWidth="sm" sx={{ py: 3, px: 2 }}>
        {currentTab === 0 && renderDashboard()}
        {currentTab === 2 && (
          <RenderEntries
            entries={entries}
            openEntryEditor={openEntryEditor}
          />
        )}
        {currentTab === 3 && renderCategories()}
        {currentTab === 4 && renderReports()}

        <BottomNav
          value={currentTab}
          onChange={(val) => {
            if (val === 1) {
              openEntryEditor();
            } else {
              setCurrentTab(val);
            }
          }}
        />

        <EntryEditor
          open={entryEditorOpen}
          onClose={() => {
            setEntryEditorOpen(false);
            setEditingEntry(null);
          }}
          entry={editingEntry}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          categories={categories}
        />

        <CategoryEditor
          open={categoryEditorOpen}
          onClose={() => {
            setCategoryEditorOpen(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onSave={handleSaveCategory}
        />

        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onPasswordChange={handlePasswordChange}
        />
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
