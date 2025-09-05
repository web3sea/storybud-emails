/**
 * Template Rendering Engine
 * Main engine for rendering email templates with data
 */

const fs = require('fs').promises;
const path = require('path');
const EmailDataService = require('./email-data-service');
const templateTransformer = require('./transformers/template-transformer');

class TemplateEngine {
  constructor(config = {}) {
    // Initialize services
    this.dataService = config.dataService || new EmailDataService(config);
    
    // Configuration
    this.config = {
      templatesPath: config.templatesPath || path.join(__dirname, '..', 'templates'),
      cacheEnabled: config.cacheEnabled !== false,
      debugMode: config.debugMode || false,
      variableDelimiters: config.variableDelimiters || { open: '{{', close: '}}' }
    };
    
    // Template cache
    this.templateCache = new Map();
  }
  
  /**
   * Main render method
   */
  async render(templateName, userId, options = {}) {
    try {
      // Log rendering start
      if (this.config.debugMode) {
        console.log(`[TemplateEngine] Rendering ${templateName} for user ${userId}`);
      }
      
      // 1. Load the template
      const template = await this.loadTemplate(templateName);
      
      // 2. Fetch all required data
      const emailContext = await this.dataService.prepareTemplateContext(
        templateName,
        userId,
        options
      );
      
      // 3. Transform data for the template
      const transformedData = templateTransformer.transform(emailContext, templateName);
      
      // 4. Render the template with data
      const renderedHtml = this.renderTemplate(template, transformedData);
      
      // 5. Post-process the HTML
      const finalHtml = await this.postProcess(renderedHtml, transformedData);
      
      // Log rendering complete
      if (this.config.debugMode) {
        console.log(`[TemplateEngine] Rendering complete for ${templateName}`);
        console.log(`[TemplateEngine] Data quality: ${transformedData._metadata.dataQuality.quality}`);
      }
      
      return {
        html: finalHtml,
        data: transformedData,
        metadata: {
          templateName,
          userId,
          renderedAt: new Date().toISOString(),
          dataQuality: transformedData._metadata.dataQuality
        }
      };
      
    } catch (error) {
      console.error(`[TemplateEngine] Error rendering template ${templateName}:`, error);
      throw error;
    }
  }
  
  /**
   * Load template from file system
   */
  async loadTemplate(templateName) {
    // Check cache first
    if (this.config.cacheEnabled && this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }
    
    try {
      // Determine template file path
      const templatePath = this.resolveTemplatePath(templateName);
      
      // Read template file
      const template = await fs.readFile(templatePath, 'utf-8');
      
      // Cache the template
      if (this.config.cacheEnabled) {
        this.templateCache.set(templateName, template);
      }
      
      return template;
      
    } catch (error) {
      console.error(`[TemplateEngine] Error loading template ${templateName}:`, error);
      throw new Error(`Template not found: ${templateName}`);
    }
  }
  
  /**
   * Resolve template file path
   */
  resolveTemplatePath(templateName) {
    // Add .html extension if not present
    const filename = templateName.endsWith('.html') ? templateName : `${templateName}.html`;
    
    // Check if full path provided
    if (path.isAbsolute(filename)) {
      return filename;
    }
    
    // Construct path to template
    return path.join(this.config.templatesPath, filename);
  }
  
