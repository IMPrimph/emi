import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import LoanForm from "./components/LoanForm";
import ExtraPaymentForm from "./components/ExtraPaymentForm";
import LoanSummary from "./components/LoanSummary";
import PaymentSchedule from "./components/PaymentSchedule";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ActualPaymentScreen from "./components/ActualPaymentScreen";
import AmortizationChart from "./components/AmortizationChart";
import { Card } from "./components/Card";
import {
  calculateEMI,
  generateSchedule,
  calculateEMIWithSW,
} from "./utils/calculateLoan";

function App() {
  const [loanDetails, setLoanDetails] = useState({
    amount: "",
    rate: "",
    tenure: "",
  });
  const [extraPayment, setExtraPayment] = useState({ month: "", amount: "" });
  const [extraPayments, setExtraPayments] = useState({});
  const [editingMonth, setEditingMonth] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [tab, setTab] = useState(0);
  const [locale, setLocale] = useState("en-IN");

  useEffect(() => {
    try {
      const storedLoan = localStorage.getItem("emi_loan_details");
      const storedExtras = localStorage.getItem("emi_extra_payments");
      const storedLocale = localStorage.getItem("emi_locale");
      if (storedLoan) setLoanDetails(JSON.parse(storedLoan));
      if (storedExtras) setExtraPayments(JSON.parse(storedExtras));
      if (storedLocale) setLocale(storedLocale);
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    if (!loanDetails.amount && !loanDetails.rate && !loanDetails.tenure) return;
    try {
      localStorage.setItem("emi_loan_details", JSON.stringify(loanDetails));
    } catch {
      // ignore
    }
  }, [loanDetails]);

  useEffect(() => {
    if (Object.keys(extraPayments).length === 0) return;
    try {
      localStorage.setItem("emi_extra_payments", JSON.stringify(extraPayments));
    } catch {
      // ignore
    }
  }, [extraPayments]);

  useEffect(() => {
    if (!locale) return;
    try {
      localStorage.setItem("emi_locale", locale);
    } catch {
      // ignore
    }
  }, [locale]);

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
    calculateEMIWithSW({
      amount: amt,
      rate: rt,
      tenure: tn,
      extraPayments,
    }).then((result) => {
      if (result && result.schedule) {
        setSchedule(result.schedule);
      } else {
        const emi = calculateEMI(amt, monthlyRate, totalMonths);
        const newSchedule = generateSchedule(
          amt,
          rt,
          totalMonths,
          emi,
          extraPayments
        );
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
    setExtraPayment({ month: "", amount: "" });
    setEditingMonth(null);
  };

  return (
    <Box
      className="app-container"
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        background: "var(--color-bg)",
        transition: "var(--transition-all)",
      }}
    >
      <Container maxWidth="1400px" sx={{ px: { xs: 3, sm: 4, md: 6 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 8,
            position: "relative",
          }}
        >
          <Typography
            variant="h1"
            align="center"
            className="display-title"
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "2.5rem",
                md: "3rem",
              },
              mb: 2,
              textAlign: "center",
            }}
          >
            Professional EMI Calculator
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-lg)",
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Calculate your loan payments with precision. Plan extra payments and visualize your amortization schedule.
          </Typography>
        </Box>
        <Grid container spacing={6} sx={{ mb: 8 }}>
          {/* Loan Form Section - Always Visible */}
          <Grid item xs={12} xl={4}>
            <Card>
              <LoanForm
                loanDetails={loanDetails}
                setLoanDetails={setLoanDetails}
                locale={locale}
                setLocale={setLocale}
              />
            </Card>
          </Grid>

          {/* Results Section - Only show when schedule exists */}
          {schedule.length > 0 && (
            <Grid item xs={12} xl={8}>
              {/* Tabs for different views */}
              <Box sx={{ mb: 4 }}>
                <Tabs
                  value={tab}
                  onChange={(_, val) => setTab(val)}
                  sx={{
                    "& .MuiTab-root": {
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--font-weight-semibold)",
                      textTransform: "none",
                      minWidth: 140,
                      color: "var(--color-text-secondary)",
                      borderRadius: "12px 12px 0 0",
                      marginRight: 1,
                      "&:hover": {
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary)",
                      }
                    },
                    "& .Mui-selected": {
                      color: "var(--color-primary) !important",
                      backgroundColor: "var(--color-primary-50)",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "var(--color-primary)",
                      height: 3,
                      borderRadius: "2px",
                    },
                  }}
                >
                  <Tab label="Calculator" />
                  <Tab label="Payment Tracker" />
                </Tabs>
              </Box>

              {/* Calculator Tab Content */}
              {tab === 0 && (
                <Box className="fade-in">
                  <Grid container spacing={4}>
                    {/* Extra Payment Form */}
                    <Grid item xs={12} lg={6}>
                      <ExtraPaymentForm
                        extraPayment={extraPayment}
                        setExtraPayment={setExtraPayment}
                        addExtraPayment={addExtraPayment}
                        editing={!!editingMonth}
                      />
                    </Grid>
                    
                    {/* Loan Summary */}
                    <Grid item xs={12} lg={6}>
                      <LoanSummary
                        schedule={schedule}
                        loanDetails={loanDetails}
                        locale={locale}
                      />
                    </Grid>
                    
                    {/* Amortization Chart */}
                    <Grid item xs={12}>
                      <AmortizationChart schedule={schedule} />
                    </Grid>
                    
                    {/* Payment Schedule Table */}
                    <Grid item xs={12}>
                      <PaymentSchedule
                        schedule={schedule}
                        locale={locale}
                        loanDetails={loanDetails}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Payment Tracker Tab Content */}
              {tab === 1 && (
                <Box className="fade-in">
                  <ActualPaymentScreen schedule={schedule} />
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Container>
      <Box
        component="footer"
        sx={{
          mt: 6,
          pt: 3,
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} Professional EMI Loan Calculator. Built with precision.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
