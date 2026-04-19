import { test, expect } from '@playwright/test';

test('smoke - page loads and form renders', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('http://localhost:3000');

  // Banner always visible
  await expect(page.locator('text=Devis illimités gratuits')).toBeVisible();

  // Artisan form visible (tab 1 = default)
  await expect(page.locator('input[placeholder="123 456 789 00012"]')).toBeVisible();

  // Navigate to prestations tab
  await page.click('button:has-text("Prestations")');

  // Add a line item
  await page.click('button:has-text("Ajouter")');

  // Verify line item inputs appeared
  await expect(page.locator('input[step="0.01"]').first()).toBeVisible();

  // Generate PDF button visible
  const pdfBtn = page.locator('button').filter({ hasText: /PDF|Générer|Télécharger/i }).first();
  await expect(pdfBtn).toBeVisible();

  // No console errors
  expect(consoleErrors, 'Console errors: ' + consoleErrors.join(', ')).toHaveLength(0);
});

test('smoke - mobile viewport 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000');

  // Banner visible on mobile
  await expect(page.locator('text=Devis illimités')).toBeVisible();

  // Artisan form visible on mobile
  await expect(page.locator('input[placeholder="123 456 789 00012"]')).toBeVisible();
});

test('smoke - BUG-004 onFocus select prix input', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Navigate to Prestations tab and add a line item
  await page.click('button:has-text("Prestations")');
  await page.click('button:has-text("Ajouter")');

  // Find prix_unitaire_ht input (type=number, step=0.01)
  const prixInput = page.locator('input[step="0.01"]').first();
  await expect(prixInput).toBeVisible();

  // onFocus select() should select existing content
  // Typing should replace it, not prepend 0
  await prixInput.focus();
  await page.keyboard.type('150');
  const val = await prixInput.inputValue();
  expect(parseFloat(val), 'BUG-004: price should be 150, not 0150').toBe(150);
});
