
export enum Language {
  ES = 'es',
  EN = 'en',
  PT = 'pt'
}

export enum VisaType {
  PERMANENT = 'permanent',
  WORK = 'work',
  STUDENT = 'student'
}

export interface Car {
  id: string;
  make: string;
  makePt?: string;
  makeEn?: string;
  model: string;
  modelPt?: string;
  modelEn?: string;
  year: number;
  mileage: number;
  price: number;
  image: string;
  gallery?: string[];
  transmission: 'AT' | 'MT';
  engine: string;
  enginePt?: string;
  engineEn?: string;
  shaken: string;
  customDownPayment?: number;
  customMonths?: number;
  commissionRate?: number;
  status?: 'available' | 'reserved' | 'sold';
  weight?: string;
}

export interface FinanceResult {
  monthlyPayment: number;
  totalPayable: number;
  downPaymentRequired: number;
  months: number;
}

export interface LoanApplication {
  id: string;
  timestamp: number;
  carName: string;
  monthlyPayment: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  employer: string;
  monthlyIncome: string;
  status: 'pending' | 'approved' | 'rejected';
}
