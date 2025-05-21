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
      elevation={3}
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      })}
    >
      <Typography variant="h6" gutterBottom>
        Loan Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">EMI</Typography>
          <Typography variant="subtitle1">{formatCurrency(originalEMI)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">Total Interest Paid</Typography>
          <Typography variant="subtitle1">{formatCurrency(totalInterest)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">Interest Saved</Typography>
          <Typography variant="subtitle1">{formatCurrency(interestSaved)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">Tenure Reduced</Typography>
          <Typography variant="subtitle1">{formatNumber(monthsReduced)} months</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}