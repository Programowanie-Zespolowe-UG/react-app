import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { parse } from 'csv-parse/sync';


export async function POST(request) {
  try {
    const body = await request.json();
    const { csv, mapping, userId, delimiter = ',' } = body;

    if (!csv || !mapping || !userId) {
      return NextResponse.json({ error: 'Missing csv, mapping or userId' }, { status: 400 });
    }


    const records = parse(csv, { columns: true, skip_empty_lines: true, delimiter });

    let imported = 0;
    const errors = [];


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

    for (const [index, row] of records.entries()) {
      const rowNum = index + 1;
      try {
        const dateRaw = row[mapping.date];
        const amountRaw = row[mapping.amount];
        const description = mapping.description ? row[mapping.description] : null;
        const categoryName = mapping.category ? row[mapping.category] : null;

        const amount = Number(String(amountRaw).replace(/[^0-9.-]+/g, ''));
        const date = parseDateSafe(dateRaw);

        const rowErrors = [];
        if (Number.isNaN(amount) || amount === null) rowErrors.push('Invalid amount');
        if (!date) rowErrors.push('Invalid date');
        if (rowErrors.length) {
          errors.push({ row: rowNum, reason: rowErrors.join('; '), raw: { date: dateRaw, amount: amountRaw } });
          continue;
        }


        const inferredType = amount < 0 ? 'expense' : 'income';

        // Resolve or create category. If existing category is found, use its stored type.
        let category = null;
        let finalType = inferredType;
        if (categoryName) {
          const allCats = await db.categories.getAll(userId);
          const nameNorm = String(categoryName).trim().toLowerCase();
          category = allCats.find((c) => String(c.name).trim().toLowerCase() === nameNorm && (c.userId === null || c.userId === userId));
          if (category) {
            finalType = category.type || inferredType;
          } else {
            // create new category with inferred type
            category = await db.categories.create({ name: categoryName, type: inferredType }, userId);
            finalType = inferredType;
          }
        }

        if (!category) {
          const allCats = await db.categories.getAll(userId);
          category = allCats.find((c) => c.name === 'Imported' && c.userId === userId);
          if (!category) {
            category = await db.categories.create({ name: 'Imported', type: finalType }, userId);
          } else {
            finalType = category.type || finalType;
          }
        }


        await db.entries.create({ amount, date: date.toISOString(), description, category_id: category.id }, userId);
        imported += 1;
      } catch (rowErr) {
        console.error(`Import row ${rowNum} error:`, rowErr && rowErr.stack ? rowErr.stack : rowErr);
        errors.push({ row: rowNum, reason: rowErr.message || String(rowErr) });

      }
    }

    return NextResponse.json({ imported, failed: errors.length, errors: errors.slice(0, 20) }, { status: 201 });
  } catch (err) {
    console.error('CSV import error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 });
  }
}
