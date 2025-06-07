import {
  TextField,
  Box,
  InputAdornment,
  Tooltip,
  IconButton,
  Alert,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ExtraPaymentForm({
  extraPayment,
  setExtraPayment,
  addExtraPayment,
  editing,
}) {
  // Validation state
  const [error] = useState("");

  return (
    <Box
      className="extra-payment-form"
      sx={{
        p: 0,
        background: "none",
        boxShadow: "none",
        mb: 0,
      }}
    >
      <Grid container spacing={1.5} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={6}>
          <TextField
            label={
              <span>
                Month #{" "}
                <Tooltip title="Month number for payment">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </span>
            }
            variant="outlined"
            type="number"
            value={extraPayment.month}
            onChange={(e) =>
              setExtraPayment({ ...extraPayment, month: e.target.value })
            }
            fullWidth
            size="small"
            InputProps={{
              sx: {
                fontWeight: 600,
                fontSize: 15,
                background: "var(--color-input-bg)",
                borderRadius: 1,
              },
            }}
            sx={{ background: "var(--color-input-bg)", borderRadius: 1 }}
            error={
              !!error &&
              (!extraPayment.month || isNaN(parseFloat(extraPayment.month)))
            }
            helperText={
              !!error &&
              (!extraPayment.month || isNaN(parseFloat(extraPayment.month)))
                ? error
                : ""
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={
              <span>
                Amount{" "}
                <Tooltip title="Extra payment amount">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </span>
            }
            variant="outlined"
            value={extraPayment.amount}
            onChange={(e) =>
              setExtraPayment({ ...extraPayment, amount: e.target.value })
            }
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
              sx: {
                fontWeight: 600,
                fontSize: 15,
                background: "var(--color-input-bg)",
                borderRadius: 1,
              },
            }}
            sx={{ background: "var(--color-input-bg)", borderRadius: 1 }}
            error={
              !!error &&
              (!extraPayment.amount || isNaN(parseFloat(extraPayment.amount)))
            }
            helperText={
              !!error &&
              (!extraPayment.amount || isNaN(parseFloat(extraPayment.amount)))
                ? error
                : ""
            }
          />
        </Grid>
        <Grid xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="medium"
            sx={{
              height: 36,
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 2,
              boxShadow: 1,
              background: "linear-gradient(90deg, #3B82F6 0%, #2563eb 100%)",
              transition:
                "background-color 0.2s, box-shadow 0.2s, transform 0.1s",
              mt: 1,
            }}
            onClick={addExtraPayment}
            disabled={!!error || !extraPayment.month || !extraPayment.amount}
          >
            {editing ? "Update Extra" : "Add Extra"}
          </Button>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mt: 1, fontSize: 14, p: 1.2 }}>
              {error}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
