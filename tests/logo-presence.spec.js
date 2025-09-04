const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Get all HTML template files
const templatesDir = path.join(__dirname, '..', 'templates');
const templateFiles = fs.readdirSync(templatesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => path.join(templatesDir, file));

test.describe('Logo Presence Validation', () => {
  
  // Test that ensures ALL templates have proper StoryBud logos
  test('all templates should have StoryBud logo images in footer', async ({ page }) => {
    const templatesWithoutLogos = [];
    const templateResults = {};
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Look for StoryBud logo images
        const logoImages = await page.locator('img[alt*="StoryBud"]').all();
        const logoImagesWithSrc = [];
        
        for (const img of logoImages) {
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          if (src && alt && alt.includes('StoryBud')) {
            logoImagesWithSrc.push({ src, alt });
          }
        }
        
        templateResults[templateName] = {
          logoCount: logoImagesWithSrc.length,
          logos: logoImagesWithSrc
        };
        
        if (logoImagesWithSrc.length === 0) {
          templatesWithoutLogos.push(templateName);
        }
        
      } catch (error) {
        templatesWithoutLogos.push(`${templateName} (ERROR: ${error.message})`);
        templateResults[templateName] = { error: error.message };
      }
    }
    
    // Log results for debugging
    console.log('Logo audit results:');
    for (const [template, result] of Object.entries(templateResults)) {
      if (result.error) {
        console.log(`❌ ${template}: ERROR - ${result.error}`);
      } else if (result.logoCount === 0) {
        console.log(`❌ ${template}: No logos found`);
      } else {
        console.log(`✅ ${template}: ${result.logoCount} logo(s) found`);
      }
    }
    
    // Assert that no templates are missing logos
    expect(templatesWithoutLogos).toEqual([]);
  });
  
  // Test specific logo requirements
  for (const templateFile of templateFiles) {
    const templateName = path.basename(templateFile);
    
    test(`${templateName} should have properly configured logo`, async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Find StoryBud logo images
      const logoImages = await page.locator('img[alt*="StoryBud"]').all();
      expect(logoImages.length, `${templateName} should have at least one StoryBud logo`).toBeGreaterThan(0);
      
      // Check first logo for proper attributes
      const firstLogo = logoImages[0];
      
      // Check alt text
      const alt = await firstLogo.getAttribute('alt');
      expect(alt).toContain('StoryBud');
      expect(alt.length).toBeGreaterThan(5); // Should be descriptive
      
      // Check src attribute
      const src = await firstLogo.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toMatch(/\.(png|jpg|jpeg|svg)$/i); // Should be an image file
      
      // Check width and height attributes for email compatibility
      const width = await firstLogo.getAttribute('width');
      const height = await firstLogo.getAttribute('height');
      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
      
      // Check for email-safe styling
      const style = await firstLogo.getAttribute('style');
      expect(style).toContain('display: block'); // Email-safe display
      expect(style).toContain('border: 0'); // Remove default borders
    });
  }
  
  // Test for brand consistency
  test('all logos should follow brand guidelines', async ({ page }) => {
    const logoAttributes = [];
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      await page.goto(`file://${templateFile}`);
      
      const logoImages = await page.locator('img[alt*="StoryBud"]').all();
      
      for (const img of logoImages) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        const width = await img.getAttribute('width');
        const height = await img.getAttribute('height');
        
        logoAttributes.push({
          template: templateName,
          alt,
          src,
          width: parseInt(width) || 0,
          height: parseInt(height) || 0
        });
      }
    }
    
    // Check for consistency in logo sizing
    const logoSizes = logoAttributes.map(logo => ({ width: logo.width, height: logo.height }));
    const uniqueSizes = [...new Set(logoSizes.map(size => `${size.width}x${size.height}`))];
    
    // Should have consistent logo sizing across templates
    expect(uniqueSizes.length).toBeLessThanOrEqual(3); // Allow for some variation but not too much
    
    // Check for consistent alt text patterns
    const altTexts = logoAttributes.map(logo => logo.alt);
    const hasConsistentBranding = altTexts.every(alt => 
      alt && alt.includes('StoryBud') && alt.length > 10
    );
    expect(hasConsistentBranding).toBe(true);
    
    console.log(`Found ${logoAttributes.length} logos across ${templateFiles.length} templates`);
    console.log(`Logo size variations: ${uniqueSizes.join(', ')}`);
  });
  
});