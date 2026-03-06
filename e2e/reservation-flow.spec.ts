import { test, expect } from '@playwright/test'

test.describe('reservation flow', () => {
  test('can open reservation and select date', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Reserve Your Seat/i }).click()

    await expect(page.getByRole('heading', { name: 'Reservation', exact: true })).toBeVisible({ timeout: 5000 })

    // Click Select on first date (desktop has button; mobile has clickable card)
    await page.getByRole('button', { name: 'Select' }).first().click()
    await expect(page.getByText(/Choose Your Ticket|2\. Choose Your Ticket/i)).toBeVisible({ timeout: 3000 })
  })

  test('can select ticket and reach form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Reserve Your Seat/i }).click()
    await page.getByRole('button', { name: 'Select' }).first().click()

    // Click Select on Community tier (4th Select = first ticket tier after 3 date Selects)
    await page.getByRole('button', { name: 'Select' }).nth(3).click()

    // Click Continue
    await page.getByRole('button', { name: /Continue/i }).click()

    await expect(page.getByText(/Complete Your Reservation|3\. Complete/i)).toBeVisible({ timeout: 3000 })
    await expect(page.getByPlaceholder(/Your name/i).or(page.getByLabel(/name/i))).toBeVisible({ timeout: 2000 })
  })
})
