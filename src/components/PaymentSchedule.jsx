import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatNumber } from "../utils/format";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useState } from "react";

export default function PaymentSchedule({
  schedule,
  locale = "en-IN",
  loanDetails,
}) {
  // Column visibility state
  const [visibleCols, setVisibleCols] = useState({
    emi: true,
    extra: true,
    interest: true,
    principal: true,
    remaining: true,
  });
  const columns = [
    { key: "emi", label: "EMI" },
    { key: "extra", label: "Extra" },
    { key: "interest", label: "Interest" },
    { key: "principal", label: "Principal" },
    { key: "remaining", label: "Remaining" },
  ];

  // CSV Export
  const handleDownloadCSV = () => {
    const header = [
      "Month",
      ...columns.filter((c) => visibleCols[c.key]).map((c) => c.label),
    ];
    const rows = schedule.map((row) => [
      formatNumber(row.month, locale),
      ...columns
        .filter((c) => visibleCols[c.key])
        .map((c) => {
          if (c.key === "emi") return formatCurrency(row.emi, locale);
          if (c.key === "extra") return formatCurrency(row.extra, locale);
          if (c.key === "interest") return formatCurrency(row.interest, locale);
          if (c.key === "principal")
            return formatCurrency(row.principalPaid, locale);
          if (c.key === "remaining")
            return formatCurrency(row.principalLeft, locale);
          return "";
        }),
    ]);
    // Metadata
    const meta = [
      `Exported: ${new Date().toLocaleString(locale)}`,
      `Loan Amount: ${loanDetails?.amount || ""}`,
      `Interest Rate: ${loanDetails?.rate || ""}`,
      `Tenure: ${loanDetails?.tenure || ""}`,
    ];
    const csv = [
      meta.join(", "),
      "",
      [header, ...rows].map((r) => r.map((x) => `"${x}"`).join(",")).join("\n"),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emi-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF Export
  const handleDownloadPDF = () => {
    let currencyCode = "INR";
    if (locale === "en-US") currencyCode = "USD";
    else if (locale === "en-GB") currencyCode = "GBP";
    else if (locale === "de-DE" || locale === "fr-FR") currencyCode = "EUR";
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
    });
    doc.setFont("times", "normal");
    doc.text("EMI Payment Schedule", 14, 16);
    // Metadata
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString(locale)}`, 14, 22);
    doc.text(`Loan Amount: ${loanDetails?.amount || ""}`, 14, 27);
    doc.text(`Interest Rate: ${loanDetails?.rate || ""}`, 14, 32);
    doc.text(`Tenure: ${loanDetails?.tenure || ""}`, 14, 37);
    autoTable(doc, {
      startY: 42,
      head: [
        [
          "Month",
          ...columns.filter((c) => visibleCols[c.key]).map((c) => c.label),
        ],
      ],
      body: schedule.map((row) => [
        formatNumber(row.month, locale),
        ...columns
          .filter((c) => visibleCols[c.key])
          .map((c) => {
            if (c.key === "emi")
              return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currencyCode,
                maximumFractionDigits: 0,
              }).format(row.emi);
            if (c.key === "extra")
              return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currencyCode,
                maximumFractionDigits: 0,
              }).format(row.extra);
            if (c.key === "interest")
              return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currencyCode,
                maximumFractionDigits: 0,
              }).format(row.interest);
            if (c.key === "principal")
              return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currencyCode,
                maximumFractionDigits: 0,
              }).format(row.principalPaid);
            if (c.key === "remaining")
              return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currencyCode,
                maximumFractionDigits: 0,
              }).format(row.principalLeft);
            return "";
          }),
      ]),
      styles: { fontSize: 8, font: "times", cellWidth: "wrap" },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 8, right: 8 },
      theme: "striped",
      tableWidth: "auto",
    });
    doc.save("emi-schedule.pdf");
  };

  return (
    <Paper
      elevation={0}
      className="card card-form scale-on-hover fade-in-up"
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        mb: 3,
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Professional Header Section */}
      <Box className="section-header" sx={{ mb: 4, pb: 3, borderBottom: "2px solid var(--color-primary-100)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            }}
          />
          <Typography
            className="section-title"
            sx={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text)",
              margin: 0,
              letterSpacing: "0.025em",
            }}
          >
            Payment Schedule
          </Typography>
          <Tooltip 
            title="EMI: Fixed monthly payment • Extra: Additional payment • Interest: Paid to lender • Principal: Loan repaid • Remaining: Outstanding balance"
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              sx={{ 
                ml: 1,
                color: "var(--color-primary)",
                "&:hover": {
                  backgroundColor: "var(--color-primary-50)",
                  transform: "scale(1.1)",
                }
              }}
              tabIndex={0}
              aria-label="Schedule information"
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
            aria-label="Download schedule as CSV"
            sx={{ 
              minWidth: 100,
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            size="medium"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            aria-label="Download schedule as PDF"
            sx={{ 
              minWidth: 100,
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>
      {/* Professional Column Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
          alignItems: "center",
          background: "var(--color-primary-50)",
          borderRadius: "16px",
          p: 3,
          border: "1px solid var(--color-primary-100)",
        }}
      >
        <Typography
          sx={{
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-primary)",
            fontSize: "var(--font-size-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            minWidth: 120,
          }}
        >
          Visible Columns:
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {columns.map((col) => (
            <FormControlLabel
              key={col.key}
              control={
                <Checkbox
                  checked={visibleCols[col.key]}
                  onChange={(e) =>
                    setVisibleCols((v) => ({ ...v, [col.key]: e.target.checked }))
                  }
                  size="small"
                  sx={{
                    color: "var(--color-primary)",
                    "&.Mui-checked": { 
                      color: "var(--color-primary)",
                    },
                    "&:hover": {
                      backgroundColor: "var(--color-primary-100)",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: 20,
                    }
                  }}
                />
              }
              label={
                <Typography sx={{ 
                  fontWeight: "var(--font-weight-semibold)", 
                  fontSize: "var(--font-size-sm)", 
                  color: "var(--color-text)",
                  userSelect: "none",
                }}>
                  {col.label}
                </Typography>
              }
              sx={{ 
                mr: 1, 
                ml: 0,
                "& .MuiFormControlLabel-label": {
                  marginLeft: 1,
                }
              }}
            />
          ))}
        </Box>
      </Box>
      <TableContainer
        className="table-container"
        sx={{
          borderRadius: "16px",
          background: "var(--color-bg)",
          width: "100%",
          maxHeight: 420,
          overflowY: "auto",
          border: "1px solid var(--color-border-light)",
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            zIndex: 2,
          }
        }}
      >
        <Table
          stickyHeader
          sx={{ 
            minWidth: 720, 
            tableLayout: "fixed", 
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  background: "var(--color-table-header) !important",
                  color: "var(--color-text) !important",
                  fontFamily: "var(--font-family-base)",
                  fontWeight: "var(--font-weight-bold) !important",
                  fontSize: "var(--font-size-sm) !important",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "var(--space-4) var(--space-3) !important",
                  borderBottom: "2px solid var(--color-primary-200) !important",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  minWidth: 80,
                }}
              >
                Month
              </TableCell>
              {visibleCols.emi && (
                <TableCell
                  align="right"
                  sx={{
                    background: "var(--color-table-header) !important",
                    color: "var(--color-text) !important",
                    fontFamily: "var(--font-family-base)",
                    fontWeight: "var(--font-weight-bold) !important",
                    fontSize: "var(--font-size-sm) !important",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "var(--space-4) var(--space-3) !important",
                    borderBottom: "2px solid var(--color-primary-200) !important",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    minWidth: 100,
                  }}
                >
                  EMI
                </TableCell>
              )}
              {visibleCols.extra && (
                <TableCell
                  align="right"
                  sx={{
                    background: "var(--color-table-header) !important",
                    color: "var(--color-text) !important",
                    fontFamily: "var(--font-family-base)",
                    fontWeight: "var(--font-weight-bold) !important",
                    fontSize: "var(--font-size-sm) !important",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "var(--space-4) var(--space-3) !important",
                    borderBottom: "2px solid var(--color-primary-200) !important",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    minWidth: 100,
                  }}
                >
                  Extra Payment
                </TableCell>
              )}
              {visibleCols.interest && (
                <TableCell
                  align="right"
                  sx={{
                    background: "var(--color-table-header) !important",
                    color: "var(--color-text) !important",
                    fontFamily: "var(--font-family-base)",
                    fontWeight: "var(--font-weight-bold) !important",
                    fontSize: "var(--font-size-sm) !important",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "var(--space-4) var(--space-3) !important",
                    borderBottom: "2px solid var(--color-primary-200) !important",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    minWidth: 100,
                  }}
                >
                  Interest
                </TableCell>
              )}
              {visibleCols.principal && (
                <TableCell
                  align="right"
                  sx={{
                    background: "var(--color-table-header) !important",
                    color: "var(--color-text) !important",
                    fontFamily: "var(--font-family-base)",
                    fontWeight: "var(--font-weight-bold) !important",
                    fontSize: "var(--font-size-sm) !important",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "var(--space-4) var(--space-3) !important",
                    borderBottom: "2px solid var(--color-primary-200) !important",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    minWidth: 100,
                  }}
                >
                  Principal
                </TableCell>
              )}
              {visibleCols.remaining && (
                <TableCell
                  align="right"
                  sx={{
                    background: "var(--color-table-header) !important",
                    color: "var(--color-text) !important",
                    fontFamily: "var(--font-family-base)",
                    fontWeight: "var(--font-weight-bold) !important",
                    fontSize: "var(--font-size-sm) !important",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "var(--space-4) var(--space-3) !important",
                    borderBottom: "2px solid var(--color-primary-200) !important",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    minWidth: 120,
                  }}
                >
                  Balance
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((row, i) => (
              <TableRow 
                key={i}
                sx={{
                  "&:nth-of-type(even)": {
                    backgroundColor: "var(--color-neutral-50)",
                  },
                  "&:hover": {
                    backgroundColor: "var(--color-primary-50) !important",
                    transform: "scale(1.002)",
                    boxShadow: "inset 0 0 0 1px var(--color-primary-200)",
                    "& .MuiTableCell-root": {
                      color: "var(--color-text) !important",
                    }
                  },
                  transition: "var(--transition-all)",
                  cursor: "pointer",
                }}
              >
                <TableCell
                  sx={{
                    fontFamily: "var(--font-family-base)",
                    fontWeight: "var(--font-weight-semibold)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text)",
                    padding: "var(--space-3) !important",
                    borderBottom: "1px solid var(--color-border-light) !important",
                    transition: "var(--transition-all)",
                    minWidth: 80,
                  }}
                >
                  {row.month}
                </TableCell>
                {visibleCols.emi && (
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "var(--font-family-base)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-secondary)",
                      padding: "var(--space-3) !important",
                      borderBottom: "1px solid var(--color-border-light) !important",
                      transition: "var(--transition-all)",
                      minWidth: 100,
                    }}
                  >
                    {formatCurrency(row.emi)}
                  </TableCell>
                )}
                {visibleCols.extra && (
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "var(--font-family-base)",
                      fontWeight: row.extra > 0 ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
                      fontSize: "var(--font-size-sm)",
                      color: row.extra > 0 ? "var(--color-success)" : "var(--color-text-muted)",
                      padding: "var(--space-3) !important",
                      borderBottom: "1px solid var(--color-border-light) !important",
                      transition: "var(--transition-all)",
                      minWidth: 100,
                    }}
                  >
                    {formatCurrency(row.extra)}
                  </TableCell>
                )}
                {visibleCols.interest && (
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "var(--font-family-base)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-warning)",
                      padding: "var(--space-3) !important",
                      borderBottom: "1px solid var(--color-border-light) !important",
                      transition: "var(--transition-all)",
                      minWidth: 100,
                    }}
                  >
                    {formatCurrency(row.interest)}
                  </TableCell>
                )}
                {visibleCols.principal && (
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "var(--font-family-base)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-primary)",
                      padding: "var(--space-3) !important",
                      borderBottom: "1px solid var(--color-border-light) !important",
                      transition: "var(--transition-all)",
                      minWidth: 100,
                    }}
                  >
                    {formatCurrency(row.principalPaid)}
                  </TableCell>
                )}
                {visibleCols.remaining && (
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: "var(--font-family-base)",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                      color: row.principalLeft === 0 ? "var(--color-success)" : "var(--color-text-secondary)",
                      padding: "var(--space-3) !important",
                      borderBottom: "1px solid var(--color-border-light) !important",
                      transition: "var(--transition-all)",
                      minWidth: 120,
                    }}
                  >
                    {formatCurrency(row.principalLeft)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
