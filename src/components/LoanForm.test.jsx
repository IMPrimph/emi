import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import LoanForm from './LoanForm';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // For MUI context

// Mock theme for components that might rely on it
const theme = createTheme();

describe('LoanForm.jsx', () => {
  const mockSetLoanDetails = vi.fn();
  const mockCalculate = vi.fn();

  const initialLoanDetails = { amount: '', rate: '', tenure: '' };

  const renderWithTheme = (ui) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call setLoanDetails when loan amount is changed', () => {
    renderWithTheme(
      <LoanForm 
        loanDetails={initialLoanDetails} 
        setLoanDetails={mockSetLoanDetails} 
        calculate={mockCalculate} 
      />
    );
    
    const amountInput = screen.getByLabelText(/Loan Amount/i);
    fireEvent.change(amountInput, { target: { value: '100000' } });
    
    expect(mockSetLoanDetails).toHaveBeenCalledWith({ ...initialLoanDetails, amount: '100000' });
  });

  it('should call setLoanDetails with an empty string when loan amount is cleared', () => {
    const currentDetails = { ...initialLoanDetails, amount: '100000' };
    renderWithTheme(
      <LoanForm 
        loanDetails={currentDetails} 
        setLoanDetails={mockSetLoanDetails} 
        calculate={mockCalculate} 
      />
    );
    
    const amountInput = screen.getByLabelText(/Loan Amount/i);
    fireEvent.change(amountInput, { target: { value: '' } }); // Simulate clearing the input
    
    expect(mockSetLoanDetails).toHaveBeenCalledWith({ ...currentDetails, amount: '' });
  });

  it('should call setLoanDetails when interest rate is changed', () => {
    renderWithTheme(
      <LoanForm 
        loanDetails={initialLoanDetails} 
        setLoanDetails={mockSetLoanDetails} 
        calculate={mockCalculate} 
      />
    );
    
    const rateInput = screen.getByLabelText(/Interest Rate/i);
    fireEvent.change(rateInput, { target: { value: '10' } });
    
    expect(mockSetLoanDetails).toHaveBeenCalledWith({ ...initialLoanDetails, rate: '10' });
  });
  
  it('should call setLoanDetails when tenure is changed', () => {
    renderWithTheme(
      <LoanForm 
        loanDetails={initialLoanDetails} 
        setLoanDetails={mockSetLoanDetails} 
        calculate={mockCalculate} 
      />
    );
    
    const tenureInput = screen.getByLabelText(/Tenure/i);
    fireEvent.change(tenureInput, { target: { value: '5' } });
    
    expect(mockSetLoanDetails).toHaveBeenCalledWith({ ...initialLoanDetails, tenure: '5' });
  });

  it('should call calculate when Calculate button is clicked', () => {
    renderWithTheme(
      <LoanForm 
        loanDetails={initialLoanDetails} 
        setLoanDetails={mockSetLoanDetails} 
        calculate={mockCalculate} 
      />
    );
    
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
    
    expect(mockCalculate).toHaveBeenCalledTimes(1);
  });
});
