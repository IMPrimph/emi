// LoanForm.jsx
import { useState } from 'react';
import { TextField, Button, Box, InputAdornment, Slider, Tooltip, IconButton, Typography, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatNumber, formatCurrency } from '../utils/format';

const LOCALES = [
  { code: 'en-IN', label: 'English (India)', currency: 'INR', symbol: '₹' },
  { code: 'en-US', label: 'English (US)', currency: 'USD', symbol: '$' },
  { code: 'en-GB', label: 'English (UK)', currency: 'GBP', symbol: '£' },
  { code: 'de-DE', label: 'Deutsch (DE)', currency: 'EUR', symbol: '€' },
  { code: 'fr-FR', label: 'Français (FR)', currency: 'EUR', symbol: '€' },
];

export default function LoanForm({ loanDetails, setLoanDetails, locale, setLocale }) {
  // Validation states
  const [errors, setErrors] = useState({});
  const [emiInfoOpen, setEmiInfoOpen] = useState(false);
  const steps = [
    {
      label: 'Loan Amount',
      render: () => (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            Loan Amount
            <Tooltip title="Total principal you wish to borrow">
              <IconButton size="small" sx={{ ml: 0.5 }} tabIndex={0} aria-label="Loan amount info">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Slider
            min={minAmount}
            max={maxAmount}
            step={10000}
            value={Number(loanDetails.amount) || minAmount}
            onChange={(_, val) => {
              setLoanDetails({ ...loanDetails, amount: val });
              validate('amount', val);
            }}
            sx={{ mb: 1 }}
            aria-label="Loan Amount Slider"
          />
          <TextField
            placeholder={`e.g. ${formatNumber(500000, locale)}`}
            value={loanDetails.amount}
            onChange={(e) => {
              const raw = parseNumber(e.target.value);
              if (raw.length > 8) return; // Prevent more than 8 digits (maxAmount)
              setLoanDetails({ ...loanDetails, amount: raw });
              // Always validate with a number, not string
              validate('amount', Number(raw));
            }}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">{localeObj.symbol}</InputAdornment>,
              inputProps: { step: 'any', inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'Loan Amount', min: minAmount, max: maxAmount },
              sx: { fontWeight: 600, fontSize: 18, background: '#f8fafc', borderRadius: 2 }
            }}
            sx={{ background: '#f8fafc', borderRadius: 2 }}
            error={!!errors.amount}
            helperText={errors.amount || (loanDetails.amount && `Preview: ${new Intl.NumberFormat(locale, { style: 'currency', currency: localeObj.currency, maximumFractionDigits: 0 }).format(loanDetails.amount)}`)}
            aria-label="Loan Amount Input"
          />
        </Box>
      )
    },
    {
      label: 'Interest Rate',
      render: () => (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            Interest Rate (%)
            <Tooltip title="Annual interest rate (in percent). Interest is compounded monthly.">
              <IconButton size="small" sx={{ ml: 0.5 }} tabIndex={0} aria-label="Interest rate info">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Slider
            min={minRate}
            max={maxRate}
            step={0.1}
            value={Number(loanDetails.rate) || minRate}
            onChange={(_, val) => {
              setLoanDetails({ ...loanDetails, rate: val });
              validate('rate', val);
            }}
            sx={{ mb: 1 }}
            aria-label="Interest Rate Slider"
          />
          <TextField
            placeholder="e.g. 7.5"
            value={loanDetails.rate || ''}
            onChange={(e) => {
              setLoanDetails({ ...loanDetails, rate: e.target.value });
              validate('rate', e.target.value);
            }}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { step: 'any', inputMode: 'decimal', 'aria-label': 'Interest Rate' },
              sx: { fontWeight: 600, fontSize: 18, background: '#f8fafc', borderRadius: 2 }
            }}
            sx={{ background: '#f8fafc', borderRadius: 2 }}
            error={!!errors.rate}
            helperText={errors.rate || (loanDetails.rate && `Preview: ${loanDetails.rate}%`)}
            aria-label="Interest Rate Input"
          />
        </Box>
      )
    },
    {
      label: 'Tenure',
      render: () => (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            Tenure (Years)
            <Tooltip title="Total loan duration in years. Most lenders cap at 30 years.">
              <IconButton size="small" sx={{ ml: 0.5 }} tabIndex={0} aria-label="Tenure info">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" sx={{ ml: 1 }} tabIndex={0} aria-label="What is EMI?" onClick={() => setEmiInfoOpen(true)}>
              <InfoOutlinedIcon color="primary" fontSize="small" />
            </IconButton>
          </Typography>
          <Slider
            min={minTenure}
            max={maxTenure}
            step={1}
            value={Number(loanDetails.tenure) || minTenure}
            onChange={(_, val) => {
              setLoanDetails({ ...loanDetails, tenure: val });
              validate('tenure', val);
            }}
            sx={{ mb: 1 }}
            aria-label="Tenure Slider"
          />
          <TextField
            placeholder="e.g. 20"
            value={loanDetails.tenure || ''}
            onChange={(e) => {
              setLoanDetails({ ...loanDetails, tenure: e.target.value });
              validate('tenure', e.target.value);
            }}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
              inputProps: { step: 1, inputMode: 'numeric', 'aria-label': 'Tenure' },
              sx: { fontWeight: 600, fontSize: 18, background: '#f8fafc', borderRadius: 2 }
            }}
            sx={{ background: '#f8fafc', borderRadius: 2 }}
            error={!!errors.tenure || (loanDetails.tenure > 30)}
            helperText={errors.tenure || (loanDetails.tenure > 30 ? 'Most lenders cap at 30 yrs' : (loanDetails.tenure && `Preview: ${loanDetails.tenure} years`))}
            aria-label="Tenure Input"
          />
        </Box>
      )
    }
  ];

  // Helper to keep only digits
  const parseNumber = (str) => str.replace(/[^\d]/g, '');

  // Slider ranges
  const minAmount = 10000, maxAmount = 10000000;
  const minRate = 1, maxRate = 20;
  const minTenure = 1, maxTenure = 30;

  // Inline validation
  const validate = (field, value) => {
    let err = '';
    if (field === 'amount') {
      if (!value || isNaN(value) || value < minAmount) err = `Min ${formatNumber(minAmount, locale)}`;
      else if (value > maxAmount) err = `Max ${formatNumber(maxAmount, locale)}`;
    } else if (field === 'rate') {
      if (!value || isNaN(value) || value < minRate || value > maxRate) err = `1-20%`;
    } else if (field === 'tenure') {
      if (!value || isNaN(value) || value < minTenure || value > maxTenure) err = `1-30 yrs`;
    }
    setErrors((prev) => {
      // Only clear error if value is valid
      if (!err) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: err };
    });
    // Dismiss error after 2 seconds if value is valid
    if (!err) {
      setTimeout(() => {
        setErrors((prev) => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    }
  };

  const localeObj = LOCALES.find(l => l.code === locale) || LOCALES[0];

  return (
    <div className="loan-form-container card" style={{ background: 'var(--color-bg)', color: 'var(--color-secondary)', boxShadow: 'var(--shadow-elevation)' }}>
      <Box component="form" noValidate autoComplete="off" sx={{ mb: 2, width: '100%' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2" id="locale-label">Locale & Currency:</Typography>
          <Select
            value={locale}
            onChange={e => setLocale(e.target.value)}
            size="small"
            inputProps={{ 'aria-label': 'Select locale and currency', id: 'locale-select' }}
            sx={{ minWidth: 180 }}
          >
            {LOCALES.map(l => (
              <MenuItem key={l.code} value={l.code}>{l.label} ({l.symbol})</MenuItem>
            ))}
          </Select>
        </Box>
        {/* Simple form fields, no stepper or pagination */}
        <Box sx={{ mb: 3 }}>{steps[0].render()}</Box>
        <Box sx={{ mb: 3 }}>{steps[1].render()}</Box>
        <Box sx={{ mb: 3 }}>{steps[2].render()}</Box>
      </Box>
    </div>
  );
}