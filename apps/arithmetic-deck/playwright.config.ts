import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  snapshotPathTemplate: "{testDir}/screenshots/{arg}-{projectName}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      threshold: 0,
    },
  },
  use: {
    baseURL: "http://localhost:9003",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Desktop Landscape",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    {
      name: "Mobile Landscape",
      use: { ...devices["Desktop Chrome"], viewport: { width: 844, height: 390 } },
    },
    {
      name: "Tablet Landscape",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 600 } },
    },
    {
      name: "Mobile Portrait",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:9003",
    reuseExistingServer: true,
  },
});
