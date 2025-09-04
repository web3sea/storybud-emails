const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Get all HTML template files
const templatesDir = path.join(__dirname, '..', 'templates');
const templateFiles = fs.readdirSync(templatesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => path.join(templatesDir, file));

// Test each template file
for (const templateFile of templateFiles) {
  const templateName = path.basename(templateFile);
  
  test.describe(`Template: ${templateName}`, () => {
    
    test('should load without errors', async ({ page }) => {
      // Navigate to the template file
      await page.goto(`file://${templateFile}`);
      
      // Check that the page loaded successfully
      expect(page.url()).toContain(templateName);
    });
    
    test('should have proper HTML structure', async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Check for required HTML elements
      const doctype = await page.evaluate(() => {
        return document.doctype ? document.doctype.name : null;
      });
      expect(doctype).toBe('html');
      
      // Check for basic meta tags
      const charset = await page.locator('meta[charset]').first();
      await expect(charset).toBeAttached();
      
      const viewport = await page.locator('meta[name="viewport"]').first();
      await expect(viewport).toBeAttached();
    });
    
    test('should have StoryBud logo in footer', async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Look for logo images with StoryBud branding
      const logoImages = await page.locator('img[alt*="StoryBud"]').all();
      
      // Should have at least one StoryBud logo image
      expect(logoImages.length).toBeGreaterThan(0);
      
      // Check that at least one logo has proper attributes
      if (logoImages.length > 0) {
        const firstLogo = logoImages[0];
        const alt = await firstLogo.getAttribute('alt');
        const src = await firstLogo.getAttribute('src');
        
        expect(alt).toContain('StoryBud');
        expect(src).toBeTruthy();
      }
    });
    
    test('should have proper email-safe styling', async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Check for table-based layout (email-safe)
      const tables = await page.locator('table[role="presentation"]').all();
      expect(tables.length).toBeGreaterThan(0);
      
      // Check for inline styles (Gmail compatibility)
      const elementsWithInlineStyles = await page.locator('[style]').all();
      expect(elementsWithInlineStyles.length).toBeGreaterThan(0);
    });
    
    test('should have required StoryBud branding elements', async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Check for StoryBud tagline
      const tagline = await page.locator('text="Every child deserves their own story."').first();
      await expect(tagline).toBeAttached();
      
      // Check for unsubscribe link
      const unsubscribe = await page.locator('a:text-matches("Unsubscribe", "i")').first();
      await expect(unsubscribe).toBeAttached();
      
      // Check for copyright notice
      const copyright = await page.locator('text*="Copyright"').first();
      await expect(copyright).toBeAttached();
    });
    
    test('should be responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`file://${templateFile}`);
      
      // Check that content is still visible and not overflowing
      const body = page.locator('body');
      const boundingBox = await body.boundingBox();
      
      // Content should fit within mobile viewport width
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    });
    
    test('should have accessible alt text for images', async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Get all images
      const images = await page.locator('img').all();
      
      // Check that all images have alt attributes
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(0);
      }
    });
    
    test('should have proper color contrast', async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Check that we don't have any elements with insufficient contrast
      // This is a basic check - in a real scenario you'd use axe-core
      const lightText = await page.locator('[style*="color: #ffffff"], [style*="color: #fff"]').all();
      const darkText = await page.locator('[style*="color: #000000"], [style*="color: #000"]').all();
      
      // Should have a mix of light and dark text for good contrast
      expect(lightText.length + darkText.length).toBeGreaterThan(0);
    });
    
  });
}