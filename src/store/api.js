// Client-side API wrappers (Mock Store)
// Since we are using Next.js API routes with an in-memory DB on server,
// we just need simple fetch wrappers here.

export const fetchEntries = async () => {
    const res = await fetch('/api/entries');
    if (!res.ok) throw new Error('Failed to fetch entries');
    return res.json();
};

export const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
};

// ... other methods are implemented directly in page.js for simplicity in this MVP,
// but ideally would be here.
