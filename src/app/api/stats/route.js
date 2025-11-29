import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateMonthlyStats, calculateCategoryStats, calculateYearlyBreakdown } from '@/services/stats';

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year'));
  const month = parseInt(searchParams.get('month')); 

  if (!year) {
    return NextResponse.json({ error: 'Year is required' }, { status: 400 });
  }

  const entries = await db.entries.getAll(userId);

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
