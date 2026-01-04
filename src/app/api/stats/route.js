import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateMonthlyStats, calculateCategoryStats, calculateYearlyBreakdown, calculateStatsForRange, calculateTrendForRange } from '@/services/stats';

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year'));
  const month = parseInt(searchParams.get('month')); 
  const range = searchParams.get('range'); // 'last12m', 'last6m', 'last3m', 'last1m'
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const entries = await db.entries.getAll(userId);

  // Handle Range Logic
  if (range || (from && to)) {
      let startDate, endDate;

      if (from && to) {
          startDate = new Date(from);
          endDate = new Date(to);
      } else if (range) {
          endDate = new Date();
          startDate = new Date();
          // Default to end of today
          endDate.setHours(23, 59, 59, 999);
          // Start date depends on range
          switch (range) {
              case 'last1m': startDate.setMonth(startDate.getMonth() - 1); break;
              case 'last3m': startDate.setMonth(startDate.getMonth() - 3); break;
              case 'last6m': startDate.setMonth(startDate.getMonth() - 6); break;
              case 'last12m': startDate.setFullYear(startDate.getFullYear() - 1); break;
              default: startDate.setFullYear(startDate.getFullYear() - 1); // Default 12m
          }
          startDate.setHours(0, 0, 0, 0);
      }

      const rangeStats = calculateStatsForRange(entries, startDate, endDate);
      const categoryStats = calculateCategoryStats(rangeStats.entries);
      const trend = calculateTrendForRange(entries, startDate, endDate);

      return NextResponse.json({
          ...rangeStats,
          categoryStats,
          yearlyTrends: trend // Reuse the same key for frontend compatibility or add new one
      });
  }

  if (!year) {
    return NextResponse.json({ error: 'Year or Range is required' }, { status: 400 });
  }

  const monthlyStats = calculateMonthlyStats(entries, year, month);
  
  // Calculate category stats based on the filtered entries from monthly stats
  const categoryStats = calculateCategoryStats(monthlyStats.entries);

  // Calculate yearly trends for the chart
  const yearlyTrends = calculateYearlyBreakdown(entries, year);

  return NextResponse.json({
    ...monthlyStats,
    categoryStats,
    yearlyTrends
  });
}
