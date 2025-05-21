// LoanForm.jsx
import { TextField, Button, Grid, Box, InputAdornment } from '@mui/material';

export default function LoanForm({ loanDetails, setLoanDetails, calculate }) {
  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mb: 2 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            label="Loan Amount"
            variant="outlined"
            type="number"
            value={loanDetails.amount || ''}
            onChange={(e) =>
              setLoanDetails({ ...loanDetails, amount: e.target.value })
            }
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              inputProps: { step: 'any' },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Interest Rate (%)"
            variant="outlined"
            type="number"
            value={loanDetails.rate || ''}
            onChange={(e) =>
              setLoanDetails({ ...loanDetails, rate: e.target.value })
            }
            fullWidth
            InputProps={{ inputProps: { step: 'any' } }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Tenure (Years)"
            variant="outlined"
            type="number"
            value={loanDetails.tenure || ''}
            onChange={(e) =>
              setLoanDetails({ ...loanDetails, tenure: e.target.value })
            }
            fullWidth
            InputProps={{ inputProps: { step: 1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={calculate}
          >
            Calculate
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}