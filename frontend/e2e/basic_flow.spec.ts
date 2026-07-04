import { test, expect } from '@playwright/test';

test('basic workflow: create, edit, and check preview', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Change language to English using the UI to ensure consistent labels
  const langSelect = page.locator('.MuiSelect-select').last();
  await langSelect.click();
  await page.getByRole('option', { name: 'EN' }).click();

  // Check title
  await expect(page).toHaveTitle(/mmdGenerator/);

  // Wait for the app to render and ensure it's in English
  await expect(page.locator('header')).toContainText('Projects', { timeout: 20000 });

  // Default content should be present
  const content = page.locator('.cm-content');
  await expect(content).toBeVisible({ timeout: 20000 });
  await expect(content).toContainText('graph');

  // Change title
  const renameBtn = page.locator('button[aria-label="Rename"]');
  await expect(renameBtn.first()).toBeVisible();
  await renameBtn.first().click();

  const titleInput = page.locator('input[maxlength="255"]');
  await expect(titleInput).toBeVisible();
  await titleInput.fill('My New Diagram');
  await page.keyboard.press('Enter');

  await expect(page.locator('header')).toContainText('My New Diagram');

  // Check if diagram is rendered
  const svg = page.locator('#mermaid-container svg');
  await expect(svg).toBeVisible({ timeout: 20000 });

  // Open drawer
  await page.getByLabel('menu').click();
  // Using getByRole for more precision
  await expect(page.getByRole('button', { name: 'New diagram' })).toBeVisible();
});
