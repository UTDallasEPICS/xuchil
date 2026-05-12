import BrowserHelper from './browser';
import { Selectors } from './selectors';
import { navigateTo } from '../config';

export async function loginAsAdmin(browser: BrowserHelper): Promise<void> {
  await navigateTo('/login');
  await browser.executeScript(
    `return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'admin@xuchil.com', password: 'Admin123' })
    })`
  );
  await navigateTo('/user');
  await browser.assertPageContains('Perfil de usuario');
}