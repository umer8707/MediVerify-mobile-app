/**
 * API base URL for the Django REST backend.
 * - Physical device (same Wi‑Fi as PC): use your PC's LAN IP (e.g. from ipconfig).
 * - Android emulator: use http://10.0.2.2:8000/api (10.0.2.2 = host machine).
 * - iOS simulator: localhost is fine, e.g. http://localhost:8000/api
 */
export const API_BASE_URL = 'http://192.168.0.102:8000/api';
