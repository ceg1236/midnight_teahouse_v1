import { config } from 'dotenv'
config({ path: '.env.local' })

import { test, expect } from '@playwright/test'

/**
 * E2E test for door link flow.
 * Requires ADMIN_PASSWORD and ADMIN_LINK_SECRET in .env.local.
 * Verifies that a door link lands on step 3 (Complete Your Reservation)
 * with date auto-selected and Community tier pre-filled.
 */
test.describe('door link', () => {
  test('door link lands on step 3 with date and Community pre-selected', async ({ page, request }) => {
    const password = process.env.ADMIN_PASSWORD
    const hasSecret = !!process.env.ADMIN_LINK_SECRET && process.env.ADMIN_LINK_SECRET.length >= 16

    test.skip(!password || !hasSecret, 'ADMIN_PASSWORD and ADMIN_LINK_SECRET required for door link e2e')

    const res = await request.post('/api/admin/generate-link', {
      data: { password, door: true },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.ok(), `generate-link failed: ${await res.text()}`).toBe(true)
    const { url } = await res.json()
    expect(url).toContain('/invite?ticket=')

    await page.goto(url)

    await expect(page.getByRole('heading', { name: 'Reservation', exact: true })).toBeVisible({ timeout: 5000 })

    const step3Heading = page.getByRole('heading', { name: /3\. Complete Your Reservation/i })
    await expect(step3Heading).toBeVisible({ timeout: 3000 })

    const step3Section = page.getByRole('heading', { name: /3\. Complete Your Reservation/i }).locator('..')
    const summary = step3Section.locator('.rounded-lg').filter({ hasText: 'Date' }).filter({ hasText: 'Tickets' }).first()
    await expect(summary).toBeVisible()
    await expect(summary).toContainText(/March 1[89]|March 2[0]/)
    await expect(summary).toContainText('Community')
  })
})
