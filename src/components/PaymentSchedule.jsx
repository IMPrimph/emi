import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { formatCurrency, formatNumber } from '../utils/format';

export default function PaymentSchedule({ schedule }) {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: 500, borderRadius: 2, overflowX: 'auto' }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.dark' }}> {/* Using primary.dark for potentially better contrast or emphasis */}
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold', py: 1.5, textTransform: 'uppercase' }}>
              Month
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold', py: 1.5, textTransform: 'uppercase' }}>
              EMI
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold', py: 1.5, textTransform: 'uppercase' }}>
              Extra
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold', py: 1.5, textTransform: 'uppercase' }}>
              Interest
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold', py: 1.5, textTransform: 'uppercase' }}>
              Principal
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold', py: 1.5, textTransform: 'uppercase' }}>
              Remaining
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((row) => (
            <TableRow
              key={row.month}
              sx={{ 
                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                ...(row.extra > 0 && { backgroundColor: 'secondary.light', '&:hover': { backgroundColor: 'secondary.main' } }) // Highlight row if extra payment
              }}
            >
              <TableCell>{formatNumber(row.month)}</TableCell>
              <TableCell align="right">{formatCurrency(row.emi)}</TableCell>
              <TableCell align="right">{row.extra > 0 ? formatCurrency(row.extra) : '-'}</TableCell> {/* Show '-' if no extra payment */}
              <TableCell align="right">{formatCurrency(row.interest)}</TableCell>
              <TableCell align="right">{formatCurrency(row.principalPaid)}</TableCell>
              <TableCell align="right">{formatCurrency(row.principalLeft)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}