import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

export type VerificationResult = 'GENUINE' | 'ALREADY_SCANNED' | 'INVALID';

export interface ProductDetails {
  name?: string;
  batch_id?: string;
  manufacturer?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  [key: string]: unknown;
}

export interface VerifyQRResponse {
  verification_result: VerificationResult;
  qr_code_value?: string;
  blockchain_verified?: boolean | null;
  blockchain_status?: 'REGISTERED' | 'PENDING' | 'NOT_REGISTERED';
  blockchain_tx_hash?: string | null;
  product?: ProductDetails;
  message?: string;
  [key: string]: unknown;
}

/**
 * Verify a QR code.
 * Sends auth token if the user is logged in (pharmacy/distributor) so the scan
 * is associated with their account. Falls back to anonymous consumer scan.
 */
export async function verifyQRCode(
  qrCodeValue: string,
  scanLocationCity: string = 'Unknown',
  scanLocationCountry: string = 'Unknown',
  deviceType: 'ANDROID' | 'IOS' = 'ANDROID'
): Promise<VerifyQRResponse> {
  const [token, role] = await AsyncStorage.multiGet(['access_token', 'user_role'])
    .then((pairs) => [pairs[0][1], pairs[1][1]]);

  const scannedByRole =
    role === 'PHARMACY' ? 'PHARMACY' : 'CONSUMER';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = {
    qr_code_value: qrCodeValue,
    scanned_by_role: scannedByRole,
    scan_location_city: scanLocationCity,
    scan_location_country: scanLocationCountry,
    device_type: deviceType,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/verify/qr`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(
        'Request timed out. Check that the backend is running and reachable at ' + API_BASE_URL
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  // If token expired, clear it and retry once without auth
  if (response.status === 401) {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_role']);
    const retryResponse = await fetch(`${API_BASE_URL}/verify/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, scanned_by_role: 'CONSUMER' }),
    });
    if (!retryResponse.ok) {
      throw new Error(`Verification failed (${retryResponse.status})`);
    }
    return retryResponse.json() as Promise<VerifyQRResponse>;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail || `Verification failed (${response.status})`
    );
  }

  return response.json() as Promise<VerifyQRResponse>;
}
