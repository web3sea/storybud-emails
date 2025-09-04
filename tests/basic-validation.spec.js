const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Get all HTML template files
const templatesDir = path.join(__dirname, '..', 'templates');
const templateFiles = fs.readdirSync(templatesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => path.join(templatesDir, file));

test.describe('Email Template Basic Validation', () => {
  
  // Core test: All templates should have StoryBud logos
  test('all templates should have at least one StoryBud logo', async ({ page }) => {
    const results = [];
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Look for StoryBud logo images
        const logoImages = await page.locator('img[alt*="StoryBud"]').count();
        
        results.push({
          template: templateName,
          logoCount: logoImages,
          hasLogo: logoImages > 0
        });
        
      } catch (error) {
        results.push({
          template: templateName,
          error: error.message,
          hasLogo: false
        });
      }
    }
    
    // Log results
    console.log('\\n=== Logo Validation Results ===');
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.template}: ERROR - ${result.error}`);
      } else if (!result.hasLogo) {
        console.log(`❌ ${result.template}: No logos found`);
      } else {
        console.log(`✅ ${result.template}: ${result.logoCount} logo(s) found`);
      }
    });
    
    // Check that all templates have logos
    const templatesWithoutLogos = results.filter(r => !r.hasLogo);
    expect(templatesWithoutLogos, 
      `Templates missing logos: ${templatesWithoutLogos.map(t => t.template).join(', ')}`
    ).toEqual([]);
    
    // Summary
    const totalTemplates = results.length;
    const templatesWithLogos = results.filter(r => r.hasLogo).length;
    console.log(`\\n✅ Logo validation passed: ${templatesWithLogos}/${totalTemplates} templates have StoryBud logos`);
  });
  
  // Validate HTML structure
  test('all templates should have valid HTML structure', async ({ page }) => {
    let invalidTemplates = [];
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Check for DOCTYPE
        const doctype = await page.evaluate(() => {
          return document.doctype ? document.doctype.name : null;
        });
        
        if (doctype !== 'html') {
          invalidTemplates.push(`${templateName}: Missing or invalid DOCTYPE`);
        }
        
        // Check for charset meta tag
        const charsetMeta = await page.locator('meta[charset]').count();
        if (charsetMeta === 0) {
          invalidTemplates.push(`${templateName}: Missing charset meta tag`);
        }
        
      } catch (error) {
        invalidTemplates.push(`${templateName}: ${error.message}`);
      }
    }
    
    expect(invalidTemplates, 
      `Templates with HTML issues: ${invalidTemplates.join('; ')}`
    ).toEqual([]);
    
    console.log(`✅ HTML validation passed for all ${templateFiles.length} templates`);
  });
  
  // Check for required branding elements
  test('all templates should have unsubscribe links', async ({ page }) => {
    let templatesWithoutUnsubscribe = [];
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Look for unsubscribe links
        const unsubscribeLinks = await page.locator('a').filter({ hasText: /unsubscribe/i }).count();
        
        if (unsubscribeLinks === 0) {
          templatesWithoutUnsubscribe.push(templateName);
        }
        
      } catch (error) {
        templatesWithoutUnsubscribe.push(`${templateName} (ERROR: ${error.message})`);
      }
    }
    
    expect(templatesWithoutUnsubscribe, 
      `Templates missing unsubscribe links: ${templatesWithoutUnsubscribe.join(', ')}`
    ).toEqual([]);
    
    console.log(`✅ Unsubscribe link validation passed for all ${templateFiles.length} templates`);
  });
  
});