  /**
   * Render template with data (simple variable replacement)
   */
  renderTemplate(template, data) {
    let rendered = template;
    const { open, close } = this.config.variableDelimiters;
    
    // Find all variables in the template
    const variableRegex = new RegExp(`${this.escapeRegex(open)}([^${this.escapeRegex(close)}]+)${this.escapeRegex(close)}`, 'g');
    const variables = [...template.matchAll(variableRegex)];
    
    // Replace each variable
    variables.forEach(match => {
      const fullMatch = match[0];
      const variableExpression = match[1].trim();
      
      // Handle pipes (filters) like {{variable|default:"fallback"}}
      const [variableName, ...filters] = variableExpression.split('|').map(s => s.trim());
      
      let value = this.getNestedValue(data, variableName);
      
      // Apply filters
      filters.forEach(filter => {
        value = this.applyFilter(value, filter, data);
      });
      
      // Replace in template
      rendered = rendered.replace(fullMatch, value !== null && value !== undefined ? value : '');
    });
    
    return rendered;
  }
  
  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        return null;
      }
      value = value[key];
    }
    
    return value;
  }
  
  /**
   * Apply filter to value
   */
  applyFilter(value, filter, data) {
    // Parse filter (e.g., 'default:"fallback"' or 'uppercase')
    const match = filter.match(/^(\w+)(?::(.+))?$/);
    if (!match) return value;
    
    const filterName = match[1];
    const filterArg = match[2] ? this.parseFilterArg(match[2]) : null;
    
    switch (filterName) {
      case 'default':
        return value !== null && value !== undefined && value !== '' ? value : filterArg;
        
      case 'uppercase':
        return String(value).toUpperCase();
        
      case 'lowercase':
        return String(value).toLowerCase();
        
      case 'capitalize':
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
        
      case 'truncate':
        const length = parseInt(filterArg) || 50;
        return String(value).length > length ? 
          String(value).substring(0, length - 3) + '...' : value;
        
      case 'date':
        return this.formatDate(value, filterArg);
        
      case 'possessive':
        return String(value).endsWith('s') ? `${value}'` : `${value}'s`;
        
      case 'pluralize':
        const count = parseInt(value) || 0;
        return count === 1 ? filterArg.split(',')[0] : filterArg.split(',')[1] || filterArg.split(',')[0] + 's';
        
      default:
        return value;
    }
  }
  
  /**
   * Parse filter argument
   */
  parseFilterArg(arg) {
    // Remove quotes if present
    if ((arg.startsWith('"') && arg.endsWith('"')) || 
        (arg.startsWith("'") && arg.endsWith("'"))) {
      return arg.slice(1, -1);
    }
    return arg;
  }
  
  /**
   * Format date
   */
  formatDate(value, format) {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date)) return value;
    
    // Simple date formatting
    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US');
      case 'long':
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'time':
        return date.toLocaleTimeString('en-US');
      default:
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
    }
  }
  
  /**
   * Post-process rendered HTML
   */
  async postProcess(html, data) {
    let processed = html;
    
    // Remove any remaining unmatched variables (cleanup)
    const { open, close } = this.config.variableDelimiters;
    const cleanupRegex = new RegExp(`${this.escapeRegex(open)}[^${this.escapeRegex(close)}]+${this.escapeRegex(close)}`, 'g');
    processed = processed.replace(cleanupRegex, '');
    
    // Add tracking pixels if configured
    if (data.tracking_pixel_url) {
      processed = this.addTrackingPixel(processed, data.tracking_pixel_url);
    }
    
    // Add preview text if not present
    if (!processed.includes('preheader') && data.preview_text) {
      processed = this.addPreviewText(processed, data.preview_text);
    }
    
    return processed;
  }
  
  /**
   * Add tracking pixel to email
   */
  addTrackingPixel(html, pixelUrl) {
    const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;" />`;
    
    // Add before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${pixel}</body>`);
    }
    
    // Or add at the end
    return html + pixel;
  }
  
  /**
   * Add preview text to email
   */
  addPreviewText(html, previewText) {
    const preheader = `
      <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">
        ${previewText}
      </div>
    `;
    
    // Add after opening body tag
    if (html.includes('<body')) {
      return html.replace(/<body[^>]*>/, match => `${match}${preheader}`);
    }
    
    return preheader + html;
  }
  
  /**
   * Escape regex special characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Batch render templates for multiple users
   */
  async batchRender(templateName, userIds, options = {}) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.render(templateName, userId, options))
    );
    
    return results.map((result, index) => ({
      userId: userIds[index],
      success: result.status === 'fulfilled',
      result: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
  
  /**
   * Preview template with sample data
   */
  async preview(templateName, sampleData = {}) {
    try {
      // Load the template
      const template = await this.loadTemplate(templateName);
      
      // Use sample data or generate mock data
      const data = Object.keys(sampleData).length > 0 ? 
        sampleData : 
        this.generateSampleData(templateName);
      
      // Render the template
      const renderedHtml = this.renderTemplate(template, data);
      
      return {
        html: renderedHtml,
        data: data
      };
      
    } catch (error) {
      console.error(`[TemplateEngine] Error previewing template ${templateName}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate sample data for preview
   */
  generateSampleData(templateName) {
    // Basic sample data that works for all templates
    const baseData = {
      user_name: 'Sarah',
      user_email: 'sarah@example.com',
      child_name: 'Emma',
      child_age: 7,
      child_interests: 'dragons, space, and friendship',
      story_title: 'The Dragon\'s Space Adventure',
      last_story_title: 'The Magical Forest',
      stories_created: 15,
      stories_completed: 12,
      reading_streak: 5,
      subscription_name: 'Sprout',
      subscription_price: '$9.99',
      trial_days_remaining: 3,
      favorite_story_theme: 'Adventure',
      badges_earned: 'Story Explorer, Week Warrior',
      next_milestone: '20 Stories Completed'
    };
    
    // Add template-specific sample data
    if (templateName.includes('birthday')) {
      baseData.child_age = 8;
      baseData.birthday_story_title = 'Emma\'s 8th Birthday Spectacular';
    }
    
    if (templateName.includes('weekly')) {
      baseData.weekly_reading_progress = 2;
      baseData.weekly_reading_goal = 3;
    }
    
    return baseData;
  }
  
  /**
   * Clear template cache
   */
  clearCache() {
    this.templateCache.clear();
    console.log('[TemplateEngine] Template cache cleared');
  }
  
  /**
   * Get template list
   */
  async getTemplateList() {
    try {
      const files = await fs.readdir(this.config.templatesPath);
      return files
        .filter(file => file.endsWith('.html'))
        .map(file => file.replace('.html', ''));
    } catch (error) {
      console.error('[TemplateEngine] Error getting template list:', error);
      return [];
    }
  }
}

// Export singleton instance
module.exports = TemplateEngine;

// Also export the class
module.exports.TemplateEngine = TemplateEngine;