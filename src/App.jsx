import { useState, useEffect } from "react"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import LoanForm from "./components/LoanForm";
import ExtraPaymentForm from "./components/ExtraPaymentForm";
import LoanSummary from "./components/LoanSummary";
import PaymentSchedule from "./components/PaymentSchedule";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ActualPaymentScreen from "./components/ActualPaymentScreen";
import AmortizationChart from "./components/AmortizationChart";
import { calculateEMI, generateSchedule, calculateEMIWithSW } from "./utils/calculateLoan";
import { formatCurrency } from "./utils/format";

function App() {
  const [loanDetails, setLoanDetails] = useState({ amount: '', rate: '', tenure: '' });
  const [extraPayment, setExtraPayment] = useState({ month: '', amount: '' });
  const [extraPayments, setExtraPayments] = useState({});
  const [editingMonth, setEditingMonth] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [tab, setTab] = useState(0);
  const [locale, setLocale] = useState('en-IN');

  useEffect(() => {
    const { amount, rate, tenure } = loanDetails;
    const amt = parseFloat(amount) || 0;
    const rt = parseFloat(rate) || 0;
    const tn = parseInt(tenure, 10) || 0;
    if (!amt || !rt || !tn) {
      setSchedule([]);
      return;
    }
    const totalMonths = tn * 12;
    const monthlyRate = rt / 12 / 100;
    // Try offline calculation via service worker first
    calculateEMIWithSW({ amount: amt, rate: rt, tenure: tn, extraPayments }).then((result) => {
      if (result && result.schedule) {
        setSchedule(result.schedule);
      } else {
        // fallback to local
        const emi = calculateEMI(amt, monthlyRate, totalMonths);
        const newSchedule = generateSchedule(amt, rt, totalMonths, emi, extraPayments);
        setSchedule(newSchedule);
      }
    });
  }, [loanDetails, extraPayments]);

  const addExtraPayment = () => {
    const monthNum = parseInt(extraPayment.month, 10);
    const amtNum = parseFloat(extraPayment.amount);
    if (!monthNum || isNaN(monthNum) || monthNum < 1) return;
    if (isNaN(amtNum) || amtNum <= 0) return;
    const updatedExtras = { ...extraPayments };
    if (editingMonth !== null && editingMonth !== monthNum) {
      delete updatedExtras[editingMonth];
    }
    updatedExtras[monthNum] = amtNum;
    setExtraPayments(updatedExtras);
    setExtraPayment({ month: '', amount: '' });
    setEditingMonth(null);
  };

  const removeExtraPayment = (month) => {
    const updatedExtras = { ...extraPayments };
    delete updatedExtras[month];
    setExtraPayments(updatedExtras);
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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 6 }}>
      <Container maxWidth={false} sx={{ maxWidth: 900, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative' }}>
          <img src="/vite.svg" alt="Brand logo" style={{ height: 38, marginRight: 14, verticalAlign: 'middle' }} />
          <Typography
            variant="h3"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700, mb: 0 }}
          >
            Professional EMI Loan Calculator
          </Typography>
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            {/* DarkModeToggle is rendered globally in main.jsx, so this is just a placeholder for layout */}
          </Box>
        </Box>

        <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 6, width: '100%' }} elevation={6}>
          <LoanForm
            loanDetails={loanDetails}
            setLoanDetails={setLoanDetails}
            locale={locale}
            setLocale={setLocale}
          />
        </Paper>

        {schedule.length > 0 && (
          <>
            <Tabs value={tab} onChange={(_, val) => setTab(val)} centered sx={{ mb: 3 }}>
              <Tab label="Calculator" />
              <Tab label="Payments" />
            </Tabs>

            {tab === 0 && (
              <div className="fade-in">
                <Grid container spacing={3} sx={{ mb: 3, maxWidth: 900, mx: 'auto', width: '100%' }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} elevation={6}>
                      <ExtraPaymentForm
                        extraPayment={extraPayment}
                        setExtraPayment={setExtraPayment}
                        addExtraPayment={addExtraPayment}
                        editing={editingMonth !== null}
                      />
                      {Object.keys(extraPayments).length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Extra Payments
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(extraPayments).map(([month, amt]) => (
                              <Chip
                                key={month}
                                label={`Month ${month}: ${formatCurrency(amt, locale)}`}
                                onDelete={() => removeExtraPayment(Number(month))}
                                onClick={() => editExtraPayment(Number(month))}
                                color="secondary"
                                tabIndex={0}
                                aria-label={`Extra payment for month ${month}`}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6, width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} elevation={6}>
                      <LoanSummary schedule={schedule} loanDetails={loanDetails} locale={locale} />
                    </Paper>
                  </Grid>
                  {/* Amortization Chart */}
                  <Grid item xs={12}>
                    <AmortizationChart schedule={schedule} />
                  </Grid>
                </Grid>
                <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
                  <PaymentSchedule schedule={schedule} locale={locale} loanDetails={loanDetails} />
                </Box>
              </div>
            )}
            {tab === 1 && (
              <div className="fade-in">
                <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
                  <ActualPaymentScreen schedule={schedule} />
                </Box>
              </div>
            )}
          </>
        )}
      </Container>
      <Box component="footer" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © {new Date().getFullYear()} Professional EMI Loan Calculator. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;