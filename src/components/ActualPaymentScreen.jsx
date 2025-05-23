import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Chip,
  Tooltip,
  IconButton,
  Alert,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatCurrency, formatNumber } from '../utils/format';

export default function ActualPaymentScreen({ schedule }) {
  const [entry, setEntry] = useState({ month: '', amount: '' });
  const [payments, setPayments] = useState({});
  const [error, setError] = useState('');

  // Load payments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('emi_actual_payments');
    if (stored) {
      try {
        setPayments(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save payments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emi_actual_payments', JSON.stringify(payments));
  }, [payments]);

  const addPayment = () => {
    const monthNum = parseInt(entry.month, 10);
    const amtNum = parseFloat(entry.amount);
    let err = '';
    if (!monthNum || isNaN(monthNum) || monthNum < 1) err = 'Enter valid month';
    else if (isNaN(amtNum) || amtNum <= 0) err = 'Enter valid amount';
    setError(err);
    if (err) return;
    setPayments((prev) => {
      const list = prev[monthNum] ? [...prev[monthNum]] : [];
      return { ...prev, [monthNum]: [...list, amtNum] };
    });
    setEntry({ month: '', amount: '' });
  };

  const removePayment = (month, idx) => {
    setPayments((prev) => {
      const list = [...(prev[month] || [])];
      list.splice(idx, 1);
      const result = { ...prev };
      if (list.length) result[month] = list;
      else delete result[month];
      return result;
    });
  };

  const totalScheduled = schedule.reduce(
    (sum, row) => sum + row.emi + row.extra,
    0
  );
  const totalActual = Object.values(payments).reduce(
    (sum, arr) => sum + arr.reduce((s, amt) => s + amt, 0),
    0
  );
  const difference = totalActual - totalScheduled;
  let statusLabel = 'On Track';
  if (difference > 0) statusLabel = 'Extra Paid';
  else if (difference < 0) statusLabel = 'Pending';

  // Helper: get scheduled for a month
  const getScheduledForMonth = (month) => {
    const row = schedule.find((r) => r.month === Number(month));
    return row ? row.emi + row.extra : 0;
  };

  // Helper to keep only digits
  const parseNumber = (str) => str.replace(/[^\d]/g, '');

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 800, mx: 'auto', width: '100%', background: '#FFF' }} elevation={6} className="card">
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3 }}>
          Enter Actual Payments
          <Tooltip title="Record actual payments made. Overpayments reduce interest and tenure.">
            <IconButton size="small" sx={{ ml: 1 }} tabIndex={0} aria-label="Actual payment info">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label={<span>Month # <Tooltip title="Month number for payment"><IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip></span>}
              variant="outlined"
              type="number"
              value={entry.month}
              onChange={(e) => setEntry({ ...entry, month: e.target.value })}
              fullWidth
              size="small"
              InputProps={{ sx: { fontWeight: 600, fontSize: 16, background: '#F9FAFB', borderRadius: 1 } }}
              sx={{ background: '#F9FAFB', borderRadius: 1 }}
              error={!!error && (!entry.month || isNaN(parseInt(entry.month, 10)))}
              helperText={!!error && (!entry.month || isNaN(parseInt(entry.month, 10))) ? error : ''}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={<span>Payment Amount <Tooltip title="Overpayments reduce interest and tenure"><IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip></span>}
              variant="outlined"
              value={entry.amount ? formatNumber(entry.amount) : ''}
              onChange={(e) => {
                const raw = parseNumber(e.target.value);
                setEntry({ ...entry, amount: raw });
              }}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { step: 'any', inputMode: 'numeric', pattern: '[0-9]*' },
                sx: { fontWeight: 600, fontSize: 16, background: '#F9FAFB', borderRadius: 1 }
              }}
              sx={{ background: '#F9FAFB', borderRadius: 1 }}
              error={!!error && (!entry.amount || isNaN(parseFloat(entry.amount)))}
              helperText={!!error && (!entry.amount || isNaN(parseFloat(entry.amount))) ? error : ''}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ height: 40, fontWeight: 700, fontSize: 16, letterSpacing: 1, borderRadius: 2, boxShadow: 2, background: 'linear-gradient(90deg, #3B82F6 0%, #2563eb 100%)', transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.1s' }}
              onClick={addPayment}
            >
              Add Payment
            </Button>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>
            </Grid>
          )}
        </Grid>
        {Object.keys(payments).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, color: 'text.secondary' }}>
              Payments Made
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(payments).map(([month, arr]) =>
                arr.map((amt, idx) => {
                  const scheduled = getScheduledForMonth(month);
                  let info = '';
                  if (amt < scheduled) {
                    info = `Short by ${formatCurrency(scheduled - amt)}`;
                  } else if (amt > scheduled) {
                    info = `Saved ${formatCurrency(amt - scheduled)}`;
                  }
                  return (
                    <Chip
                      key={`${month}-${idx}`}
                      label={`Month ${month}: ${formatCurrency(amt)}${info ? ' (' + info + ')' : ''}`}
                      onDelete={() => removePayment(Number(month), idx)}
                      color={amt < scheduled ? 'warning' : amt > scheduled ? 'success' : 'secondary'}
                      sx={{ fontWeight: 600, fontSize: 15, px: 1.5, py: 1, borderRadius: 2, background: amt < scheduled ? '#fff3e0' : amt > scheduled ? '#e8f5e9' : '#e3f2fd', color: '#4B5563' }}
                    />
                  );
                })
              )}
            </Box>
          </Box>
        )}
      </Paper>
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 800, mx: 'auto', width: '100%', background: '#FFF' }} elevation={6} className="card">
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3 }}>
          Payment Summary
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
            <Box sx={{
              background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              boxShadow: 2,
              minWidth: 0,
            }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary">Total Scheduled</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {formatCurrency(totalScheduled)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
            <Box sx={{
              background: 'linear-gradient(90deg, #f1f8e9 0%, #c8e6c9 100%)',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              boxShadow: 2,
              minWidth: 0,
            }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary">Total Actual</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(totalActual)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
            <Box sx={{
              background: 'linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%)',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              boxShadow: 2,
              minWidth: 0,
            }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary">{statusLabel}</Typography>
              <Typography variant="h6" fontWeight={700} color={difference > 0 ? 'success.main' : difference < 0 ? 'warning.main' : 'primary.main'}>
                {formatCurrency(Math.abs(difference))}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}