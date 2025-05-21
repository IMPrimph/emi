import { useState } from "react"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import LoanForm from "./components/LoanForm";
import ExtraPaymentForm from "./components/ExtraPaymentForm";
import LoanSummary from "./components/LoanSummary";
import PaymentSchedule from "./components/PaymentSchedule";
import { calculateEMI, generateSchedule } from "./utils/calculateLoan";
import { formatCurrency } from "./utils/format";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function App() {
  const [loanDetails, setLoanDetails] = useState({ amount: '', rate: '', tenure: '' });
  const [extraPayment, setExtraPayment] = useState({ month: '', amount: '' });
  const [extraPayments, setExtraPayments] = useState({});
  const [editingMonth, setEditingMonth] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const recalcSchedule = (extras) => {
    const { amount, rate, tenure } = loanDetails;
    const amt = parseFloat(amount) || 0;
    const rt = parseFloat(rate) || 0;
    const tn = parseInt(tenure, 10) || 0;
    const totalMonths = tn * 12;
    const monthlyRate = rt / 12 / 100;
    const emi = calculateEMI(amt, monthlyRate, totalMonths);
    const newSchedule = generateSchedule(amt, rt, totalMonths, emi, extras);
    setSchedule(newSchedule);
  };

  const calculate = () => {
    recalcSchedule(extraPayments);
  };

  const addExtraPayment = () => {
    const monthNum = parseInt(extraPayment.month, 10);
    const amtNum = parseFloat(extraPayment.amount);
    if (!monthNum || isNaN(monthNum) || monthNum < 1) return;
    if (isNaN(amtNum) || amtNum <= 0) return;
    const updatedExtras = { ...extraPayments };

    if (editingMonth !== null) { // We are in edit mode
      if (editingMonth !== monthNum) { // Month number was changed during edit
        delete updatedExtras[editingMonth]; // Delete the old entry
      }
      // In either case (month changed or just amount changed), update the entry for monthNum
      updatedExtras[monthNum] = amtNum;
    } else { // We are in add mode
      updatedExtras[monthNum] = amtNum;
    }

    setExtraPayments(updatedExtras);
    recalcSchedule(updatedExtras);
    setExtraPayment({ month: '', amount: '' }); // Clear form
    setEditingMonth(null); // Reset editing mode
  };

  const removeExtraPayment = (month) => {
    const updatedExtras = { ...extraPayments };
    delete updatedExtras[month];
    setExtraPayments(updatedExtras);
    recalcSchedule(updatedExtras);
    if (editingMonth === month) {
      setEditingMonth(null);
      setExtraPayment({ month: '', amount: '' });
    }
  };

  const editExtraPayment = (month) => {
    setExtraPayment({ month: String(month), amount: String(extraPayments[month]) });
    setEditingMonth(month);
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 6,
      })}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          align="center"
          sx={{
            color: 'common.white',
            fontWeight: 700,
            mb: 4,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Professional EMI Loan Calculator
        </Typography>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} elevation={6}>
          <LoanForm
            loanDetails={loanDetails}
            setLoanDetails={setLoanDetails}
            calculate={calculate}
          />
        </Paper>

        {schedule.length > 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }} elevation={6}>
                  <ExtraPaymentForm
                    extraPayment={extraPayment}
                    setExtraPayment={setExtraPayment}
                    addExtraPayment={addExtraPayment}
                    editing={editingMonth !== null}
                  />
                  {Object.keys(extraPayments).length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Extra Payments
                      </Typography>
                      <List dense>
                        {Object.entries(extraPayments).map(([month, amt]) => (
                          <ListItem
                            key={month}
                            secondaryAction={
                              <>
                                <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={() => editExtraPayment(Number(month))}
                                >
                                  <EditIcon color="primary" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => removeExtraPayment(Number(month))}
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </>
                            }
                          >
                            <ListItemText
                              primary={`Month ${month}: ${formatCurrency(amt)}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <LoanSummary schedule={schedule} loanDetails={loanDetails} />
              </Grid>
            </Grid>

            <Paper sx={{ p: 2, borderRadius: 2 }} elevation={6}>
              <PaymentSchedule schedule={schedule} />
            </Paper>
          </>
        )}
      </Container>

      <Box component="footer" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'common.white' }}>
          © {new Date().getFullYear()} Professional EMI Loan Calculator. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;