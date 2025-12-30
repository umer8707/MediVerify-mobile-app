export type VerificationStatus = 'genuine' | 'duplicate' | 'counterfeit';

export interface Medicine {
  id: string;
  name: string;
  batchId: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  status: VerificationStatus;
  scanDate: string;
  qrCode: string;
}

export interface TraceabilityStep {
  id: string;
  stage: string;
  location: string;
  date: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

