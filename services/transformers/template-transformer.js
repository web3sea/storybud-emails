/**
 * Template Transformer
 * Transforms and prepares data for email templates
 */

const fallbackHandler = require('./fallback-handler');

class TemplateTransformer {
  constructor() {
    // Define template-specific transformations
    this.templateConfigs = {
      'onboarding_welcome': {
        requiredFields: ['user_name', 'user_email'],
        transformations: ['addWelcomeMessage', 'addGettingStartedSteps']
      },
      'onboarding_firststorycreated': {
        requiredFields: ['user_name', 'story_title', 'story_link'],
        transformations: ['formatStoryDetails', 'addNextSteps']
      },
      'trial_welcome': {
        requiredFields: ['user_name', 'trial_days_remaining'],
        transformations: ['formatTrialInfo', 'addTrialBenefits']
      },
      'storytime_email': {
        requiredFields: ['child_name', 'reading_streak'],
        transformations: ['formatDailyChallenge', 'addMotivationalMessage']
      },
      'retention_weekly': {
        requiredFields: ['user_name', 'weekly_reading_progress'],
        transformations: ['formatWeeklyStats', 'addProgressChart']
      },
      'retention_monthly': {
        requiredFields: ['user_name', 'stories_completed'],
        transformations: ['formatMonthlyReport', 'addAchievements']
      },
      'birthday_story': {
        requiredFields: ['child_name', 'child_age'],
        transformations: ['formatBirthdayMessage', 'addBirthdayGift']
      },
      'churn_recovery': {
        requiredFields: ['user_name', 'days_since_last_story'],
        transformations: ['formatReengagementMessage', 'addSpecialOffer']
      },
      'story_completion': {
        requiredFields: ['last_story_title', 'child_name'],
        transformations: ['formatStoryReview', 'addDiscussionQuestions', 'addNextStoryRecommendations']
      }
    };
  }
  
