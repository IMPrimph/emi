import { describe, it, expect, vi } from 'vitest';

// This is not a real React component rendering test.
// We are testing the logic of functions normally part of App.jsx.
// We need to simulate the relevant parts of App's state and props.

const mockSetExtraPayments = vi.fn();
const mockSetExtraPayment = vi.fn();
const mockSetEditingMonth = vi.fn();
const mockRecalcSchedule = vi.fn();

// Helper to simulate the App's functions and state context
const getAppLogicContext = (currentExtraPayments, currentEditingMonth, currentExtraPaymentForm) => {
  let extraPaymentsState = { ...currentExtraPayments };
  let editingMonthState = currentEditingMonth;
  let extraPaymentFormState = { ...currentExtraPaymentForm };

  mockSetExtraPayments.mockImplementation((newState) => {
    if (typeof newState === 'function') {
      extraPaymentsState = newState(extraPaymentsState);
    } else {
      extraPaymentsState = newState;
    }
  });
  mockSetExtraPayment.mockImplementation((newState) => {
    extraPaymentFormState = newState;
  });
  mockSetEditingMonth.mockImplementation((newState) => {
    editingMonthState = newState;
  });

  // This is the actual addExtraPayment function from App.jsx, adapted for this test context
  const addExtraPayment = () => {
    const monthNum = parseInt(extraPaymentFormState.month, 10);
    const amtNum = parseFloat(extraPaymentFormState.amount);
    if (!monthNum || isNaN(monthNum) || monthNum < 1) return;
    if (isNaN(amtNum) || amtNum <= 0) return;
    
    const updatedExtras = { ...extraPaymentsState };

    if (editingMonthState !== null) { // We are in edit mode
      if (editingMonthState !== monthNum) { // Month number was changed during edit
        delete updatedExtras[editingMonthState]; // Delete the old entry
      }
      updatedExtras[monthNum] = amtNum;
    } else { // We are in add mode
      updatedExtras[monthNum] = amtNum;
    }

    mockSetExtraPayments(updatedExtras);
    mockRecalcSchedule(updatedExtras); // Pass the locally updated extras
    mockSetExtraPayment({ month: '', amount: '' });
    mockSetEditingMonth(null);
  };

  const removeExtraPayment = (month) => {
    const updatedExtras = { ...extraPaymentsState };
    delete updatedExtras[month];
    
    mockSetExtraPayments(updatedExtras);
    mockRecalcSchedule(updatedExtras);
    
    if (editingMonthState === month) {
      mockSetEditingMonth(null);
      mockSetExtraPayment({ month: '', amount: '' });
    }
  };
  
  const editExtraPayment = (month) => {
    mockSetExtraPayment({ month: String(month), amount: String(extraPaymentsState[month]) });
    mockSetEditingMonth(month);
  };
  
  return { 
    addExtraPayment, 
    removeExtraPayment, 
    editExtraPayment,
    // expose getters for state to assert against the "final" state after mocks run
    getExtraPaymentsState: () => extraPaymentsState,
    getExtraPaymentFormState: () => extraPaymentFormState,
    getEditingMonthState: () => editingMonthState,
  };
};


