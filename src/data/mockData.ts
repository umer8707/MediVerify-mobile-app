import { Medicine, TraceabilityStep, VerificationStatus } from '../types';

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    batchId: 'BATCH-2024-001',
    manufacturer: 'PharmaCorp Ltd',
    manufacturingDate: '2024-01-15',
    expiryDate: '2026-01-15',
    status: 'genuine',
    scanDate: '2024-12-10T10:30:00',
    qrCode: 'QR-001-2024-001',
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    batchId: 'BATCH-2024-045',
    manufacturer: 'MediSafe Pharmaceuticals',
    manufacturingDate: '2024-02-20',
    expiryDate: '2026-02-20',
    status: 'duplicate',
    scanDate: '2024-12-09T14:20:00',
    qrCode: 'QR-002-2024-045',
  },
  {
    id: '3',
    name: 'Ibuprofen 400mg',
    batchId: 'BATCH-2024-089',
    manufacturer: 'HealthFirst Inc',
    manufacturingDate: '2024-03-10',
    expiryDate: '2025-03-10',
    status: 'counterfeit',
    scanDate: '2024-12-08T09:15:00',
    qrCode: 'QR-003-2024-089',
  },
];

export const mockTraceability: TraceabilityStep[] = [
  {
    id: '1',
    stage: 'Manufacturing',
    location: 'PharmaCorp Factory, Mumbai',
    date: '2024-01-15',
    icon: '🏭',
  },
  {
    id: '2',
    stage: 'Quality Control',
    location: 'QC Lab, Mumbai',
    date: '2024-01-16',
    icon: '🔬',
  },
  {
    id: '3',
    stage: 'Distribution Center',
    location: 'DC Warehouse, Delhi',
    date: '2024-01-20',
    icon: '📦',
  },
  {
    id: '4',
    stage: 'Pharmacy',
    location: 'City Pharmacy, Delhi',
    date: '2024-01-25',
    icon: '💊',
  },
  {
    id: '5',
    stage: 'Consumer',
    location: 'Your Location',
    date: '2024-12-10',
    icon: '👤',
  },
];

export const generateMockMedicine = (qrCode: string): Medicine => {
  const randomStatus: VerificationStatus[] = ['genuine', 'duplicate', 'counterfeit'];
  const status = randomStatus[Math.floor(Math.random() * randomStatus.length)];
  
  return {
    id: Date.now().toString(),
    name: 'Paracetamol 500mg',
    batchId: `BATCH-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    manufacturer: 'PharmaCorp Ltd',
    manufacturingDate: '2024-01-15',
    expiryDate: '2026-01-15',
    status,
    scanDate: new Date().toISOString(),
    qrCode,
  };
};

