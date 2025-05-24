import { Paper, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { formatCurrency, formatNumber } from '../utils/format';
import useCountUp from './useCountUp';

export default function LoanSummary({ schedule, loanDetails, locale = 'en-IN' }) {
  const originalMonths = loanDetails.tenure * 12;
  const actualMonths = schedule.length;
  const totalInterest = schedule.reduce((sum, i) => sum + i.interest, 0);
  const originalEMI = schedule[0].emi;
  const originalTotalInterest = originalEMI * originalMonths - loanDetails.amount;
  const interestSaved = originalTotalInterest - totalInterest;

  // Only count months reduced if extra payments were made and schedule is shorter
  let monthsReduced = originalMonths - actualMonths;
  if (monthsReduced < 0) monthsReduced = 0;
  // If no extra payments (all schedule[].extra are 0), force monthsReduced = 0
  const anyExtra = schedule.some(row => row.extra && row.extra > 0);
  if (!anyExtra) monthsReduced = 0;

  // Animated values
  const animatedEMI = useCountUp(Math.round(originalEMI));
  const animatedInterest = useCountUp(Math.round(totalInterest));
  const animatedSaved = useCountUp(Math.round(interestSaved));
  const animatedMonths = useCountUp(Math.round(monthsReduced));

  // Currency and locale
  const currency = locale === 'en-IN' ? 'INR' :
    locale === 'en-US' ? 'USD' :
    locale === 'en-GB' ? 'GBP' :
    locale === 'de-DE' || locale === 'fr-FR' ? 'EUR' : 'INR';

  return (
    <Paper
      elevation={3}
      sx={(theme) => ({
        p: { xs: 2, sm: 4 },
        background: 'linear-gradient(90deg, #e3f2fd 0%, #f8fafc 100%)',
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        width: '100%',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: 800,
        margin: '0 auto',
        mb: 3,
        transition: 'box-shadow 0.2s, transform 0.1s',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(59,130,246,0.12)',
          transform: 'translateY(-2px) scale(1.01)',
        },
      })}
      className="loan-summary-container card summary-animate"
      tabIndex={0}
      aria-label="Loan summary card"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: 10, height: 40, borderRadius: 2, background: '#6366F1', mr: 2 }} />
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Loan Summary
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <Typography variant="body2" fontWeight={500} color="text.secondary">EMI</Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ fontSize: 28, mb: 0.5 }}>{formatCurrency(animatedEMI, locale, currency)}</Typography>
        </Grid>
        <Grid xs={12} sm={6}>
          <Typography variant="body2" fontWeight={500} color="text.secondary">Total Interest Paid</Typography>
          <Typography variant="h6" fontWeight={700} color="neutral.dark">{formatCurrency(animatedInterest, locale, currency)}</Typography>
        </Grid>
        <Grid xs={12} sm={6}>
          <Typography variant="body2" fontWeight={500} color="text.secondary">Interest Saved</Typography>
          <Typography variant="h6" fontWeight={700} color="success.main">{formatCurrency(animatedSaved, locale, currency)}</Typography>
        </Grid>
        <Grid xs={12} sm={6}>
          <Typography variant="body2" fontWeight={500} color="text.secondary">Tenure Reduced</Typography>
          <Typography variant="h6" fontWeight={700} color="neutral.dark">{formatNumber(animatedMonths, locale)} months</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}