import { TextField, Grid, Box, InputAdornment, Tooltip, IconButton, Alert, Button } from '@mui/material';
import { formatNumber } from '../utils/format';
import { useEffect, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function ExtraPaymentForm({ extraPayment, setExtraPayment, addExtraPayment, editing }) {
  // Helper to keep only digits
  const parseNumber = (str) => str.replace(/[^\d]/g, '');

  // Validation state
  const [error, setError] = useState('');

  // Remove auto-add on change, restore explicit button for extra payment
  const handleAdd = () => {
    const monthNum = parseInt(extraPayment.month, 10);
    const amtNum = parseFloat(extraPayment.amount);
    let err = '';
    if (!monthNum || isNaN(monthNum) || monthNum < 1) err = 'Enter valid month';
    else if (isNaN(amtNum) || amtNum <= 0) err = 'Enter valid amount';
    setError(err);
    if (!err && monthNum && amtNum) {
      addExtraPayment();
    }
  };

  return (
    <Box className="extra-payment-form card" sx={{ mb: 2, width: '100%', background: 'var(--color-bg)', color: 'var(--color-secondary)', boxShadow: 'var(--shadow-elevation)' }}>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label={<span>Month # <Tooltip title="Month number for extra payment"><IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip></span>}
            variant="outlined"
            type="number"
            value={extraPayment.month || ''}
            onChange={(e) => setExtraPayment({ ...extraPayment, month: e.target.value })}
            fullWidth
            InputProps={{ sx: { fontWeight: 600, fontSize: 16, background: '#F9FAFB', borderRadius: 1 } }}
            sx={{ background: '#F9FAFB', borderRadius: 1 }}
            error={!!error && (!extraPayment.month || isNaN(parseInt(extraPayment.month, 10)))}
            helperText={!!error && (!extraPayment.month || isNaN(parseInt(extraPayment.month, 10))) ? error : ''}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label={<span>Extra Amount <Tooltip title="Extra payment reduces interest and tenure"><IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip></span>}
            variant="outlined"
            value={extraPayment.amount ? formatNumber(extraPayment.amount) : ''}
            onChange={(e) => {
              const raw = parseNumber(e.target.value);
              setExtraPayment({ ...extraPayment, amount: raw });
            }}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              inputProps: { step: 'any', inputMode: 'numeric', pattern: '[0-9]*' },
              sx: { fontWeight: 600, fontSize: 16, background: '#F9FAFB', borderRadius: 1 }
            }}
            sx={{ background: '#F9FAFB', borderRadius: 1 }}
            error={!!error && (!extraPayment.amount || isNaN(parseFloat(extraPayment.amount)))}
            helperText={!!error && (!extraPayment.amount || isNaN(parseFloat(extraPayment.amount))) ? error : ''}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ height: 40, fontWeight: 700, fontSize: 16, letterSpacing: 1, borderRadius: 2, boxShadow: 2, background: 'linear-gradient(90deg, #3B82F6 0%, #2563eb 100%)', transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.1s' }}
            onClick={handleAdd}
            disabled={!!error || !extraPayment.month || !extraPayment.amount}
          >
            {editing ? 'Update Extra' : 'Add Extra'}
          </Button>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}