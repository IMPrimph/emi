// LoanForm.jsx
import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  Slider,
  Tooltip,
  IconButton,
  Typography,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PercentIcon from "@mui/icons-material/Percent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalculateIcon from "@mui/icons-material/Calculate";
import LanguageIcon from "@mui/icons-material/Language";
import { formatNumber } from "../utils/format";

const LOCALES = [
  { code: "en-IN", label: "English (India)", currency: "INR", symbol: "₹" },
  { code: "en-US", label: "English (US)", currency: "USD", symbol: "$" },
  { code: "en-GB", label: "English (UK)", currency: "GBP", symbol: "£" },
  { code: "de-DE", label: "Deutsch (DE)", currency: "EUR", symbol: "€" },
  { code: "fr-FR", label: "Français (FR)", currency: "EUR", symbol: "€" },
];

// Custom minimal tooltip
function MinimalTooltip({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      tabIndex={0}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "110%",
            transform: "translateX(-50%)",
            background: "var(--color-neutral-900)",
            color: "#fff",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            fontSize: "0.95rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            whiteSpace: "nowrap",
            zIndex: 10,
            opacity: 0.97,
            pointerEvents: "none",
            marginTop: 4,
          }}
          role="tooltip"
        >
          {title}
        </span>
      )}
    </span>
  );
}

