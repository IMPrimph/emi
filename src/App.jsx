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
        py: { xs: 2, md: 3 }, // Reduced vertical padding
        background: "var(--color-bg)",
        transition: "var(--transition-all)",
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2, // Less margin
            position: "relative",
          }}
        >
          <Typography
            variant="h1"
            align="center"
            className="text-gradient"
            sx={{
              background:
                "linear-gradient(to right, var(--color-primary), var(--color-accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "var(--font-weight-bold)",
              fontSize: {
                xs: "1.7rem",
                md: "2.2rem",
              },
              mb: 0,
            }}
          >
            Professional EMI Loan Calculator
          </Typography>
        </Box>
        <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
          <div style={{ flex: 3 }}>
            <Card style={{ marginBottom: 20, padding: "1.2rem 1rem" }}>
              <LoanForm
                loanDetails={loanDetails}
                setLoanDetails={setLoanDetails}
                locale={locale}
                setLocale={setLocale}
              />
            </Card>
          </div>
          {schedule.length > 0 && (
            <Card style={{ padding: "1.2rem 1rem" }}>
              <Tabs
                value={tab}
                onChange={(_, val) => setTab(val)}
                centered
                sx={{
                  mb: 2,
                  display: "flex",
                  gap: 1,
                  "& .MuiTabs-flexContainer": {
                    gap: 1,
                  },
                  "& .MuiTab-root": {
                    fontSize: "1rem",
                    fontWeight: 500,
                    textTransform: "none",
                    minWidth: 100,
                  },
                }}
              >
                <Tab label="Calculator" />
                <Tab label="Payments" />
              </Tabs>
              {tab === 0 && (
                <div className="fade-in">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card style={{ padding: "1.2rem 1rem" }}>
                        <ExtraPaymentForm
                          extraPayment={extraPayment}
                          setExtraPayment={setExtraPayment}
                          addExtraPayment={addExtraPayment}
                          editing={!!editingMonth}
                        />
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LoanSummary
                        schedule={schedule}
                        loanDetails={loanDetails}
                        locale={locale}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <AmortizationChart schedule={schedule} />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <PaymentSchedule
                      schedule={schedule}
                      locale={locale}
                      loanDetails={loanDetails}
                    />
                  </Box>
                </div>
              )}
              {tab === 1 && (
                <div className="fade-in">
                  <ActualPaymentScreen schedule={schedule} />
                </div>
              )}
            </Card>
          )}
        </div>
      </Container>
      <Box
        component="footer"
        sx={{
          mt: 3,
          textAlign: "center",
          color: "var(--color-text-secondary)",
          fontSize: "0.95rem",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Professional EMI Loan Calculator. All
          Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
