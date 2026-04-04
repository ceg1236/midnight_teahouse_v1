import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Midnight Teahouse' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /an enchanted world/i })).toBeVisible()
  })

  test('Reserve Your Seat CTA scrolls to gatherings', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /Reserve Your Seat/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', '#gatherings')
  })

  test('Read the full story links to story page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Read the full story/i }).click()
    await expect(page).toHaveURL(/\/our-story/)
  })
})
