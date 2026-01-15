import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import prisma from '../../../../lib/prisma';

const parseDateSafe = (s) => {
  if (!s) return null;
  const d1 = new Date(s);
  if (!Number.isNaN(d1.getTime())) return d1;
  const m1 = s.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/]?(\d{2,4})$/);
  if (m1) {
    let day = Number(m1[1]);
    let month = Number(m1[2]) - 1;
    let year = Number(m1[3]);
    if (year < 100) year += 2000;
    const d2 = new Date(year, month, day);
    if (!Number.isNaN(d2.getTime())) return d2;
  }
  const m2 = s.match(/^(\d{4})[-\.\/](\d{1,2})[-\.\/](\d{1,2})$/);
  if (m2) {
    const year = Number(m2[1]);
    const month = Number(m2[2]) - 1;
    const day = Number(m2[3]);
    const d3 = new Date(year, month, day);
    if (!Number.isNaN(d3.getTime())) return d3;
  }
  return null;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { csv, mapping, delimiter = ',' } = body;
    if (!csv || !mapping) return NextResponse.json({ error: 'Missing csv or mapping' }, { status: 400 });

    const records = parse(csv, { columns: true, skip_empty_lines: true, delimiter });

    const rows = [];
    const errors = [];
    for (const [index, row] of records.entries()) {
      const dateRaw = row[mapping.date];
      const amountRaw = row[mapping.amount];
      const description = mapping.description ? row[mapping.description] : null;
      const categoryName = mapping.category ? row[mapping.category] : null;

      const amount = Number(String(amountRaw).replace(/[^0-9.-]+/g, ''));
      const date = parseDateSafe(dateRaw);
      const rowErrors = [];
      if (Number.isNaN(amount) || amount === null) rowErrors.push('Invalid amount');
      if (!date) rowErrors.push('Invalid date');


      let type = null;
      if (categoryName) {
        try {
          const cat = await prisma.category.findFirst({ where: { name: categoryName } });
          if (cat && cat.type) type = cat.type;
        } catch (e) {
          console.error('Category lookup failed:', e && e.stack ? e.stack : e);
        }
      }
      if (!type) {
        type = (typeof amount === 'number' && !Number.isNaN(amount) && amount < 0) ? 'expense' : 'income';
      }

      rows.push({ row: index + 1, date: date ? date.toISOString().slice(0,10) : dateRaw, category: categoryName, type, value: amountRaw, description });
      if (rowErrors.length) errors.push({ row: index + 1, errors: rowErrors });
      if (rows.length >= 5) break;
    }

    return NextResponse.json({ rows, errors });
  } catch (err) {
    console.error('Preview import error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Failed to parse CSV for preview' }, { status: 500 });
  }
}
