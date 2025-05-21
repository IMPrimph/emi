import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Box from '@mui/material/Box';
import { formatCurrency, formatNumber } from '../utils/format';

export default function PaymentSchedule({ schedule }) {
  return (
    <TableContainer
      component={Box}
      sx={{ maxHeight: 500, overflowX: 'auto' }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'common.white', fontWeight: 600 }}>
              Month
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 600 }}>
              EMI
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 600 }}>
              Extra
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 600 }}>
              Interest
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 600 }}>
              Principal
            </TableCell>
            <TableCell align="right" sx={{ color: 'common.white', fontWeight: 600 }}>
              Remaining
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((row) => (
            <TableRow
              key={row.month}
              sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
            >
              <TableCell>{formatNumber(row.month)}</TableCell>
              <TableCell align="right">{formatCurrency(row.emi)}</TableCell>
              <TableCell align="right">{formatCurrency(row.extra)}</TableCell>
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