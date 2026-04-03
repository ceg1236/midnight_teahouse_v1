import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Midnight Teahouse' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /an enchanted world/i })).toBeVisible()
  })

  test('Reserve Your Seat CTA is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Reserve Your Seat/i })).toBeVisible()
  })

  test('Our story hero link goes to story page', async ({ page }) => {
    await page.goto('/')
    await page.locator('#top a[href="/our-story"]').click()
    await expect(page).toHaveURL(/\/our-story/)
  })
})
