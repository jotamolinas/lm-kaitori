
import { VisaType } from '../types';

/**
 * Core logic for the Gaijin Wheels Finance Calculator.
 * Handles visa-based restrictions and standard amortization math.
 */

export interface LoanConstraints {
  minDownPaymentRate: number;
  maxMonths: number;
}

export const VISA_CONSTRAINTS: Record<VisaType, LoanConstraints> = {
  [VisaType.PERMANENT]: { minDownPaymentRate: 0.10, maxMonths: 60 },
  [VisaType.WORK]: { minDownPaymentRate: 0.20, maxMonths: 36 },
  [VisaType.STUDENT]: { minDownPaymentRate: 0.50, maxMonths: 24 },
};

export const DEFAULT_ANNUAL_RATE = 0.049; // 4.9% APR
export const COMMISSION_RATE = 0; // Handled in admin panel

/**
 * Calculates the monthly payment for a loan.
 * Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
 * 
 * @param principal - The amount borrowed (Price - Down Payment)
 * @param annualRate - Annual interest rate (e.g., 0.049)
 * @param months - Number of installments
 * @returns Monthly payment amount
 */
export function calculateAmortization(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0;
  if (annualRate === 0) return principal / months;

  const monthlyRate = annualRate / 12;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.round(payment);
}

/**
 * Full calculation including business rules and commission.
 */
export function calculateCarLoan({
  carPrice,
  downPayment,
  visaType,
  requestedMonths,
  annualRate = DEFAULT_ANNUAL_RATE,
  commissionRate = COMMISSION_RATE
}: {
  carPrice: number;
  downPayment: number;
  visaType: VisaType;
  requestedMonths: number;
  annualRate?: number;
  commissionRate?: number;
}) {
  const commission = Math.round(carPrice * commissionRate);
  // The base for financing is the car price + commission
  const totalBasePrice = carPrice + commission;
  
  const constraints = VISA_CONSTRAINTS[visaType];
  const minDownRequired = Math.ceil(totalBasePrice * constraints.minDownPaymentRate);
  
  // Business Rule: Use either the user's down payment or the minimum required
  const actualDownPayment = Math.max(downPayment, minDownRequired);
  const loanAmount = totalBasePrice - actualDownPayment;
  
  // Business Rule: Cap months based on visa
  const actualMonths = Math.min(requestedMonths, constraints.maxMonths);
  
  const monthlyPayment = calculateAmortization(loanAmount, annualRate, actualMonths);
  const totalPayable = monthlyPayment * actualMonths + actualDownPayment;

  return {
    monthlyPayment,
    totalPayable,
    minDownRequired,
    actualMonths,
    loanAmount,
    commission,
    totalBasePrice,
    isDownPaymentValid: downPayment >= minDownRequired
  };
}
