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
import AddIcon from "@mui/icons-material/AddRounded";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";

import BottomNav from "./components/BottomNav";
import StatsCard from "./components/StatsCard";
import EntryCard from "./components/EntryCard";
import CategoryList from "./components/CategoryList";
import DailyQuote from "./components/DailyQuote";
import SettingsDialog from "./components/SettingsDialog";
import EntryEditor from "./components/drawers/EntryEditor";
import CategoryEditor from "./components/drawers/CategoryEditor";
import RenderEntries from "./components/filerAndSort/renderEntries"

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

  // Data State
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  // Drawer State
  const [entryEditorOpen, setEntryEditorOpen] = useState(false);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);


  const currentYear = new Date().getFullYear();

  const fetchData = useCallback(async () => {
    try {
      const [resEntries, resCats, resStats] = await Promise.all([
        fetch("/api/entries"),
        fetch("/api/categories"),
        fetch(`/api/stats?year=${currentYear}`),
      ]);

      if (
        resEntries.status === 401 ||
        resCats.status === 401 ||
        resStats.status === 401
      ) {
        logout();
        return;
      }

      if (resEntries.ok && resCats.ok && resStats.ok) {
        setEntries(await resEntries.json());
        setCategories(await resCats.json());
        setStats(await resStats.json());
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }, [currentYear, logout]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      // Schedule fetchData asynchronously to avoid synchronous setState in effect
      queueMicrotask(() => {
        fetchData();
      });
    }
  }, [isAuthenticated, authLoading, fetchData, router]);

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
      }
    } catch (error) {
      console.error("Failed to update user", error);
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
  };

  const handleSaveEntry = async (entryData) => {
    try {
      const method = entryData.id ? "PUT" : "POST";
      const url = entryData.id
        ? `/api/entries/${entryData.id}`
        : "/api/entries";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });
      fetchData();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (confirm("Delete this entry?")) {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const handleSaveCategory = async (catData) => {
    try {
      const method = catData.id ? "PUT" : "POST";
      const url = catData.id
        ? `/api/categories/${catData.id}`
        : "/api/categories";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catData),
      });
      fetchData();
    } catch (e) {
      console.error("Save cat failed", e);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Delete category?")) {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchData();
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

  // --- Render Screens ---

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
    if (!stats)
      return (
        <Box suppressHydrationWarning>
          <CircularProgress />
        </Box>
      );

    const { totalIncome, totalExpense, balance, yearlyTrends } = stats;

    // Use real yearlyTrends from API, or fallback to empty array
    const trendData = yearlyTrends || [];

    return (
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Hello, {user?.name || user?.email || "User"}! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here is your financial overview
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
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

        {/* Monthly Trends Chart */}
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
            Monthly Trends
          </Typography>
          <Box sx={{ flexGrow: 1, width: "100%", minHeight: 0 }}>
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
                  tick={{ fill: theme.palette.text.secondary }}
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
    if (!stats)
      return (
        <Box suppressHydrationWarning>
          <CircularProgress />
        </Box>
      );

    const { totalIncome, totalExpense, categoryStats } = stats;
    
    // Logic for Savings Rate / Financial Health
    let chartValue = 0;
    let chartColor = theme.palette.primary.main;
    let labelText = "0%";
    let subLabel = "Neutral";

    if (totalIncome > 0) {
      const rate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (rate >= 0) {
        // Positive Savings
        chartValue = rate;
        chartColor = theme.palette.success.main; // Green
        labelText = `${rate.toFixed(1)}%`;
        subLabel = "Saved";
      } else {
        // Negative Savings (Overspending relative to income)
        chartValue = 100; // Full circle to indicate alert
        chartColor = theme.palette.error.main; // Red
        labelText = `-${Math.abs(rate).toFixed(0)}%`;
        subLabel = "Overspent";
      }
    } else if (totalExpense > 0) {
        // Spent money but earned nothing
        chartValue = 100;
        chartColor = theme.palette.error.main;
        labelText = "N/A";
        subLabel = "Overspent";
    }

    const savingsData = [{ name: subLabel, value: chartValue, fill: chartColor }];
    const expenseData = categoryStats.filter((c) => c.type === "expense");
    
    const COLORS = [
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#8884d8",
      "#82ca9d",
    ];

    return (
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Reports
        </Typography>

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
            Financial Health
          </Typography>
          <Box sx={{ width: "100%", height: 250, mt: 2, position: 'relative' }}>
             {/* Text in the middle of the chart */}
            <Box 
              sx={{
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}
            >
                <Typography variant="h4" fontWeight="bold" color={chartColor}>
                    {labelText}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subLabel}
                </Typography>
            </Box>

            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                barSize={20}
                data={savingsData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                {/* Removed Legend and Tooltip for cleaner gauge look */}
              </RadialBarChart>
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
          
          {expenseData.length > 0 ? (
            <>
              <Box sx={{ width: "100%", height: 250, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => `${value.toFixed(2)}`}
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
              {/* Simple Legend */}
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1}
                justifyContent="center"
                mt={2}
              >
                {expenseData.slice(0, 5).map((c, i) => (
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
            </>
          ) : (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography color="text.secondary">No expenses yet</Typography>
            </Box>
          )}
        </Box>
      </Stack>
    );
  };

  <RenderEntries/>

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
        minHeight: "100vh",
        pb: 8, // Space for bottom nav
      }}
    >
      <Container maxWidth="sm" sx={{ py: 3, px: 2 }}>
        {currentTab === 0 && renderDashboard()}
        {currentTab === 2 && <RenderEntries entries={entries} openEntryEditor={openEntryEditor} />}
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

        {/* Global Drawers */}
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
    </Box>
  );
}
