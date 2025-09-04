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

  // Basic link validation - check that critical StoryBud links are accessible
  test('critical StoryBud links should be accessible', async ({ page }) => {
    const criticalLinks = [
      'https://storybud.com',
      'https://storybud.com/contact',
      'https://storybud.com/privacy-policy',
      'https://storybud.com/terms-of-service'
    ];
    
    const brokenCriticalLinks = [];
    
    console.log('\\n=== Testing Critical Links ===');
    
    for (const url of criticalLinks) {
      try {
        console.log(`Checking: ${url}`);
        
        const response = await page.request.get(url, {
          timeout: 15000, // 15 second timeout for critical links
          ignoreHTTPSErrors: true
        });
        
        const status = response.status();
        const isWorking = status >= 200 && status < 400;
        
        if (isWorking) {
          console.log(`  ✅ ${status} - Working`);
        } else {
          console.log(`  ❌ ${status} - Broken`);
          brokenCriticalLinks.push({ url, status });
        }
        
      } catch (error) {
        console.log(`  ❌ ERROR - ${error.message}`);
        brokenCriticalLinks.push({ url, error: error.message });
      }
    }
    
    if (brokenCriticalLinks.length > 0) {
      console.log('\\n❌ Broken Critical Links:');
      for (const link of brokenCriticalLinks) {
        console.log(`  - ${link.url}: ${link.status || link.error}`);
      }
    }
    
    expect(brokenCriticalLinks.length, 
      `Found ${brokenCriticalLinks.length} broken critical links`
    ).toBe(0);
    
    console.log('\\n✅ All critical links are working!');
  });

  // Gmail compatibility - no div elements allowed
  test('all templates should use table-based layout (no divs for Gmail compatibility)', async ({ page }) => {
    const templatesWithDivs = [];
    
    console.log('\\n=== Gmail Compatibility Check (DIV Detection) ===');
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Check for div elements
        const divCount = await page.locator('div').count();
        
        if (divCount > 0) {
          templatesWithDivs.push({
            template: templateName,
            divCount: divCount
          });
          console.log(`❌ ${templateName}: Contains ${divCount} div element(s)`);
        } else {
          console.log(`✅ ${templateName}: Table-based layout (Gmail compatible)`);
        }
        
      } catch (error) {
        templatesWithDivs.push({
          template: templateName,
          error: error.message
        });
        console.log(`❌ ${templateName}: Error - ${error.message}`);
      }
    }
    
    if (templatesWithDivs.length > 0) {
      console.log('\\n❌ Gmail Compatibility Issues Found:');
      console.log('   📋 Gmail strips styling from <div> elements');
      console.log('   📋 Use <table role="presentation"> instead of <div>');
      console.log('   📋 Replace <div> containers with <td> elements');
      
      for (const issue of templatesWithDivs) {
        if (issue.error) {
          console.log(`   • ${issue.template}: ${issue.error}`);
        } else {
          console.log(`   • ${issue.template}: ${issue.divCount} div element(s) found`);
        }
      }
    }
    
    // Note: This is informational - we don't fail CI for div elements yet
    // Run `npm run test:gmail` for detailed Gmail compatibility analysis
    if (templatesWithDivs.length === 0) {
      console.log('\\n✅ All templates use Gmail-compatible table-based layouts!');
    } else {
      console.log(`\\n⚠️  Gmail Compatibility Notice: ${templatesWithDivs.length}/${templateFiles.length} templates contain div elements`);
      console.log('   💡 Run "npm run test:gmail" for detailed analysis and recommendations');
      console.log('   📋 Gmail strips styling from <div> elements - consider using table-based layouts');
    }
  });
  
});