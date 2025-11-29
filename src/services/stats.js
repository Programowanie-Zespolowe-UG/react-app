// Pure functions for calculating stats
// This service layer is designed to be usable by both API routes and future AI agents.

export function calculateMonthlyStats(entries, year, month) {
  let filteredEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year;
  });

  if (month) {
    filteredEntries = filteredEntries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month;
    });
  }

  const totalIncome = filteredEntries
    .filter(e => e.category && e.category.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = filteredEntries
    .filter(e => e.category && e.category.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalExpense;

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    balance,
    entries: filteredEntries // useful for drill-down
  };
}

export function calculateCategoryStats(entries) {
  const categoryStats = {};

  entries.forEach(e => {
    if (!e.category) return;
    const catName = e.category.name;
    if (!categoryStats[catName]) {
      categoryStats[catName] = { name: catName, type: e.category.type, value: 0 };
    }
    categoryStats[catName].value += e.amount;
  });

  return Object.values(categoryStats);
}

export function calculateYearlyBreakdown(entries, year) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return months.map((monthName, index) => {
    // Filter entries for this specific month
    const monthlyEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === index;
    });

    const income = monthlyEntries
        .filter(e => e.category && e.category.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);

    const expense = monthlyEntries
        .filter(e => e.category && e.category.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);

    return {
        name: monthName,
        income,
        expense
    };
  });
}
