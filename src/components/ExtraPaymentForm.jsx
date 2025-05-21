import { TextField, Button, Grid, Box, InputAdornment } from '@mui/material';

export default function ExtraPaymentForm({ extraPayment, setExtraPayment, addExtraPayment, editing }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label="Month #"
            variant="outlined"
            type="number"
            value={extraPayment.month || ''}
            onChange={(e) =>
              setExtraPayment({ ...extraPayment, month: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Extra Amount"
            variant="outlined"
            type="number"
            value={extraPayment.amount || ''}
            onChange={(e) =>
              setExtraPayment({ ...extraPayment, amount: e.target.value })
            }
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              inputProps: { step: 'any' },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="large"
            onClick={addExtraPayment}
          >
            {editing ? 'Update Extra' : 'Add Extra'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}