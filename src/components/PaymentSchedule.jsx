import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  useTheme,
  Button,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatNumber } from '../utils/format';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useState } from 'react';

export default function PaymentSchedule({ schedule, locale = 'en-IN', loanDetails }) {
  const theme = useTheme();

  // Column visibility state
  const [visibleCols, setVisibleCols] = useState({
    emi: true,
    extra: true,
    interest: true,
    principal: true,
    remaining: true,
  });
  const columns = [
    { key: 'emi', label: 'EMI' },
    { key: 'extra', label: 'Extra' },
    { key: 'interest', label: 'Interest' },
    { key: 'principal', label: 'Principal' },
    { key: 'remaining', label: 'Remaining' },
  ];

  // CSV Export
  const handleDownloadCSV = () => {
    const header = ['Month', ...columns.filter(c => visibleCols[c.key]).map(c => c.label)];
    const rows = schedule.map(row => [
      formatNumber(row.month, locale),
      ...columns.filter(c => visibleCols[c.key]).map(c => {
        if (c.key === 'emi') return formatCurrency(row.emi, locale);
        if (c.key === 'extra') return formatCurrency(row.extra, locale);
        if (c.key === 'interest') return formatCurrency(row.interest, locale);
        if (c.key === 'principal') return formatCurrency(row.principalPaid, locale);
        if (c.key === 'remaining') return formatCurrency(row.principalLeft, locale);
        return '';
      })
    ]);
    // Metadata
    const meta = [
      `Exported: ${new Date().toLocaleString(locale)}`,
      `Loan Amount: ${loanDetails?.amount || ''}`,
      `Interest Rate: ${loanDetails?.rate || ''}`,
      `Tenure: ${loanDetails?.tenure || ''}`
    ];
    const csv = [meta.join(', '), '', [header, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emi-schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF Export
  const handleDownloadPDF = () => {
    let currencyCode = 'INR';
    if (locale === 'en-US') currencyCode = 'USD';
    else if (locale === 'en-GB') currencyCode = 'GBP';
    else if (locale === 'de-DE' || locale === 'fr-FR') currencyCode = 'EUR';
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', putOnlyUsedFonts: true });
    doc.setFont('times', 'normal');
    doc.text('EMI Payment Schedule', 14, 16);
    // Metadata
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString(locale)}`, 14, 22);
    doc.text(`Loan Amount: ${loanDetails?.amount || ''}`, 14, 27);
    doc.text(`Interest Rate: ${loanDetails?.rate || ''}`, 14, 32);
    doc.text(`Tenure: ${loanDetails?.tenure || ''}`, 14, 37);
    autoTable(doc, {
      startY: 42,
      head: [[
        'Month',
        ...columns.filter(c => visibleCols[c.key]).map(c => c.label)
      ]],
      body: schedule.map(row => [
        formatNumber(row.month, locale),
        ...columns.filter(c => visibleCols[c.key]).map(c => {
          if (c.key === 'emi') return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(row.emi);
          if (c.key === 'extra') return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(row.extra);
          if (c.key === 'interest') return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(row.interest);
          if (c.key === 'principal') return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(row.principalPaid);
          if (c.key === 'remaining') return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(row.principalLeft);
          return '';
        })
      ]),
      styles: { fontSize: 8, font: 'times', cellWidth: 'wrap' },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 8, right: 8 },
      theme: 'striped',
      tableWidth: 'auto'
    });
    doc.save('emi-schedule.pdf');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4, width: '100%' }} className="payment-schedule-container card">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ textAlign: 'center', letterSpacing: 1 }}>
          Payment Schedule
          <Tooltip title="EMI: Fixed monthly payment. Extra: Additional payment. Interest: Paid to lender. Principal: Loan repaid. Remaining: Balance.">
            <IconButton size="small" sx={{ ml: 1 }} tabIndex={0} aria-label="Schedule info">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
            aria-label="Download schedule as CSV"
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            aria-label="Download schedule as PDF"
          >
            PDF
          </Button>
        </Box>
      </Box>
      {/* Column toggles */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#F3F6FB',
        borderRadius: 2,
        px: 2,
        py: 1,
        boxShadow: '0 1px 4px rgba(59,130,246,0.07)',
        border: '1px solid #E5EAF2',
        minHeight: 48,
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mr: 2, minWidth: 120 }}>
          Show Columns:
        </Typography>
        {columns.map(col => (
          <FormControlLabel
            key={col.key}
            control={
              <Checkbox
                checked={visibleCols[col.key]}
                onChange={e => setVisibleCols(v => ({ ...v, [col.key]: e.target.checked }))}
                size="small"
                sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.dark' } }}
              />
            }
            label={<span style={{ fontWeight: 600, fontSize: 15, color: '#374151' }}>{col.label}</span>}
            sx={{ mr: 1, ml: 0, py: 0, px: 0.5 }}
          />
        ))}
      </Box>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#FFF', width: '100%', maxHeight: 420, overflowY: 'auto' }}
      >
        <Table size="small" stickyHeader sx={{ minWidth: 760, tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow sx={{ background: '#F3F4F6' }} className="sticky-header">
              <TableCell sx={{ color: '#4B5563', fontWeight: 700, fontSize: 16, letterSpacing: 1, p: 2, minWidth: 80 }}>Month</TableCell>
              {visibleCols.emi && <TableCell align="right" sx={{ color: '#4B5563', fontWeight: 700, fontSize: 16, letterSpacing: 1, p: 2, minWidth: 100 }}>EMI</TableCell>}
              {visibleCols.extra && <TableCell align="right" sx={{ color: '#4B5563', fontWeight: 700, fontSize: 16, letterSpacing: 1, p: 2, minWidth: 100 }}>Extra</TableCell>}
              {visibleCols.interest && <TableCell align="right" sx={{ color: '#4B5563', fontWeight: 700, fontSize: 16, letterSpacing: 1, p: 2, minWidth: 100 }}>Interest</TableCell>}
              {visibleCols.principal && <TableCell align="right" sx={{ color: '#4B5563', fontWeight: 700, fontSize: 16, letterSpacing: 1, p: 2, minWidth: 100 }}>Principal</TableCell>}
              {visibleCols.remaining && <TableCell align="right" sx={{ color: '#4B5563', fontWeight: 700, fontSize: 16, letterSpacing: 1, p: 2, minWidth: 100 }}>Remaining</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((row, index) => (
              <TableRow
                key={row.month}
                sx={{
                  background: index % 2 === 1 ? '#FAFAFB' : '#FFF',
                  '&:hover': { backgroundColor: '#E5E7EB' },
                }}
              >
                <TableCell sx={{ fontWeight: 500, p: 2, minWidth: 80, borderBottom: '1px solid #E5E7EB' }}>{formatNumber(row.month)}</TableCell>
                {visibleCols.emi && <TableCell align="right" sx={{ fontWeight: 500, p: 2, minWidth: 100, borderBottom: '1px solid #E5E7EB' }}>{formatCurrency(row.emi)}</TableCell>}
                {visibleCols.extra && <TableCell align="right" sx={{ fontWeight: 500, p: 2, minWidth: 100, borderBottom: '1px solid #E5E7EB' }}>{formatCurrency(row.extra)}</TableCell>}
                {visibleCols.interest && <TableCell align="right" sx={{ fontWeight: 500, p: 2, minWidth: 100, borderBottom: '1px solid #E5E7EB' }}>{formatCurrency(row.interest)}</TableCell>}
                {visibleCols.principal && <TableCell align="right" sx={{ fontWeight: 500, p: 2, minWidth: 100, borderBottom: '1px solid #E5E7EB' }}>{formatCurrency(row.principalPaid)}</TableCell>}
                {visibleCols.remaining && <TableCell align="right" sx={{ fontWeight: 500, p: 2, minWidth: 100, borderBottom: '1px solid #E5E7EB' }}>{formatCurrency(row.principalLeft)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}