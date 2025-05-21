import { Paper, Typography, Grid } from '@mui/material';
import { formatCurrency, formatNumber } from '../utils/format';

export default function LoanSummary({ schedule, loanDetails }) {
  const originalMonths = loanDetails.tenure * 12;
  const actualMonths = schedule.length;
  const totalInterest = schedule.reduce((sum, i) => sum + i.interest, 0);
  const originalEMI = schedule[0].emi;
  const originalTotalInterest = originalEMI * originalMonths - loanDetails.amount;
  const interestSaved = originalTotalInterest - totalInterest;
  const monthsReduced = originalMonths - actualMonths;

  return (
    <Paper
      elevation={6}
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: theme.palette.common.white,
      })}
    >
      <Typography variant="h6" gutterBottom>
        Loan Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>EMI</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{formatCurrency(originalEMI)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Total Interest Paid</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{formatCurrency(totalInterest)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Interest Saved</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{formatCurrency(interestSaved)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Tenure Reduced</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{formatNumber(monthsReduced)} months</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}