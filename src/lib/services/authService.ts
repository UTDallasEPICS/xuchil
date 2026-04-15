// authService: wrapper for auth endpoints
import { sendRequest } from '@/utils/request';

export async function login(email: string, password: string) {
  return await sendRequest({ method: 'POST', url: '/api/auth/login', body: { email, password } });
}

export async function logout() {
  return await sendRequest({ method: 'POST', url: '/api/auth/logout' });
}