  /**
   * Transform data for a specific template
   */
  transform(emailContext, templateType) {
    // Get flattened template variables
    let data = emailContext.toTemplateVariables();
    
    // Apply fallbacks
    data = fallbackHandler.applyFallbacks(data, templateType);
    
    // Generate contextual fallbacks
    const contextual = fallbackHandler.generateContextualFallbacks(data);
    data = { ...data, ...contextual };
    
    // Apply template-specific transformations
    const config = this.getTemplateConfig(templateType);
    if (config) {
      // Validate required fields
      const validation = fallbackHandler.validateEmailData(data, config.requiredFields);
      if (!validation.isValid) {
        console.error(`Template validation errors:`, validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn(`Template validation warnings:`, validation.warnings);
      }
      
      // Apply transformations
      config.transformations.forEach(transformation => {
        if (this[transformation]) {
          data = this[transformation](data, emailContext);
        }
      });
    }
    
    // Format all values
    Object.keys(data).forEach(key => {
      data[key] = fallbackHandler.formatValue(key, data[key]);
    });
    
    // Add metadata
    data._metadata = {
      templateType,
      generatedAt: new Date().toISOString(),
      dataQuality: this.assessDataQuality(data)
    };
    
    return data;
  }
  
  /**
   * Get template configuration
   */
  getTemplateConfig(templateType) {
    // Match partial template names
    for (const [key, config] of Object.entries(this.templateConfigs)) {
      if (templateType.includes(key)) {
        return config;
      }
    }
    return null;
  }
  
  /**
   * Assess data quality
   */
  assessDataQuality(data) {
    let score = 100;
    let fallbackCount = 0;
    
    // Check how many fallback values are being used
    Object.keys(data).forEach(key => {
      if (key.startsWith('_')) return; // Skip metadata
      
      const fallback = fallbackHandler.getFallback(key);
      if (data[key] === fallback) {
        fallbackCount++;
        score -= 2;
      }
    });
    
    return {
      score: Math.max(0, score),
      fallbackCount,
      quality: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
    };
  }
  
  // ============================================
  // Template-specific transformation methods
  // ============================================
  
  addWelcomeMessage(data) {
    data.welcome_headline = `Welcome to StoryBud, ${data.user_name}!`;
    data.welcome_subheadline = "Let's create magical stories together";
    return data;
  }
  
  addGettingStartedSteps(data) {
    data.getting_started_steps = [
      { number: 1, title: 'Add Your Child', description: 'Tell us about your little reader' },
      { number: 2, title: 'Choose a Theme', description: 'Pick from adventure, fantasy, mystery, and more' },
      { number: 3, title: 'Create Your First Story', description: 'Watch the magic happen in seconds' }
    ];
    return data;
  }
  
  formatStoryDetails(data) {
    if (data.story_title) {
      data.story_title_formatted = `"${data.story_title}"`;
    }
    
    if (data.reading_time) {
      data.estimated_read_time = `About ${data.reading_time} of magical reading`;
    }
    
    return data;
  }
  
  addNextSteps(data) {
    data.next_steps = [
      'Read the story together at bedtime',
      'Discuss the adventure and lessons learned',
      'Create your next personalized story'
    ];
    return data;
  }
  
  formatTrialInfo(data) {
    const days = parseInt(data.trial_days_remaining) || 7;
    
    data.trial_urgency = days <= 3 ? 'high' : days <= 5 ? 'medium' : 'low';
    data.trial_message = days === 1 ? 
      'Last day of your free trial!' : 
      `${days} days left in your free trial`;
    
    return data;
  }
  
  addTrialBenefits(data) {
    data.trial_benefits = [
      'Unlimited personalized stories',
      'Access to all themes and topics',
      'Save and share stories',
      'Track reading progress'
    ];
    return data;
  }
  
  formatDailyChallenge(data) {
    const streak = parseInt(data.reading_streak) || 0;
    
    if (streak === 0) {
      data.challenge_message = "Start your reading streak today!";
    } else if (streak < 3) {
      data.challenge_message = `${streak} day streak! Keep it going!`;
    } else if (streak < 7) {
      data.challenge_message = `Amazing ${streak} day streak! Can you reach a week?`;
    } else {
      data.challenge_message = `Incredible ${streak} day streak! You're a reading champion!`;
    }
    
    return data;
  }
  
  addMotivationalMessage(data) {
    const messages = [
      "Every story is a new adventure!",
      "Reading together creates memories that last forever.",
      "You're building a lifelong love of reading!",
      "Great readers are made one story at a time."
    ];
    
    data.motivational_message = messages[Math.floor(Math.random() * messages.length)];
    return data;
  }
  
  formatWeeklyStats(data) {
    const progress = parseInt(data.weekly_reading_progress) || 0;
    const goal = parseInt(data.weekly_reading_goal) || 3;
    
    data.progress_percentage = Math.min(100, Math.round((progress / goal) * 100));
    data.stories_remaining = Math.max(0, goal - progress);
    
    if (progress >= goal) {
      data.weekly_status = 'Goal achieved! 🎉';
      data.weekly_status_color = '#10B981';
    } else if (progress >= goal * 0.5) {
      data.weekly_status = 'Halfway there!';
      data.weekly_status_color = '#F59E0B';
    } else {
      data.weekly_status = 'Just getting started';
      data.weekly_status_color = '#8B5CF6';
    }
    
    return data;
  }
  
  addProgressChart(data) {
    // Visual progress bar segments
    const progress = parseInt(data.progress_percentage) || 0;
    const segments = [];
    
    for (let i = 0; i < 10; i++) {
      segments.push({
        filled: i < Math.floor(progress / 10),
        color: i < Math.floor(progress / 10) ? '#8B5CF6' : '#E5E7EB'
      });
    }
    
    data.progress_segments = segments;
    return data;
  }
  
  formatMonthlyReport(data) {
    const stories = parseInt(data.stories_completed) || 0;
    const time = parseInt(data.total_reading_time) || 0;
    
    data.monthly_summary = {
      stories: `${stories} ${stories === 1 ? 'story' : 'stories'}`,
      time: fallbackHandler.formatTime(time),
      average: stories > 0 ? fallbackHandler.formatTime(time / stories) : '0 minutes'
    };
    
    return data;
  }
  
  addAchievements(data) {
    if (!data.recent_achievements || data.recent_achievements.length === 0) {
      data.recent_achievements = [
        { name: 'Active Reader', icon: '📚', date: 'This month' }
      ];
    }
    return data;
  }
  
  formatBirthdayMessage(data) {
    const age = data.child_age || 7;
    data.birthday_headline = `Happy ${fallbackHandler.getOrdinal(age)} Birthday, ${data.child_name}!`;
    data.birthday_years_old = `${age} years old`;
    return data;
  }
  
  addBirthdayGift(data) {
    data.birthday_rewards = [
      { icon: '🎁', reward: '100 bonus story credits' },
      { icon: '🏆', reward: 'Exclusive birthday badge' },
      { icon: '📚', reward: 'Special birthday story collection' }
    ];
    return data;
  }
  
  formatReengagementMessage(data) {
    const days = parseInt(data.days_since_last_story);
    
    if (days && days > 30) {
      data.reengagement_headline = "We've missed you!";
      data.reengagement_message = "It's been a while since your last story adventure.";
    } else if (days && days > 14) {
      data.reengagement_headline = "Ready for a new adventure?";
      data.reengagement_message = "Your next story is waiting to be created!";
    } else {
      data.reengagement_headline = "Continue the adventure!";
      data.reengagement_message = "Pick up where you left off.";
    }
    
    return data;
  }
  
  addSpecialOffer(data) {
    data.special_offer = {
      headline: 'Welcome Back Offer',
      discount: '50% off',
      duration: 'first month',
      code: 'WELCOME50',
      expires: fallbackHandler.formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    };
    return data;
  }
  
  formatStoryReview(data) {
    data.story_review_intro = `How was "${data.last_story_title}"?`;
    data.feedback_prompt = 'Your feedback helps us create better stories';
    return data;
  }
  
  addDiscussionQuestions(data) {
    if (!data.question_1) {
      const questions = [
        'What was your favorite part of the story?',
        'Which character did you like the most and why?',
        'What would you do if you were the main character?',
        'What lesson did you learn from the story?',
        'How did the story make you feel?'
      ];
      
      // Select 3 random questions
      const shuffled = questions.sort(() => Math.random() - 0.5);
      data.question_1 = shuffled[0];
      data.question_2 = shuffled[1];
      data.question_3 = shuffled[2];
    }
    return data;
  }
  
  addNextStoryRecommendations(data, emailContext) {
    if (!data.suggested_story_1_title && emailContext.recommendations) {
      const suggestions = emailContext.recommendations.suggestedStories || [];
      
      suggestions.forEach((suggestion, index) => {
        const num = index + 1;
        data[`suggested_story_${num}_title`] = suggestion.title || `Adventure ${num}`;
        data[`suggested_story_${num}_desc`] = suggestion.description || 'A new exciting adventure';
        data[`story_${num}_emoji`] = suggestion.emoji || '⭐';
      });
    }
    return data;
  }
}

// Export singleton instance
module.exports = new TemplateTransformer();

// Also export class for testing
module.exports.TemplateTransformer = TemplateTransformer;