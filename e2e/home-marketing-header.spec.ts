import { test, expect } from '@playwright/test'

test.describe('marketing home header', () => {
  test('desktop: brand and inline nav are visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Midnight Teahouse' }).first()).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Desktop' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Desktop' }).getByRole('link', { name: 'Gatherings' })).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Desktop' }).getByRole('link', { name: /Private events/i })
    ).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Desktop' }).getByRole('link', { name: /Our Story/i })).toBeVisible()

    await expect(page.getByRole('button', { name: /Open menu/i })).toBeHidden()
  })

  test('mobile: hamburger and fixed bar; menu opens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const header = page.locator('header.home-site-header')
    await expect(header).toBeVisible()

    const position = await header.evaluate((el) => getComputedStyle(el).position)
    expect(position).toBe('fixed')

    const openBtn = page.getByRole('button', { name: /Open menu/i })
    await expect(openBtn).toBeVisible()

    await openBtn.click()
    await expect(page.getByRole('dialog', { name: 'Site sections' })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Site sections' }).getByRole('link', { name: 'Gatherings' })).toBeVisible()
  })
})
