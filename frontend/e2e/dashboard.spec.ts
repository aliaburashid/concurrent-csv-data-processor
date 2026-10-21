import { expect, test } from '@playwright/test';
import path from 'node:path';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('real data, employee interactions, export, and responsive layout', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByText('2,271,430.00', { exact: true })).toBeVisible();
  await expect(page.getByText('236,430.00', { exact: true })).toBeVisible();
  await expect(page.getByText('21 employees received raises')).toBeVisible();
  await expect(page.getByText('9 salaries unchanged')).toBeVisible();
  await expect(page.getByText('11%', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Search employees by name or ID').fill('Alice');
  await expect(page.getByRole('button', { name: 'A Alice EMP-001' })).toBeVisible();
  await page.getByRole('button', { name: "Compare Alice's salaries" }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('+7,800.00', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Search employees by name or ID').fill('no such employee');
  await expect(page.getByText('No matching employees')).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('button', { name: 'View all employees' }).click();
  await expect(
    page.getByRole('heading', { name: 'Employee compensation', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Filter by role', { exact: true }).selectOption('Director');
  await expect(page.locator('tbody tr')).toHaveCount(9);
  await page.getByLabel('Filter by raise or eligibility status').selectOption('unchanged');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('button', { name: 'Updated salary' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export filtered results' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('compensation-results.csv');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/#overview');
  await expect(page.getByText('2,271,430.00', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('overview.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('narrow phones, tablets, and wide screens keep all pages contained', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Viewport matrix runs once in desktop Chrome.');
  for (const width of [320, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const route of ['overview', 'employees', 'analysis', 'simulator', 'workflow', 'about']) {
      await page.goto(`/#${route}`);
      await expect(page.locator('.loading-state')).toHaveCount(0);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}px`,
      ).toBe(true);
    }
    await page.goto('/#overview');
    await page.getByLabel('Currency display').selectOption('BHD');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `BHD at ${width}px`,
    ).toBe(true);
    if (width === 768)
      await page.screenshot({ path: testInfo.outputPath('tablet.png'), fullPage: true });
  }
});

test('CSV import is atomic, invalid input is explained, and source can be cleared', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('2,271,430.00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Import data' }).click();
  await page
    .getByLabel('Original employees', { exact: true })
    .setInputFiles(path.resolve('src/data/employees.csv'));
  await page.getByLabel('Processed salaries', { exact: true }).setInputFiles({
    name: 'bad.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('wrong,header\n1,2'),
  });
  await page.getByRole('button', { name: 'Import & explore' }).click();
  await expect(page.getByRole('alert')).toContainText('required columns');
  await expect(page.getByText('2,271,430.00', { exact: true })).toBeVisible();
  await page
    .getByLabel('Processed salaries', { exact: true })
    .setInputFiles(path.resolve('src/data/updated_employees.csv'));
  await page.getByRole('button', { name: 'Import & explore' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Imported CSV pair', { exact: true })).toBeVisible();
  await page.getByLabel('Currency display').selectOption('BHD');
  await expect(
    page.getByText('BHD is a display label you selected.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Import data' }).click();
  await page.getByRole('button', { name: 'Clear data', exact: true }).click();
  await expect(page.getByText('No employee data yet')).toBeVisible();
  await page.getByRole('button', { name: 'Load snapshot', exact: true }).click();
  await expect(page.getByText('Project CSV snapshot', { exact: true })).toBeVisible();
});

test('simulator thresholds, workflow illustration, and all routes', async ({ page }, testInfo) => {
  await page.goto('/#simulator');
  await expect(page.getByRole('heading', { name: 'Salary simulator', exact: true })).toBeVisible();
  await page.getByLabel('Calculation date').fill('2026-10-20');
  await page.getByLabel('Joining date', { exact: true }).fill('2023-10-20');
  await expect(page.getByTestId('simulated-salary')).toHaveText('54,000.00');
  await page.getByRole('button', { name: 'Try 81%' }).click();
  await expect(page.getByTestId('simulated-salary')).toHaveText('56,000.00');
  await page.getByLabel('Project completion', { exact: true }).fill('59');
  await expect(page.getByTestId('simulated-salary')).toHaveText('50,000.00');
  await page.getByLabel('Joining date', { exact: true }).fill('2027-01-01');
  await expect(page.getByRole('alert')).toContainText('after the calculation date');
  for (const route of ['analysis', 'workflow', 'about']) {
    await page.goto(`/#${route}`);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`${route}.png`), fullPage: true });
  }
  await page.goto('/#workflow');
  await page.getByRole('button', { name: 'Play illustration' }).click();
  await expect(page.getByRole('button', { name: 'Pause illustration' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause illustration' }).click();
  await page.getByRole('button', { name: 'Reset illustration' }).click();
  await expect(page.getByText('STEP 01 / 11')).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('link', { name: 'Salary simulator' }).click();
    await expect(page).toHaveURL(/#simulator$/);
    await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  }
});
