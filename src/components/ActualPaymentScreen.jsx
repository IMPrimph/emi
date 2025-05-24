import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Chip,
  Tooltip,
  IconButton,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatCurrency, formatNumber } from '../utils/format';

export default function ActualPaymentScreen({ schedule }) {
  const [entry, setEntry] = useState({ month: '', amount: '' });
  const [payments, setPayments] = useState({});
  const [error, setError] = useState('');
  const [historyView, setHistoryView] = useState('month'); // 'month' or 'year'
  const [expandedMonth, setExpandedMonth] = useState(null);

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
    try {
      localStorage.setItem('emi_actual_payments', JSON.stringify(payments));
    } catch (e) {
      // fallback: do nothing
    }
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
      // Always persist to localStorage
      const list = prev[monthNum] ? [...prev[monthNum]] : [];
      const updated = { ...prev, [monthNum]: [...list, amtNum] };
      try {
        localStorage.setItem('emi_actual_payments', JSON.stringify(updated));
      } catch (e) {}
      return updated;
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
      try {
        localStorage.setItem('emi_actual_payments', JSON.stringify(result));
      } catch (e) {}
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

  // Grouped/aggregated payments by month
  const paymentTable = Object.entries(payments)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([month, arr]) => {
      const totalPaid = arr.reduce((sum, amt) => sum + amt, 0);
      const scheduled = getScheduledForMonth(month);
      const diff = totalPaid - scheduled;
      return {
        month,
        totalPaid,
        scheduled,
        diff,
        payments: arr,
      };
    });

  // Group by year if needed
  const paymentTableByYear = (() => {
    const byYear = {};
    for (const [month, arr] of Object.entries(payments)) {
      const year = Math.ceil(Number(month) / 12);
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push({ month, arr });
    }
    return Object.entries(byYear).map(([year, months]) => {
      const allPayments = months.flatMap(m => m.arr);
      const totalPaid = allPayments.reduce((sum, amt) => sum + amt, 0);
      const scheduled = months.reduce((sum, m) => sum + getScheduledForMonth(m.month), 0);
      const diff = totalPaid - scheduled;
      return {
        year,
        totalPaid,
        scheduled,
        diff,
        months,
      };
    }).sort((a, b) => Number(a.year) - Number(b.year));
  })();

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
          <Grid xs={12} sm={3}>
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
          <Grid xs={12} sm={4}>
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
          <Grid xs={12} sm={3}>
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
            <Grid xs={12}>
              <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 800, mx: 'auto', width: '100%', background: '#FFF' }} elevation={6} className="card">
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3 }}>
          Payment Summary
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid xs={12} sm={4} md={4} lg={4} xl={4}>
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
          <Grid xs={12} sm={4} md={4} lg={4} xl={4}>
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
          <Grid xs={12} sm={4} md={4} lg={4} xl={4}>
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
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 800, mx: 'auto', width: '100%', background: '#FFF' }} elevation={6} className="card">
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant={historyView === 'month' ? 'contained' : 'outlined'} onClick={() => setHistoryView('month')}>By Month</Button>
          <Button variant={historyView === 'year' ? 'contained' : 'outlined'} onClick={() => setHistoryView('year')}>By Year</Button>
        </Box>
        <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 2 }}>
          Payment History ({historyView === 'month' ? 'by Month' : 'by Year'})
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          {historyView === 'month' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 400, fontSize: 15, background: 'var(--color-bg)', borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-table-header)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16, borderTopLeftRadius: 12 }}>Month</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>Payments</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>Total Paid</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>Scheduled</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16, borderTopRightRadius: 12 }}>Extra / Short</th>
                </tr>
              </thead>
              <tbody>
                {paymentTable.map((row, i) => (
                  <React.Fragment key={row.month}>
                    <tr style={{
                      borderBottom: '1px solid var(--color-neutral-mid)',
                      cursor: 'pointer',
                      background: expandedMonth === row.month ? 'var(--color-table-header)' : i % 2 === 0 ? 'var(--color-bg)' : 'var(--color-table-row-alt)',
                      transition: 'background 0.2s'
                    }} onClick={() => setExpandedMonth(expandedMonth === row.month ? null : row.month)}>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#2563eb', borderLeft: '4px solid #2563eb', borderRadius: expandedMonth === row.month ? '8px 0 0 8px' : 0 }}>{row.month}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>{row.payments.length}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.totalPaid)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatCurrency(row.scheduled)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: row.diff > 0 ? '#388e3c' : row.diff < 0 ? '#d32f2f' : '#333' }}>
                        {row.diff > 0 ? `+${formatCurrency(row.diff)}` : row.diff < 0 ? formatCurrency(row.diff) : '—'}
                      </td>
                    </tr>
                    {expandedMonth === row.month && (
                      <tr>
                        <td colSpan={5} style={{ background: 'var(--color-table-header)', padding: '10px 24px', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {payments[row.month].map((amt, idx) => (
                              <li key={idx} style={{ marginBottom: 6, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ color: '#2563eb', fontWeight: 600 }}>Payment {idx + 1}:</span>
                                <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{formatCurrency(amt)}</span>
                                <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto' }}>({new Date().toLocaleDateString()})</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 400, fontSize: 15, background: 'var(--color-bg)', borderRadius: 12, boxShadow: 'var(--shadow-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-table-header)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16, borderTopLeftRadius: 12 }}>Year</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>Months</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>Total Paid</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>Scheduled</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', fontSize: 16, borderTopRightRadius: 12 }}>Extra / Short</th>
                </tr>
              </thead>
              <tbody>
                {paymentTableByYear.map((row, i) => (
                  <tr key={row.year} style={{
                    borderBottom: '1px solid var(--color-neutral-mid)',
                    background: i % 2 === 0 ? 'var(--color-bg)' : 'var(--color-table-row-alt)',
                  }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: '#2563eb', borderLeft: '4px solid #2563eb', borderRadius: 0 }}>{row.year}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{row.months.length}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.totalPaid)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatCurrency(row.scheduled)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: row.diff > 0 ? '#388e3c' : row.diff < 0 ? '#d32f2f' : '#333' }}>
                      {row.diff > 0 ? `+${formatCurrency(row.diff)}` : row.diff < 0 ? formatCurrency(row.diff) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      </Paper>
    </Box>
  );
}