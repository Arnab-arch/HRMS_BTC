import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
page.on('request', req => {
  if (req.url().includes('/api/auth/login')) {
    console.log('LOGIN_REQUEST_URL', req.url());
    console.log('LOGIN_REQUEST_HEADERS', JSON.stringify(req.headers(), null, 2));
    console.log('LOGIN_REQUEST_PAYLOAD', req.postData());
  }
});
page.on('response', async (res) => {
  if (res.url().includes('/api/auth/login')) {
    console.log('LOGIN_RESPONSE_STATUS', res.status());
    console.log('LOGIN_RESPONSE_BODY', await res.text());
  }
});
await page.goto('http://localhost:5174/login');
await page.fill('#email', 'arnab.sheoran@gmail.com');
await page.fill('#password', 'Change@123@12344567778888');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('CURRENT_URL', page.url());
console.log('PAGE_TEXT', await page.locator('body').innerText());
await browser.close();
