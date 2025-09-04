const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Get all HTML template files
const templatesDir = path.join(__dirname, '..', 'templates');
const templateFiles = fs.readdirSync(templatesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => path.join(templatesDir, file));

test.describe('Link Validation', () => {
  
  test('all external links should return valid responses (no 404s)', async ({ page }) => {
    const allLinks = new Map(); // Use Map to track unique links and their sources
    const brokenLinks = [];
    const linkResults = [];
    
    console.log('\\n=== Collecting Links from All Templates ===');
    
    // First pass: collect all links from all templates
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Get all links in the template
        const links = await page.locator('a[href]').all();
        
        for (const link of links) {
          const href = await link.getAttribute('href');
          const linkText = (await link.textContent() || '').trim();
          
          if (href && href.startsWith('http')) {
            // Skip placeholder/template links that aren't meant to be tested
            if (href.includes('{{') || href.includes('%') || href === '#') {
              continue;
            }
            
            // Skip facebook.com links as they may block automated requests
            if (href.includes('facebook.com')) {
              continue;
            }
            
            if (!allLinks.has(href)) {
              allLinks.set(href, []);
            }
            allLinks.get(href).push({
              template: templateName,
              text: linkText || '[no text]',
              href: href
            });
          }
        }
        
      } catch (error) {
        console.log(`❌ Error processing ${templateName}: ${error.message}`);
      }
    }
    
    console.log(`Found ${allLinks.size} unique external links across ${templateFiles.length} templates`);
    
    // Second pass: validate each unique link
    console.log('\\n=== Validating Links ===');
    
    for (const [url, sources] of allLinks.entries()) {
      try {
        console.log(`Checking: ${url}`);
        
        // Create a new page context for each request to avoid issues
        const response = await page.request.get(url, {
          timeout: 10000, // 10 second timeout
          ignoreHTTPSErrors: true // Ignore SSL certificate errors for testing
        });
        
        const status = response.status();
        const isWorking = status >= 200 && status < 400; // 2xx and 3xx are considered working
        
        linkResults.push({
          url: url,
          status: status,
          isWorking: isWorking,
          sources: sources
        });
        
        if (isWorking) {
          console.log(`  ✅ ${status} - Working`);
        } else {
          console.log(`  ❌ ${status} - Broken`);
          brokenLinks.push({
            url: url,
            status: status,
            sources: sources
          });
        }
        
      } catch (error) {
        console.log(`  ❌ ERROR - ${error.message}`);
        brokenLinks.push({
          url: url,
          status: 'ERROR',
          error: error.message,
          sources: sources
        });
        
        linkResults.push({
          url: url,
          status: 'ERROR',
          isWorking: false,
          error: error.message,
          sources: sources
        });
      }
    }
    
    // Report results
    console.log('\\n=== Link Validation Results ===');
    console.log(`Total unique links tested: ${allLinks.size}`);
    console.log(`Working links: ${linkResults.filter(r => r.isWorking).length}`);
    console.log(`Broken links: ${brokenLinks.length}`);
    
    if (brokenLinks.length > 0) {
      console.log('\\n❌ Broken Links Found:');
      for (const brokenLink of brokenLinks) {
        console.log(`\\n🔗 ${brokenLink.url}`);
        console.log(`   Status: ${brokenLink.status}`);
        if (brokenLink.error) {
          console.log(`   Error: ${brokenLink.error}`);
        }
        console.log(`   Found in templates:`);
        for (const source of brokenLink.sources) {
          console.log(`     - ${source.template}: "${source.text}"`);
        }
      }
    }
    
    // Assert that no links are broken
    expect(brokenLinks.length, 
      `Found ${brokenLinks.length} broken links. See console output for details.`
    ).toBe(0);
    
    console.log('\\n✅ All external links are working!');
  });
  
  // Test for specific template links
  for (const templateFile of templateFiles) {
    const templateName = path.basename(templateFile);
    
    test(`${templateName} should have no broken links`, async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Get all HTTP/HTTPS links
      const links = await page.locator('a[href^="http"]').all();
      const templateBrokenLinks = [];
      
      for (const link of links) {
        const href = await link.getAttribute('href');
        const linkText = (await link.textContent() || '').trim();
        
        // Skip template/placeholder URLs and non-HTTP links
        if (href.includes('{{') || href.includes('%') || href === '#' || 
            !href.startsWith('http') || href.includes('facebook.com')) {
          continue;
        }
        
        try {
          const response = await page.request.get(href, {
            timeout: 8000,
            ignoreHTTPSErrors: true
          });
          
          const status = response.status();
          
          if (status >= 400) {
            templateBrokenLinks.push({
              href: href,
              text: linkText,
              status: status
            });
          }
          
        } catch (error) {
          templateBrokenLinks.push({
            href: href,
            text: linkText,
            error: error.message
          });
        }
      }
      
      if (templateBrokenLinks.length > 0) {
        console.log(`\\n❌ Broken links in ${templateName}:`);
        for (const brokenLink of templateBrokenLinks) {
          console.log(`  - ${brokenLink.href} (${brokenLink.text}): ${brokenLink.status || brokenLink.error}`);
        }
      }
      
      expect(templateBrokenLinks.length, 
        `${templateName} has ${templateBrokenLinks.length} broken links`
      ).toBe(0);
    });
  }
  
  // Test for common link patterns
  test('should validate StoryBud domain links', async ({ page }) => {
    const storybudLinks = new Set();
    
    // Collect all StoryBud domain links
    for (const templateFile of templateFiles) {
      await page.goto(`file://${templateFile}`);
      
      const links = await page.locator('a[href*="storybud.com"]').all();
      
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && !href.includes('{{') && !href.includes('%') && href.startsWith('http')) {
          storybudLinks.add(href);
        }
      }
    }
    
    console.log(`\\nFound ${storybudLinks.size} unique StoryBud domain links`);
    
    const brokenStorybudLinks = [];
    
    for (const url of storybudLinks) {
      try {
        const response = await page.request.get(url, {
          timeout: 10000,
          ignoreHTTPSErrors: true
        });
        
        const status = response.status();
        
        if (status >= 400) {
          brokenStorybudLinks.push({ url, status });
          console.log(`❌ ${url}: ${status}`);
        } else {
          console.log(`✅ ${url}: ${status}`);
        }
        
      } catch (error) {
        brokenStorybudLinks.push({ url, error: error.message });
        console.log(`❌ ${url}: ${error.message}`);
      }
    }
    
    expect(brokenStorybudLinks.length, 
      `Found ${brokenStorybudLinks.length} broken StoryBud links`
    ).toBe(0);
  });
  
});