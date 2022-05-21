import { expect, test } from "@playwright/test"

test("Home page should load", async ({ page }) => {
  await page.goto("/")
  expect(await page.textContent("h1")).toBe("Proselog")
})
