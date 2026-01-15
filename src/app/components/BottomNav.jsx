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


    const firstLine = text.split(/\r?\n/).find((l) => l.trim() !== '');
    if (!firstLine) {
      setSnackbar({ open: true, message: 'CSV file is empty', severity: 'error' });
      return;
    }

    const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',');
    const cols = firstLine.split(delimiter).map((c) => c.replace(/^\uFEFF/, '').trim());
    setHeaders(cols);

    const required = ['date', 'category', 'value'];
    const lower = cols.map((c) => c.toLowerCase());
    const missing = required.filter((r) => !lower.includes(r));
    if (missing.length > 0) {
      setSnackbar({ open: true, message: `Missing columns: ${missing.join(', ')}`, severity: 'error' });
      e.target.value = null;
      return;
    }


    const mapping = {
      date: cols[lower.indexOf('date')],
      amount: cols[lower.indexOf('value')],
      description: cols.find((c) => ['description', 'desc', 'tytul', 'title'].includes(c.toLowerCase())) || '',
      category: cols[lower.indexOf('category')],
    };


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

        try { if (fileInputRef.current) fileInputRef.current.value = null; } catch (e) { }
      } else {
        setSnackbar({ open: true, message: previewData.error || 'Error during file preview', severity: 'error' });
        e.target.value = null;
      }
    } catch (err) {
      console.error('Preview request failed', err);
      setSnackbar({ open: true, message: 'Network error during preview', severity: 'error' });
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
        <DialogTitle>File preview (first 5 rows)</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Row</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
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
              <strong>Detected errors:</strong>
              <ul>
                {previewErrors.map((err) => (
                  <li key={err.row}>Row {err.row}: {err.errors.join(', ')}</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
          <DialogActions>
          <Button onClick={() => { setPreviewOpen(false); setPreviewRows([]); setPreviewErrors([]); setPreviewMapping(null); setPreviewDelimiter(','); try { if (fileInputRef.current) fileInputRef.current.value = null; } catch(e){} }}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            try {
              if (!user || !user.id) {
                setSnackbar({ open: true, message: 'Please log in to import', severity: 'error' });
                return;
              }
              const res = await fetch('/api/import/csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv: csvText, mapping: previewMapping, userId: user.id, delimiter: previewDelimiter }),
              });
              const data = await res.json();
              if (res.ok) {
                setSnackbar({ open: true, message: `Imported ${data.imported} entries, failed: ${data.failed}`, severity: 'success' });

                try { router.refresh(); } catch (e) { /* ignore if unavailable */ }
              } else {
                setSnackbar({ open: true, message: data.error || 'Import error', severity: 'error' });
              }
            } catch (err) {
              console.error('Import failed', err);
              setSnackbar({ open: true, message: 'Network error during import', severity: 'error' });
            } finally {
              setPreviewOpen(false);
              setPreviewRows([]);
              setPreviewErrors([]);
              setCsvText('');
              setPreviewMapping(null);
              setPreviewDelimiter(',');
              try { if (fileInputRef.current) fileInputRef.current.value = null; } catch(e){}
            }
          }}>Import</Button>
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
