import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const result = await page.evaluate(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Origin': 'http://localhost:5174'},
      body: JSON.stringify({ email: 'arnab.sheoran@gmail.com', password: 'Change@123@12344567778888' }),
      credentials: 'include',
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } catch (error) {
    return { error: String(error) };
  }
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
