/**
 * Fallback Handler
 * Provides intelligent fallback values for missing or invalid data
 */

class FallbackHandler {
  constructor() {
    // Define comprehensive fallback values for all variables
    this.fallbacks = {
      // User data fallbacks
      user_name: 'Friend',
      user_email: '',
      first_name: '',
      last_name: '',
      referral_code: 'STORY123',
      referred_friends_count: '0',
      account_anniversary: null,
      
      // Child data fallbacks
      child_name: 'your little reader',
      child_age: null,
      child_interests: 'adventures and learning',
      reading_level: 'beginner',
      favorite_character: null,
      favorite_themes: 'Adventure and Friendship',
      siblings_names: '',
      
      // Subscription fallbacks
      subscription_name: 'Free Trial',
      subscription_price: '$9.99',
      subscription_status: 'trial',
      trial_days_remaining: '7',
      next_billing_date: 'soon',
      subscription_renewal_date: 'soon',
      days_until_renewal: '7',
      credits_remaining: '10',
      credits_used_this_month: '0',
      monthly_credits_limit: '60',
      discount_amount: null,
      discount_percentage: null,
      active_promo_code: null,
      
      // Activity fallbacks
      stories_created: '0',
      stories_created_count: '0',
      stories_completed: '0',
      stories_read_count: '0',
      total_stories_completed: '0',
      reading_streak: '0',
      longest_streak: '0',
      avg_reading_time: '15',
      average_reading_time: '15 minutes',
      total_reading_time: '0',
      last_story_date: null,
      days_since_last_story: 'a few',
      peak_reading_hour: 'evening',
      stories_started_not_finished: '0',
      weekly_reading_goal: '3',
      weekly_reading_progress: '0',
      reading_goal_progress: '0',
      
      // Story fallbacks
      story_title: 'Your Personalized Adventure',
      last_story_title: 'your latest adventure',
      story_preview_text: 'An exciting personalized story awaits...',
      story_theme: 'Adventure',
      story_thumbnail: null,
      reading_time: '10 minutes',
      key_lesson: 'the importance of imagination and learning',
      story_link: '#',
      story_completion_percentage: '0',
      
      // Achievement fallbacks
      badges_earned: 'First Steps',
      total_badges: '1',
      next_milestone: 'First Story',
      milestone_achieved: null,
      stories_until_next_badge: '1',
      reading_level_progress: '0',
      current_level: 'Beginner Reader',
      next_level: 'Story Explorer',
      
      // Engagement fallbacks
      favorite_story_theme: 'Adventure',
      email_open_rate: '0',
      email_click_rate: '0',
      
      // Family fallbacks
      family_members_count: '1',
      shared_stories_count: '0',
      favorite_coauthor: null,
      
      // Recommendations fallbacks
      recommended_themes: ['Adventure', 'Friendship', 'Learning'],
      trending_story_types: ['Adventure Stories', 'Mystery Tales', 'Fantasy Journeys'],
      age_appropriate_topics: ['Friendship', 'Problem-solving', 'Creativity'],
      recommended_stories: [],
      
      // Story suggestion fallbacks
      suggested_story_1_title: 'The Castle of Kind Hearts',
      suggested_story_1_desc: 'Help others and discover the magic of kindness',
      story_1_emoji: '🏰',
      suggested_story_2_title: 'The Starlight Detective',
      suggested_story_2_desc: 'Solve mysteries while exploring problem-solving skills',
      story_2_emoji: '🌟',
      suggested_story_3_title: 'The Butterfly Garden Mystery',
      suggested_story_3_desc: 'Discover nature\'s wonders and environmental awareness',
      story_3_emoji: '🦋',
      
      // Question fallbacks for story completion emails
      question_1: 'What was your favorite part of the adventure and why?',
      question_2: 'How did the main character show courage in the story?',
      question_3: 'If you were in the story, what would you have done differently?',
      
      // Birthday/occasion fallbacks
      birthday_story_title: 'The Birthday Adventure of Champions',
      birthday_story_emoji: '🎪',
      story_preview: 'On their special day, a brave young hero discovers magical adventures...',
      birthday_theme: 'Celebration & Growth',
      birthday_gift: '100 bonus credits + exclusive birthday badge',
      
      // Link fallbacks
      main_cta_link: '#',
      create_story_link: '#',
      browse_stories_link: '#',
      create_next_story_link: '#',
      profile_link: '#',
      settings_link: '#',
      feedback_link: '#',
      upgrade_link: '#',
      unsubscribe_link: '#',
      birthday_story_link: '#',
      claim_gift_link: '#',
      save_memory_link: '#',
      logo_url: 'https://i.imgur.com/UHKz2jA.png'
    };
    
    // Template-specific fallback overrides
    this.templateOverrides = {
      'onboarding_welcome': {
        user_name: 'Welcome to StoryBud!'
      },
      'trial_welcome': {
        subscription_name: '7-Day Free Trial'
      },
      'churn_recovery': {
        user_name: 'Valued Friend',
        days_since_last_story: 'some time'
      },
      'birthday_story': {
        child_age: '7',
        child_name: 'Birthday Star'
      }
    };
  }
  
