import { Paper, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { formatCurrency } from "../utils/format";
import useCountUp from "./useCountUp";
import PaymentsIcon from "@mui/icons-material/Payments";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function LoanSummary({
  schedule,
  loanDetails,
  locale = "en-IN",
}) {
  const originalMonths = loanDetails.tenure * 12;
  const actualMonths = schedule.length;
  const totalInterest = schedule.reduce((sum, i) => sum + i.interest, 0);
  const originalEMI = schedule[0].emi;
  const originalTotalInterest =
    originalEMI * originalMonths - loanDetails.amount;
  const interestSaved = originalTotalInterest - totalInterest;

  // Only count months reduced if extra payments were made and schedule is shorter
  let monthsReduced = originalMonths - actualMonths;
  if (monthsReduced < 0) monthsReduced = 0;
  // If no extra payments (all schedule[].extra are 0), force monthsReduced = 0
  const anyExtra = schedule.some((row) => row.extra && row.extra > 0);
  if (!anyExtra) monthsReduced = 0;

  // Animated values
  const animatedEMI = useCountUp(Math.round(originalEMI));
  const animatedInterest = useCountUp(Math.round(totalInterest));
  const animatedSaved = useCountUp(Math.round(interestSaved));
  const animatedMonths = useCountUp(Math.round(monthsReduced));

  // Currency and locale
  const currency =
    locale === "en-IN"
      ? "INR"
      : locale === "en-US"
      ? "USD"
      : locale === "en-GB"
      ? "GBP"
      : locale === "de-DE" || locale === "fr-FR"
      ? "EUR"
      : "INR";

  return (
    <Paper
      elevation={0}
      className="card-summary scale-on-hover fade-in-up"
      sx={{
        p: { xs: 3, sm: 4 },
        width: "100%",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
          zIndex: 1,
        },
      }}
      tabIndex={0}
      aria-label="Loan summary card"
    >
      <Box className="section-header" sx={{ mb: 3, pb: 2, borderBottom: "1px solid var(--color-border-light)" }}>
        <Typography
          variant="h4"
          className="section-title"
          sx={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text)",
            display: "flex",
            alignItems: "center",
            gap: 1,
            m: 0,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-primary)",
            }}
          />
          Loan Summary
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box className="metric-card metric-card-primary">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(15, 118, 110, 0.2)",
                }}
              >
                <PaymentsIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0
                }}
              >
                Monthly EMI
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{ 
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-2xl)",
                lineHeight: "var(--line-height-tight)",
                ml: 7
              }}
            >
              {formatCurrency(animatedEMI, locale, currency)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className="metric-card metric-card-neutral">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--color-warning) 0%, #D97706 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.2)",
                }}
              >
                <TrendingDownIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0
                }}
              >
                Total Interest
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text)",
                fontSize: "var(--font-size-lg)",
                ml: 7
              }}
            >
              {formatCurrency(animatedInterest, locale, currency)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className="metric-card metric-card-success">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--color-success) 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                }}
              >
                <SavingsIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0
                }}
              >
                Interest Saved
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-success)",
                fontSize: "var(--font-size-lg)",
                ml: 7
              }}
            >
              {formatCurrency(animatedSaved, locale, currency)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className="metric-card metric-card-primary">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--color-secondary) 0%, #1E40AF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(30, 64, 175, 0.2)",
                }}
              >
                <ScheduleIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0
                }}
              >
                Time Saved
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-lg)",
                ml: 7
              }}
            >
              {animatedMonths} months
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