describe('App.jsx Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addExtraPayment', () => {
    it('should add a new payment when editingMonth is null', () => {
      const initialExtraPayments = {};
      const formInput = { month: '5', amount: '1000' };
      const context = getAppLogicContext(initialExtraPayments, null, formInput);

      context.addExtraPayment();

      const finalExtraPayments = context.getExtraPaymentsState();
      expect(finalExtraPayments[5]).toBe(1000);
      expect(mockSetExtraPayments).toHaveBeenCalledWith({ 5: 1000 });
      expect(mockRecalcSchedule).toHaveBeenCalledWith({ 5: 1000 });
      expect(mockSetExtraPayment).toHaveBeenCalledWith({ month: '', amount: '' });
      expect(mockSetEditingMonth).toHaveBeenCalledWith(null);
    });

    it('should update an existing payment amount when editingMonth is set and month is unchanged', () => {
      const initialExtraPayments = { 5: 1000 };
      const formInput = { month: '5', amount: '1500' }; // Editing month 5
      const context = getAppLogicContext(initialExtraPayments, 5, formInput);
      
      context.addExtraPayment();
      
      const finalExtraPayments = context.getExtraPaymentsState();
      expect(finalExtraPayments[5]).toBe(1500);
      expect(mockSetExtraPayments).toHaveBeenCalledWith({ 5: 1500 });
      expect(mockRecalcSchedule).toHaveBeenCalledWith({ 5: 1500 });
      expect(mockSetExtraPayment).toHaveBeenCalledWith({ month: '', amount: '' });
      expect(mockSetEditingMonth).toHaveBeenCalledWith(null);
    });

    it('should "move" an existing payment when editingMonth is set and month is changed', () => {
      const initialExtraPayments = { 5: 1000 };
      const formInput = { month: '10', amount: '1200' }; // Editing month 5, changing to month 10
      const context = getAppLogicContext(initialExtraPayments, 5, formInput);
      
      context.addExtraPayment();
      
      const finalExtraPayments = context.getExtraPaymentsState();
      expect(finalExtraPayments[5]).toBeUndefined();
      expect(finalExtraPayments[10]).toBe(1200);
      expect(mockSetExtraPayments).toHaveBeenCalledWith({ 10: 1200 });
      expect(mockRecalcSchedule).toHaveBeenCalledWith({ 10: 1200 });
      expect(mockSetExtraPayment).toHaveBeenCalledWith({ month: '', amount: '' });
      expect(mockSetEditingMonth).toHaveBeenCalledWith(null);
    });

    it('should not add payment if amount is invalid', () => {
      const initialExtraPayments = {};
      const formInput = { month: '5', amount: '0' }; // Invalid amount
      const context = getAppLogicContext(initialExtraPayments, null, formInput);
      context.addExtraPayment();
      expect(mockSetExtraPayments).not.toHaveBeenCalled();
      expect(mockRecalcSchedule).not.toHaveBeenCalled();
    });

    it('should not add payment if month is invalid', () => {
      const initialExtraPayments = {};
      const formInput = { month: '0', amount: '100' }; // Invalid month
      const context = getAppLogicContext(initialExtraPayments, null, formInput);
      context.addExtraPayment();
      expect(mockSetExtraPayments).not.toHaveBeenCalled();
      expect(mockRecalcSchedule).not.toHaveBeenCalled();
    });
  });

  describe('removeExtraPayment', () => {
    it('should remove an existing payment', () => {
      const initialExtraPayments = { 5: 1000, 10: 2000 };
      const context = getAppLogicContext(initialExtraPayments, null, {});
      
      context.removeExtraPayment(5);
      
      const finalExtraPayments = context.getExtraPaymentsState();
      expect(finalExtraPayments[5]).toBeUndefined();
      expect(finalExtraPayments[10]).toBe(2000);
      expect(mockSetExtraPayments).toHaveBeenCalledWith({ 10: 2000 });
      expect(mockRecalcSchedule).toHaveBeenCalledWith({ 10: 2000 });
    });

    it('should clear form and editingMonth if removing the month currently being edited', () => {
      const initialExtraPayments = { 5: 1000 };
      const context = getAppLogicContext(initialExtraPayments, 5, { month: '5', amount: '1000' });
      
      context.removeExtraPayment(5);
      
      expect(mockSetExtraPayments).toHaveBeenCalledWith({});
      expect(mockRecalcSchedule).toHaveBeenCalledWith({});
      expect(mockSetEditingMonth).toHaveBeenCalledWith(null);
      expect(mockSetExtraPayment).toHaveBeenCalledWith({ month: '', amount: '' });
    });
  });

  describe('editExtraPayment', () => {
    it('should populate form state and set editingMonth', () => {
      const initialExtraPayments = { 7: 1500 };
      const context = getAppLogicContext(initialExtraPayments, null, {});
      
      context.editExtraPayment(7);
      
      expect(mockSetExtraPayment).toHaveBeenCalledWith({ month: '7', amount: '1500' });
      expect(mockSetEditingMonth).toHaveBeenCalledWith(7);
    });
  });
});
