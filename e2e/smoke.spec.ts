import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Midnight Teahouse')
  })

  test('Reserve Your Seat button is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Reserve Your Seat/i })).toBeVisible()
  })

  test('Our Story link works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Our Story/i }).first().click()
    await expect(page).toHaveURL(/\/our-story/)
  })
})
