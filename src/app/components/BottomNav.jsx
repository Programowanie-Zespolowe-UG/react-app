'use client';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction, 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AddCircleIcon from '@mui/icons-material/AddCircleRounded';
import ListIcon from '@mui/icons-material/ListRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import AssessmentIcon from '@mui/icons-material/AssessmentRounded';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuth } from '@/context/AuthContext';

const ITEM_MIN_WIDTH = 72;

export default function BottomNav({ value, onChange }) {
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const router = useRouter();
  
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

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

  const navItems = useMemo(() => [
    { label: 'Dashboard', icon: <DashboardIcon />, value: 0 },
    { label: 'Add', icon: <AddCircleIcon />, value: 1 },
    { label: 'Entries', icon: <ListIcon />, value: 2 },
    { label: 'Categories', icon: <CategoryIcon />, value: 3 },
    { label: 'Reports', icon: <AssessmentIcon />, value: 4 },
    { label: 'Import', icon: <UploadFileIcon />, value: 5, onClick: handleFileClick },
  ], []);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;

      const maxItems = Math.floor(containerWidth / ITEM_MIN_WIDTH);
      
      if (maxItems >= navItems.length) {
        setVisibleCount(navItems.length);
      } else {
        const count = Math.max(1, maxItems - 1);
        setVisibleCount(count);
      }
    };

    calculateVisibleItems();

    const observer = new ResizeObserver(calculateVisibleItems);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [navItems.length]);

  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const visibleItems = navItems.slice(0, visibleCount);
  const hiddenItems = navItems.slice(visibleCount);
  const isOverflowing = hiddenItems.length > 0;
  
  const isHiddenActive = value >= visibleCount;
  const navValue = isHiddenActive ? 'more' : value;

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
        ref={containerRef}
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          borderRadius: 0,
          pb: 'env(safe-area-inset-bottom)',
          boxSizing: 'border-box',
        }} 
        elevation={5}
      >
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(event, newValue) => {
             if (newValue === 'more') {
                 handleMoreClick(event);
             } else {
                 onChange(newValue);
             }
          }}
          sx={{
            height: 64,
            width: '100%',
            justifyContent: 'center',
            '& .MuiBottomNavigationAction-root': {
              minWidth: ITEM_MIN_WIDTH, 
              paddingLeft: 0,
              paddingRight: 0
            },
          }}
        >
          {visibleItems.map((item) => (
            <BottomNavigationAction 
              key={item.value} 
              label={item.label} 
              icon={item.icon} 
              value={item.value}
              onClick={item.onClick}
            />
          ))}

          {isOverflowing && (
             <BottomNavigationAction 
                label="Inne" 
                value="more"
                icon={<MoreHorizIcon />} 
             />
          )}
        </BottomNavigation>
      </Paper>

      {/* Overflow Menu */}
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={handleMoreClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        slotProps={{
            paper: {
                sx: { mb: 1, minWidth: 150 }
            }
        }}
      >
        {hiddenItems.map((item) => (
            <MenuItem 
                key={item.value} 
                selected={value === item.value}
                onClick={(e) => {
                    onChange(item.value);
                    if (item.onClick) item.onClick(e);
                    handleMoreClose();
                }}
            >
                <ListItemIcon>
                    {item.icon}
                </ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
            </MenuItem>
        ))}
      </Menu>

      <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Import Preview Dialog - Unchanged */}
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