  /**
   * Get fallback value for a variable
   */
  getFallback(variableName, templateType = null) {
    // Check template-specific overrides first
    if (templateType && this.templateOverrides[templateType]) {
      const override = this.templateOverrides[templateType][variableName];
      if (override !== undefined) {
        return override;
      }
    }
    
    // Return default fallback
    return this.fallbacks[variableName] || '';
  }
  
  /**
   * Apply fallbacks to a data object
   */
  applyFallbacks(data, templateType = null) {
    const result = {};
    
    // Apply fallbacks for all known variables
    Object.keys(this.fallbacks).forEach(key => {
      if (this.isInvalid(data[key])) {
        result[key] = this.getFallback(key, templateType);
      } else {
        result[key] = data[key];
      }
    });
    
    // Include any additional data that doesn't have fallbacks
    Object.keys(data).forEach(key => {
      if (!(key in result)) {
        result[key] = data[key];
      }
    });
    
    return result;
  }
  
  /**
   * Check if a value is invalid and needs fallback
   */
  isInvalid(value) {
    return value === null || 
           value === undefined || 
           value === '' ||
           (Array.isArray(value) && value.length === 0);
  }
  
  /**
   * Apply smart formatting to values
   */
  formatValue(key, value) {
    // Format specific value types
    if (key.includes('_date') && value instanceof Date) {
      return this.formatDate(value);
    }
    
    if (key.includes('price') || key.includes('amount')) {
      return this.formatCurrency(value);
    }
    
    if (key.includes('_time') && typeof value === 'number') {
      return this.formatTime(value);
    }
    
    if (key.includes('_count') || key.includes('total_')) {
      return this.formatNumber(value);
    }
    
    if (Array.isArray(value)) {
      return this.formatArray(value);
    }
    
    return value;
  }
  
  /**
   * Format date for display
   */
  formatDate(date) {
    if (!date) return 'soon';
    
    const d = new Date(date);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }
  
  /**
   * Format currency
   */
  formatCurrency(value) {
    if (typeof value === 'string' && value.startsWith('$')) {
      return value;
    }
    
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  }
  
  /**
   * Format time duration
   */
  formatTime(minutes) {
    if (!minutes || minutes === 0) return '0 minutes';
    
    if (minutes < 60) {
      return `${Math.round(minutes)} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  
  /**
   * Format number with commas
   */
  formatNumber(value) {
    const num = parseInt(value) || 0;
    return num.toLocaleString('en-US');
  }
  
  /**
   * Format array for display
   */
  formatArray(arr) {
    if (!arr || arr.length === 0) return '';
    
    if (arr.length === 1) return arr[0];
    
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    
    const last = arr[arr.length - 1];
    const others = arr.slice(0, -1);
    return `${others.join(', ')}, and ${last}`;
  }
  
  /**
   * Generate contextual fallbacks based on other data
   */
  generateContextualFallbacks(data) {
    const contextual = {};
    
    // Generate greeting based on time of day
    if (!data.greeting) {
      const hour = new Date().getHours();
      if (hour < 12) contextual.greeting = 'Good morning';
      else if (hour < 17) contextual.greeting = 'Good afternoon';
      else contextual.greeting = 'Good evening';
    }
    
    // Generate child possessive
    if (data.child_name) {
      contextual.child_name_possessive = data.child_name.endsWith('s') ? 
        `${data.child_name}'` : `${data.child_name}'s`;
    }
    
    // Generate age ordinal
    if (data.child_age) {
      contextual.child_age_ordinal = this.getOrdinal(data.child_age);
    }
    
    // Generate reading level description
    if (data.reading_level_progress) {
      const progress = parseInt(data.reading_level_progress) || 0;
      if (progress < 25) contextual.level_description = 'just getting started';
      else if (progress < 50) contextual.level_description = 'making great progress';
      else if (progress < 75) contextual.level_description = 'becoming an expert';
      else contextual.level_description = 'almost at the next level';
    }
    
    return contextual;
  }
  
  /**
   * Get ordinal suffix for numbers
   */
  getOrdinal(num) {
    const n = parseInt(num);
    if (!n) return num;
    
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  
  /**
   * Validate and clean email data
   */
  validateEmailData(data, requiredFields = []) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (this.isInvalid(data[field])) {
        warnings.push(`Missing required field: ${field} (using fallback: ${this.getFallback(field)})`);
      }
    });
    
    // Validate email format
    if (data.user_email && !this.isValidEmail(data.user_email)) {
      errors.push(`Invalid email format: ${data.user_email}`);
    }
    
    // Validate URLs
    ['story_link', 'create_story_link', 'browse_stories_link'].forEach(field => {
      if (data[field] && data[field] !== '#' && !this.isValidUrl(data[field])) {
        warnings.push(`Invalid URL format for ${field}: ${data[field]}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate email format
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
module.exports = new FallbackHandler();

// Also export class for testing
module.exports.FallbackHandler = FallbackHandler;