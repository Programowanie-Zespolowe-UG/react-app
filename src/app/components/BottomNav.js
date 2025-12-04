 'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, BottomNavigation, BottomNavigationAction, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AddCircleIcon from '@mui/icons-material/AddCircleRounded';
import ListIcon from '@mui/icons-material/ListRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import AssessmentIcon from '@mui/icons-material/AssessmentRounded';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav({ value, onChange }) {
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const router = useRouter();

  const [headers, setHeaders] = useState([]);
  const [csvText, setCsvText] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [previewMapping, setPreviewMapping] = useState(null);
  const [previewDelimiter, setPreviewDelimiter] = useState(',');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);

    // Extract header row
    const firstLine = text.split(/\r?\n/).find((l) => l.trim() !== '');
    if (!firstLine) {
      setSnackbar({ open: true, message: 'Plik CSV jest pusty', severity: 'error' });
      return;
    }
    // Try detect delimiter: tab, semicolon, or comma
    const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',');
    const cols = firstLine.split(delimiter).map((c) => c.replace(/^\uFEFF/, '').trim());
    setHeaders(cols);
    // Validate required columns: date, category, value (type removed — derived from value)
    const required = ['date', 'category', 'value'];
    const lower = cols.map((c) => c.toLowerCase());
    const missing = required.filter((r) => !lower.includes(r));
    if (missing.length > 0) {
      setSnackbar({ open: true, message: `Brakujące kolumny: ${missing.join(', ')}`, severity: 'error' });
      e.target.value = null;
      return;
    }

    // Build mapping from required column names
    const mapping = {
      date: cols[lower.indexOf('date')],
      amount: cols[lower.indexOf('value')],
      description: cols.find((c) => ['description', 'desc', 'tytul', 'title'].includes(c.toLowerCase())) || '',
      category: cols[lower.indexOf('category')],
    };

    // request preview from server
    try {
      const previewRes = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text, mapping, delimiter }),
      });
      const previewData = await previewRes.json();
      if (previewRes.ok) {
        setPreviewRows(previewData.rows || []);
        setPreviewErrors(previewData.errors || []);
        setPreviewMapping(mapping);
        setPreviewDelimiter(delimiter);
        setPreviewOpen(true);
        // clear file input so selecting same file again will fire change
        try { if (fileInputRef.current) fileInputRef.current.value = null; } catch (e) { }
      } else {
        setSnackbar({ open: true, message: previewData.error || 'Błąd podczas podglądu pliku', severity: 'error' });
        e.target.value = null;
      }
    } catch (err) {
      console.error('Preview request failed', err);
      setSnackbar({ open: true, message: 'Błąd sieci podczas podglądu', severity: 'error' });
      e.target.value = null;
    }
  };

  

  return (
    <>
      <Paper 
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, borderRadius: 0 }} 
        elevation={5}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            onChange(newValue);
          }}
          sx={{ height: 64 }}
        >
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Add" icon={<AddCircleIcon />} />
          <BottomNavigationAction label="Entries" icon={<ListIcon />} />
          <BottomNavigationAction label="Categories" icon={<CategoryIcon />} />
          <BottomNavigationAction label="Reports" icon={<AssessmentIcon />} />
          <BottomNavigationAction label="Import" icon={<UploadFileIcon />} onClick={handleFileClick} />
        </BottomNavigation>
      </Paper>

      <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileChange} />

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview pliku (pierwsze 5 wierszy)</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wiersz</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Kategoria</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell align="right">Kwota</TableCell>
                <TableCell>Opis</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {previewRows.map((r) => (
                <TableRow key={r.row}>
                  <TableCell>{r.row}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell align="right">{r.value}</TableCell>
                  <TableCell>{r.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {previewErrors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Wykryte błędy:</strong>
              <ul>
                {previewErrors.map((err) => (
                  <li key={err.row}>Wiersz {err.row}: {err.errors.join(', ')}</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
          <DialogActions>
          <Button onClick={() => { setPreviewOpen(false); setPreviewRows([]); setPreviewErrors([]); setPreviewMapping(null); setPreviewDelimiter(','); try { if (fileInputRef.current) fileInputRef.current.value = null; } catch(e){} }}>Anuluj</Button>
          <Button variant="contained" onClick={async () => {
            // perform actual import
            try {
              if (!user || !user.id) {
                setSnackbar({ open: true, message: 'Zaloguj się aby importować', severity: 'error' });
                return;
              }
              const res = await fetch('/api/import/csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv: csvText, mapping: previewMapping, userId: user.id, delimiter: previewDelimiter }),
              });
              const data = await res.json();
              if (res.ok) {
                setSnackbar({ open: true, message: `Zaimportowano ${data.imported} wpisów, nieudanych: ${data.failed}`, severity: 'success' });
                // refresh server components / data so entries list updates immediately
                try { router.refresh(); } catch (e) { /* ignore if unavailable */ }
              } else {
                setSnackbar({ open: true, message: data.error || 'Błąd importu', severity: 'error' });
              }
            } catch (err) {
              console.error('Import failed', err);
              setSnackbar({ open: true, message: 'Błąd sieci podczas importu', severity: 'error' });
            } finally {
              setPreviewOpen(false);
              setPreviewRows([]);
              setPreviewErrors([]);
              setCsvText('');
              setPreviewMapping(null);
              setPreviewDelimiter(',');
              try { if (fileInputRef.current) fileInputRef.current.value = null; } catch(e){}
            }
          }}>Importuj</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
