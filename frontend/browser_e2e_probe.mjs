import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const unique = Date.now();
const userEmail = `ui.regression.${unique}@example.com`;
const userPass = 'MyFrontendTestPass123';

page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
page.on('response', async (res) => {
  if (res.url().includes('/api/auth/login') || res.url().includes('/api/auth/register') || res.url().includes('/api/employees') || res.url().includes('/api/attendance/')) {
    console.log('HTTP', res.status(), res.url());
    try { console.log(await res.text()); } catch {}
  }
});

await page.goto('http://localhost:5174/login');
await page.fill('#email', 'arnab.sheoran@gmail.com');
await page.fill('#password', 'Change@123@12344567778888');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin');
console.log('ADMIN_LOGIN_URL', page.url());
await page.fill('input[placeholder="First name"]', 'UI');
await page.fill('input[placeholder="Last name"]', 'User');
await page.fill('input[type="email"]', userEmail);
await page.fill('input[placeholder="Department"]', 'Engineering');
await page.fill('input[placeholder="Job title"]', 'Frontend QA');
await page.fill('input[type="number"]', '55000');
await page.click('button:has-text("Create")');
await page.waitForTimeout(2000);
console.log('EMPLOYEE_CREATE_RESULT', await page.locator('body').innerText());
await page.click('button:has-text("Logout")');
await page.waitForURL('**/login');
await page.goto('http://localhost:5174/register');
await page.fill('#name', 'UI Regression User');
await page.fill('#email', userEmail);
await page.fill('#password', userPass);
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);
console.log('REGISTER_RESULT', await page.locator('body').innerText());
await page.goto('http://localhost:5174/login');
await page.fill('#email', userEmail);
await page.fill('#password', userPass);
await page.click('button[type="submit"]');
await page.waitForURL('**/employee');
console.log('USER_LOGIN_URL', page.url());
await page.waitForTimeout(2000);
console.log('EMPLOYEE_DASHBOARD_TEXT', await page.locator('body').innerText());
await page.click('button:has-text("Check In")');
await page.waitForTimeout(2000);
console.log('AFTER_CHECKIN_TEXT', await page.locator('body').innerText());
await page.click('button:has-text("Check Out")');
await page.waitForTimeout(2000);
console.log('AFTER_CHECKOUT_TEXT', await page.locator('body').innerText());
await browser.close();
