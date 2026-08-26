import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';
const artifacts = 'artifacts/browser';

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function expectNoPageErrors(page, action) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await action();
  expect(errors, `browser page errors: ${errors.join(' | ')}`).toEqual([]);
}

test('landing page is readable and stable on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('clear pathway');
    await expect(page.getByRole('link', { name: 'Start Learning Free' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/landing-desktop.png`, fullPage: true });
  });
});

test('landing page has no mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/landing-mobile.png`, fullPage: true });
  });
});

test('learner dashboard fixture renders Grade 11 programme on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/dashboard.html?fixture=1&grade=11`, { waitUntil: 'domcontentloaded' });
    await page.locator('#course-grid article').first().waitFor();
    await expect(page.locator('#grade-badge')).toContainText('Grade 11');
    await expect(page.locator('#course-grid article')).toHaveCount(3);
    await expect(page.getByRole('link', { name: /Continue lesson|Open My Courses/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/dashboard-desktop.png`, fullPage: true });
  });
});

test('learner dashboard fixture remains usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/dashboard.html?fixture=1&grade=12`, { waitUntil: 'domcontentloaded' });
    await page.locator('#course-grid article').first().waitFor();
    await expect(page.locator('#grade-badge')).toContainText('Grade 12');
    await expect(page.locator('#course-grid article')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/dashboard-mobile.png`, fullPage: true });
  });
});

test('course library fixture shows only the selected learner grade', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/library.html?fixture=1&grade=10`, { waitUntil: 'domcontentloaded' });
    await page.locator('#units article').first().waitFor();
    await expect(page.locator('#scope-badge')).toContainText('Grade 10');
    await expect(page.locator('#grade')).toBeDisabled();
    await expect(page.locator('#units article')).toHaveCount(18);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/library-desktop.png`, fullPage: true });
  });
});

test('verified challenges shell is readable on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/challenges.html?fixture=1`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Verified CAPS Challenges');
    await expect(page.getByRole('button', { name: 'Send verified challenge' })).toBeVisible();
    await expect(page.getByText('Server-verified competition')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/challenges-desktop.png`, fullPage: true });
  });
});

test('verified challenges shell has no mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoPageErrors(page, async () => {
    await page.goto(`${BASE}/challenges.html?fixture=1`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send verified challenge' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${artifacts}/challenges-mobile.png`, fullPage: true });
  });
});