export default function LoanForm({
  loanDetails,
  setLoanDetails,
  locale,
  setLocale,
}) {
  // Validation states
  const [errors, setErrors] = useState({});
  const steps = [
    {
      label: "Loan Amount",
      render: () => (
        <Box className="loan-form-section fade-in" sx={{ mb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <AccountBalanceIcon sx={{ color: "var(--color-primary)", fontSize: 20 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-base)",
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Loan Amount
            </Typography>
            <MinimalTooltip title="Total principal you wish to borrow">
              <IconButton
                size="small"
                sx={{ ml: 1, p: 0.5, color: "var(--color-primary)" }}
                tabIndex={0}
                aria-label="Loan amount info"
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MinimalTooltip>
          </Box>
          <Slider
            min={minAmount}
            max={maxAmount}
            step={10000}
            value={Number(loanDetails.amount) || minAmount}
            onChange={(_, val) => {
              setLoanDetails({ ...loanDetails, amount: val });
              validate("amount", val);
            }}
            sx={{ mb: 2, color: "var(--color-primary)" }}
            aria-label="Loan Amount Slider"
          />
          <TextField
            placeholder={`e.g. ${formatNumber(500000, locale)}`}
            value={loanDetails.amount}
            onChange={(e) => {
              const raw = parseNumber(e.target.value);
              if (raw.length > 8) return;
              setLoanDetails({ ...loanDetails, amount: raw });
              validate("amount", Number(raw));
            }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {localeObj.symbol}
                </InputAdornment>
              ),
              inputProps: {
                step: "any",
                inputMode: "numeric",
                pattern: "[0-9]*",
                "aria-label": "Loan Amount",
                min: minAmount,
                max: maxAmount,
              },
              sx: {
                fontWeight: 600,
                fontSize: 20,
                background: "var(--color-input-bg)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
              },
            }}
            sx={{
              background: "var(--color-input-bg)",
              borderRadius: 3,
              fontSize: 20,
              mb: 0.5,
            }}
            error={!!errors.amount}
            helperText={
              errors.amount ||
              (loanDetails.amount &&
                `Preview: ${new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: localeObj.currency,
                  maximumFractionDigits: 0,
                }).format(loanDetails.amount)}`)
            }
            aria-label="Loan Amount Input"
          />
        </Box>
      ),
    },
    {
      label: "Interest Rate",
      render: () => (
        <Box className="loan-form-section fade-in" sx={{ mb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <PercentIcon sx={{ color: "var(--color-primary)", fontSize: 20 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-base)",
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Interest Rate (%)
            </Typography>
            <MinimalTooltip title="Annual interest rate (in percent). Interest is compounded monthly.">
              <IconButton
                size="small"
                sx={{ ml: 1, p: 0.5, color: "var(--color-primary)" }}
                tabIndex={0}
                aria-label="Interest rate info"
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MinimalTooltip>
          </Box>
          <Slider
            min={minRate}
            max={maxRate}
            step={0.1}
            value={Number(loanDetails.rate) || minRate}
            onChange={(_, val) => {
              setLoanDetails({ ...loanDetails, rate: val });
              validate("rate", val);
            }}
            sx={{ mb: 2, color: "var(--color-primary)" }}
            aria-label="Interest Rate Slider"
          />
          <TextField
            placeholder="e.g. 7.5"
            value={loanDetails.rate || ""}
            onChange={(e) => {
              setLoanDetails({ ...loanDetails, rate: e.target.value });
              validate("rate", e.target.value);
            }}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: {
                step: "any",
                inputMode: "decimal",
                "aria-label": "Interest Rate",
              },
              sx: {
                fontWeight: 600,
                fontSize: 20,
                background: "var(--color-input-bg)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
              },
            }}
            sx={{
              background: "var(--color-input-bg)",
              borderRadius: 3,
              fontSize: 20,
              mb: 0.5,
            }}
            error={!!errors.rate}
            helperText={
              errors.rate ||
              (loanDetails.rate && `Preview: ${loanDetails.rate}%`)
            }
            aria-label="Interest Rate Input"
          />
        </Box>
      ),
    },
    {
      label: "Tenure",
      render: () => (
        <Box className="loan-form-section fade-in" sx={{ mb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <AccessTimeIcon sx={{ color: "var(--color-primary)", fontSize: 20 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-base)",
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Tenure (Years)
            </Typography>
            <MinimalTooltip title="Number of years to repay the loan">
              <IconButton
                size="small"
                sx={{ ml: 1, p: 0.5, color: "var(--color-primary)" }}
                tabIndex={0}
                aria-label="Tenure info"
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MinimalTooltip>
          </Box>
          <Slider
            min={minTenure}
            max={maxTenure}
            step={1}
            value={Number(loanDetails.tenure) || minTenure}
            onChange={(_, val) => {
              setLoanDetails({ ...loanDetails, tenure: val });
              validate("tenure", val);
            }}
            sx={{ mb: 2, color: "var(--color-primary)" }}
            aria-label="Tenure Slider"
          />
          <TextField
            placeholder="e.g. 20"
            value={loanDetails.tenure || ""}
            onChange={(e) => {
              setLoanDetails({ ...loanDetails, tenure: e.target.value });
              validate("tenure", e.target.value);
            }}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
              inputProps: {
                step: 1,
                inputMode: "numeric",
                "aria-label": "Tenure",
              },
              sx: {
                fontWeight: 600,
                fontSize: 20,
                background: "var(--color-input-bg)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
              },
            }}
            sx={{
              background: "var(--color-input-bg)",
              borderRadius: 3,
              fontSize: 20,
              mb: 0.5,
            }}
            error={!!errors.tenure || loanDetails.tenure > 30}
            helperText={
              errors.tenure ||
              (loanDetails.tenure > 30
                ? "Most lenders cap at 30 yrs"
                : loanDetails.tenure && `Preview: ${loanDetails.tenure} years`)
            }
            aria-label="Tenure Input"
          />
        </Box>
      ),
    },
  ];

  // Helper to keep only digits
  const parseNumber = (str) => str.replace(/[^\d]/g, "");

  // Slider ranges
  const minAmount = 10000,
    maxAmount = 10000000;
  const minRate = 1,
    maxRate = 20;
  const minTenure = 1,
    maxTenure = 30;

  // Inline validation
  const validate = (field, value) => {
    let err = "";
    if (field === "amount") {
      if (!value || isNaN(value) || value < minAmount)
        err = `Min ${formatNumber(minAmount, locale)}`;
      else if (value > maxAmount)
        err = `Max ${formatNumber(maxAmount, locale)}`;
    } else if (field === "rate") {
      if (!value || isNaN(value) || value < minRate || value > maxRate)
        err = `1-20%`;
    } else if (field === "tenure") {
      if (!value || isNaN(value) || value < minTenure || value > maxTenure)
        err = `1-30 yrs`;
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

  const localeObj = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div
      className="loan-form-container fade-in"
      style={{
        background: "var(--color-card-bg)",
        color: "var(--color-text)",
        boxShadow: "var(--shadow-lg)",
        borderRadius: "1.5rem",
        padding: "2.5rem 2rem 2rem 2rem",
        maxWidth: 420,
        margin: "2.5rem auto 0 auto",
        border: "1px solid var(--color-border)",
        minWidth: 0,
        width: "100%",
        position: "relative",
      }}
    >
      {/* Professional Form Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(15, 118, 110, 0.3)",
            }}
          >
            <CalculateIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text)",
              fontSize: "var(--font-size-xl)",
              letterSpacing: "0.025em",
            }}
          >
            Loan Calculator
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
            maxWidth: 300,
            mx: "auto",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Enter your loan details to calculate monthly payments and interest
        </Typography>
      </Box>

      <Box
        component="form"
        noValidate
        autoComplete="off"
        sx={{ mb: 2, width: "100%" }}
      >
        {/* Enhanced Locale Selector */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            background: "var(--color-primary-50)",
            borderRadius: "12px",
            border: "1px solid var(--color-primary-100)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <LanguageIcon sx={{ color: "var(--color-primary)", fontSize: 20 }} />
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "var(--font-weight-semibold)", 
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Locale & Currency
            </Typography>
          </Box>
          <Select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            fullWidth
            inputProps={{
              "aria-label": "Select locale and currency",
            }}
            sx={{
              fontWeight: "var(--font-weight-medium)",
              fontSize: "var(--font-size-base)",
              borderRadius: "10px",
              background: "var(--color-bg)",
              "& .MuiSelect-select": {
                padding: "12px 16px",
              }
            }}
          >
            {LOCALES.map((l) => (
              <MenuItem
                key={l.code}
                value={l.code}
                sx={{ 
                  fontWeight: "var(--font-weight-medium)", 
                  fontSize: "var(--font-size-base)",
                  py: 2,
                }}
              >
                {l.label} ({l.symbol})
              </MenuItem>
            ))}
          </Select>
        </Box>
        {/* Minimal, modern form fields */}
        <Box sx={{ mb: 2 }}>{steps[0].render()}</Box>
        <Box sx={{ mb: 2 }}>{steps[1].render()}</Box>
        <Box sx={{ mb: 2 }}>{steps[2].render()}</Box>
      </Box>
    </div>
  );
}
