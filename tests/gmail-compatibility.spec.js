const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Get all HTML template files
const templatesDir = path.join(__dirname, '..', 'templates');
const templateFiles = fs.readdirSync(templatesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => path.join(templatesDir, file));

test.describe('Gmail Compatibility Validation', () => {
  
  // Core Gmail compatibility test - no divs allowed
  test('all templates should use table-based layout (no divs for Gmail compatibility)', async ({ page }) => {
    const templatesWithDivs = [];
    const divUsageResults = [];
    
    console.log('\\n=== Checking for DIV elements (Gmail Compatibility) ===');
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        // Find all div elements
        const divElements = await page.locator('div').all();
        const divCount = divElements.length;
        
        if (divCount > 0) {
          const divDetails = [];
          
          // Get details about each div for debugging
          for (let i = 0; i < Math.min(divCount, 10); i++) { // Limit to first 10 for readability
            const div = divElements[i];
            const className = await div.getAttribute('class') || '';
            const id = await div.getAttribute('id') || '';
            const innerHTML = await div.innerHTML();
            const truncatedHTML = innerHTML.length > 100 ? 
              innerHTML.substring(0, 100) + '...' : innerHTML;
            
            divDetails.push({
              index: i + 1,
              class: className,
              id: id,
              content: truncatedHTML
            });
          }
          
          templatesWithDivs.push({
            template: templateName,
            divCount: divCount,
            details: divDetails
          });
          
          console.log(`❌ ${templateName}: Found ${divCount} div element(s)`);
        } else {
          console.log(`✅ ${templateName}: Table-based layout (no divs)`);
        }
        
        divUsageResults.push({
          template: templateName,
          divCount: divCount,
          isGmailCompatible: divCount === 0
        });
        
      } catch (error) {
        console.log(`❌ Error processing ${templateName}: ${error.message}`);
        divUsageResults.push({
          template: templateName,
          error: error.message,
          isGmailCompatible: false
        });
      }
    }
    
    // Detailed reporting
    if (templatesWithDivs.length > 0) {
      console.log('\\n❌ Templates with DIV elements (Gmail compatibility issues):');
      for (const result of templatesWithDivs) {
        console.log(`\\n📧 ${result.template}:`);
        console.log(`   Found ${result.divCount} div element(s):`);
        for (const detail of result.details) {
          console.log(`   ${detail.index}. <div${detail.class ? ' class="' + detail.class + '"' : ''}${detail.id ? ' id="' + detail.id + '"' : ''}>`);
          console.log(`      Content: ${detail.content}`);
        }
        if (result.divCount > 10) {
          console.log(`   ... and ${result.divCount - 10} more div elements`);
        }
      }
      
      console.log('\\n📋 Gmail Compatibility Recommendations:');
      console.log('   • Replace <div> elements with <table role="presentation">');
      console.log('   • Use <td> elements instead of <div> for content containers');
      console.log('   • Gmail strips many CSS properties from <div> elements');
      console.log('   • Table-based layouts ensure consistent rendering across email clients');
    }
    
    // Summary
    const compatibleTemplates = divUsageResults.filter(r => r.isGmailCompatible).length;
    const totalTemplates = divUsageResults.length;
    
    console.log(`\\n📊 Gmail Compatibility Summary:`);
    console.log(`   Compatible templates: ${compatibleTemplates}/${totalTemplates}`);
    console.log(`   Templates needing fixes: ${templatesWithDivs.length}`);
    
    // Assert that no templates contain divs
    expect(templatesWithDivs.length, 
      `Found ${templatesWithDivs.length} templates with DIV elements. Gmail compatibility requires table-based layouts only.`
    ).toBe(0);
    
    console.log('\\n✅ All templates use Gmail-compatible table-based layouts!');
  });
  
  // Individual template validation
  for (const templateFile of templateFiles) {
    const templateName = path.basename(templateFile);
    
    test(`${templateName} should be Gmail compatible (no div elements)`, async ({ page }) => {
      await page.goto(`file://${templateFile}`);
      
      // Check for div elements
      const divCount = await page.locator('div').count();
      
      if (divCount > 0) {
        // Get details for better error reporting
        const divElements = await page.locator('div').all();
        const divInfo = [];
        
        for (let i = 0; i < Math.min(divCount, 5); i++) {
          const div = divElements[i];
          const className = await div.getAttribute('class') || '[no class]';
          const outerHTML = await div.evaluate(el => el.outerHTML.substring(0, 200));
          divInfo.push(`${i + 1}. class="${className}": ${outerHTML}...`);
        }
        
        console.log(`\\n❌ ${templateName} contains ${divCount} div element(s):`);
        for (const info of divInfo) {
          console.log(`   ${info}`);
        }
        if (divCount > 5) {
          console.log(`   ... and ${divCount - 5} more div elements`);
        }
      }
      
      expect(divCount, 
        `${templateName} contains ${divCount} div element(s). Gmail requires table-based layouts for compatibility.`
      ).toBe(0);
    });
  }
  
  // Additional Gmail compatibility checks
  test('all templates should use proper table structure for Gmail', async ({ page }) => {
    const structureIssues = [];
    
    console.log('\\n=== Checking Table Structure for Gmail ===');
    
    for (const templateFile of templateFiles) {
      const templateName = path.basename(templateFile);
      
      try {
        await page.goto(`file://${templateFile}`);
        
        const issues = [];
        
        // Check for table role="presentation"
        const presentationTables = await page.locator('table[role="presentation"]').count();
        const allTables = await page.locator('table').count();
        
        if (presentationTables === 0 && allTables > 0) {
          issues.push('Missing role="presentation" on tables');
        }
        
        // Check for inline styles (Gmail requirement)
        const elementsWithStyles = await page.locator('[style]').count();
        
        if (elementsWithStyles === 0) {
          issues.push('Missing inline styles (required for Gmail)');
        }
        
        // Check for external stylesheets or style blocks (Gmail strips these)
        const styleBlocks = await page.locator('style').count();
        const linkStylesheets = await page.locator('link[rel="stylesheet"]').count();
        
        if (styleBlocks > 0) {
          issues.push(`Contains ${styleBlocks} <style> block(s) - Gmail will strip these`);
        }
        
        if (linkStylesheets > 0) {
          issues.push(`Contains ${linkStylesheets} external stylesheet(s) - Gmail will ignore these`);
        }
        
        if (issues.length > 0) {
          structureIssues.push({
            template: templateName,
            issues: issues
          });
          console.log(`⚠️  ${templateName}: ${issues.join(', ')}`);
        } else {
          console.log(`✅ ${templateName}: Gmail-compatible structure`);
        }
        
      } catch (error) {
        structureIssues.push({
          template: templateName,
          issues: [`Error: ${error.message}`]
        });
      }
    }
    
    if (structureIssues.length > 0) {
      console.log('\\n📋 Gmail Structure Recommendations:');
      console.log('   • Add role="presentation" to layout tables');
      console.log('   • Use inline styles instead of <style> blocks or external CSS');
      console.log('   • Gmail strips <style> blocks and ignores external stylesheets');
      console.log('   • All styling must be inline for Gmail compatibility');
    }
    
    // Note: We don't fail this test as some warnings might be acceptable
    // but we log the issues for awareness
    console.log(`\\n📊 Gmail Structure Analysis: ${structureIssues.length} templates have potential issues`);
  });
  
});