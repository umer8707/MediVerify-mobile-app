import { Platform } from 'react-native';
import { API_BASE_URL } from './config';

const LOGIN_TIMEOUT_MS = 15000;

export interface LoginResponse {
  user: { role: string; full_name?: string; email?: string };
  tokens: { access: string; refresh: string };
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        (errorBody as { detail?: string }).detail ||
          `Login failed (${response.status})`
      );
    }

    return response.json() as Promise<LoginResponse>;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        throw new Error(
          'Request timed out. Check that the backend is running and reachable at ' +
            API_BASE_URL
        );
      }
      if (e.message.includes('Network request failed') || e.message.includes('Failed to fetch')) {
        const hint =
          Platform.OS === 'android'
            ? ' On Android emulator, try 10.0.2.2:8000 in src/api/config.ts.'
            : ' Ensure device and PC are on the same network.';
        throw new Error('Cannot reach server.' + hint);
      }
    }
    throw e;
  }
}
