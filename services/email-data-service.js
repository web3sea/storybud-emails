/**
 * Email Data Service
 * Central service for fetching and preparing all email template data
 */

const { EmailContext } = require('../models/email-data-models');

class EmailDataService {
  constructor(config = {}) {
    // Initialize fetcher modules
    this.userFetcher = config.userFetcher || require('./fetchers/user-fetcher');
    this.stripeFetcher = config.stripeFetcher || require('./fetchers/stripe-fetcher');
    this.posthogFetcher = config.posthogFetcher || require('./fetchers/posthog-fetcher');
    this.storyFetcher = config.storyFetcher || require('./fetchers/story-fetcher');
    this.engagementFetcher = config.engagementFetcher || require('./fetchers/engagement-fetcher');
    
    // Initialize cache if provided
    this.cache = config.cache || null;
    
    // Configuration
    this.config = {
      cacheEnabled: config.cacheEnabled !== false,
      cacheTTL: {
        userProfile: config.cacheTTL?.userProfile || 3600, // 1 hour
        subscription: config.cacheTTL?.subscription || 900, // 15 minutes
        metrics: config.cacheTTL?.metrics || 300 // 5 minutes
      }
    };
  }
  
  /**
   * Fetch complete user data including account and profile information
   */
  async fetchUserData(userId) {
    const cacheKey = `user:${userId}`;
    
    // Check cache first
    if (this.cache && this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const userData = await this.userFetcher.fetchUserProfile(userId);
      
      // Cache the result
      if (this.cache && this.config.cacheEnabled) {
        await this.cache.set(cacheKey, userData, this.config.cacheTTL.userProfile);
      }
      
      return userData;
    } catch (error) {
      console.error(`Error fetching user data for ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch child profile data
   */
  async fetchChildData(childId, userId = null) {
    try {
      return await this.userFetcher.fetchChildProfile(childId, userId);
    } catch (error) {
      console.error(`Error fetching child data for ${childId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch subscription data from Stripe
   */
  async fetchSubscriptionData(stripeCustomerId) {
    const cacheKey = `subscription:${stripeCustomerId}`;
    
    // Check cache first
    if (this.cache && this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const subscriptionData = await this.stripeFetcher.fetchSubscriptionStatus(stripeCustomerId);
      
      // Cache the result
      if (this.cache && this.config.cacheEnabled) {
        await this.cache.set(cacheKey, subscriptionData, this.config.cacheTTL.subscription);
      }
      
      return subscriptionData;
    } catch (error) {
      console.error(`Error fetching subscription data for ${stripeCustomerId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch activity metrics from PostHog and database
   */
  async fetchActivityMetrics(userId, childId = null) {
    const cacheKey = `metrics:${userId}:${childId || 'all'}`;
    
    // Check cache first
    if (this.cache && this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    try {
      // Fetch from multiple sources in parallel
      const [posthogMetrics, dbActivity] = await Promise.all([
        this.posthogFetcher.fetchEngagementMetrics(userId),
        this.engagementFetcher.fetchReadingActivity(userId, childId)
      ]);
      
      // Merge metrics from different sources
      const mergedMetrics = {
        ...dbActivity,
        ...posthogMetrics
      };
      
      // Cache the result
      if (this.cache && this.config.cacheEnabled) {
        await this.cache.set(cacheKey, mergedMetrics, this.config.cacheTTL.metrics);
      }
      
      return mergedMetrics;
    } catch (error) {
      console.error(`Error fetching activity metrics for ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch story recommendations based on child profile and history
   */
  async fetchStoryRecommendations(childId, limit = 3) {
    try {
      const [childProfile, storyHistory, trending] = await Promise.all([
        this.fetchChildData(childId),
        this.storyFetcher.fetchStoryHistory(childId, 10),
        this.storyFetcher.fetchTrendingStories(limit)
      ]);
      
      return await this.storyFetcher.generateRecommendations(
        childProfile,
        storyHistory,
        trending,
        limit
      );
    } catch (error) {
      console.error(`Error fetching story recommendations for ${childId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch achievement and progress data
   */
  async fetchAchievementData(userId, childId) {
    try {
      return await this.engagementFetcher.fetchAchievements(userId, childId);
    } catch (error) {
      console.error(`Error fetching achievement data:`, error);
      return null;
    }
  }
  
  /**
   * Fetch family data
   */
  async fetchFamilyData(userId) {
    try {
      return await this.userFetcher.fetchFamilyData(userId);
    } catch (error) {
      console.error(`Error fetching family data:`, error);
      return null;
    }
  }
  
  /**
   * Main method to prepare complete email context for a template
   */
  async prepareTemplateContext(templateType, userId, options = {}) {
    const {
      childId = null,
      storyId = null,
      includeRecommendations = true,
      includeAchievements = true
    } = options;
    
    try {
      // Fetch user data first to get Stripe customer ID and default child
      const userData = await this.fetchUserData(userId);
      
      if (!userData) {
        throw new Error(`User not found: ${userId}`);
      }
      
      // Determine child ID (use provided or default to user's primary child)
      const targetChildId = childId || userData.primaryChildId;
      
      // Fetch all data in parallel for performance
      const fetchPromises = [
        this.fetchChildData(targetChildId, userId),
        this.fetchSubscriptionData(userData.stripeCustomerId),
        this.fetchActivityMetrics(userId, targetChildId),
        this.fetchFamilyData(userId)
      ];
      
      // Conditionally add optional data fetches
      if (includeRecommendations) {
        fetchPromises.push(this.fetchStoryRecommendations(targetChildId));
      }
      
      if (includeAchievements) {
        fetchPromises.push(this.fetchAchievementData(userId, targetChildId));
      }
      
      if (storyId) {
        fetchPromises.push(this.storyFetcher.fetchStoryDetails(storyId));
      }
      
      // Fetch last story if needed for certain templates
      if (['story_completion', 're_engagement', 'retention'].includes(templateType)) {
        fetchPromises.push(this.storyFetcher.fetchLastStory(targetChildId));
      }
      
      // Execute all fetches in parallel
      const [
        childData,
        subscriptionData,
        activityData,
        familyData,
        recommendations,
        achievements,
        currentStory,
        lastStory
      ] = await Promise.all(fetchPromises);
      
      // Build the complete email context
      const emailContext = new EmailContext({
        user: userData,
        child: childData,
        subscription: subscriptionData,
        activity: activityData,
        family: familyData,
        recommendations: recommendations || {},
        achievements: achievements || {},
        currentStory: currentStory || null,
        lastStory: lastStory || null,
        emailType: templateType,
        campaignName: options.campaignName || null,
        links: this.generateLinks(userId, targetChildId, templateType),
        occasions: await this.checkSpecialOccasions(targetChildId)
      });
      
      return emailContext;
      
    } catch (error) {
      console.error(`Error preparing template context:`, error);
      
      // Return a basic context with fallback values
      return new EmailContext({
        emailType: templateType,
        links: this.generateLinks(userId)
      });
    }
  }
  
  /**
   * Generate dynamic links for the email
   */
  generateLinks(userId, childId = null, templateType = null) {
    const baseUrl = process.env.APP_BASE_URL || 'https://storybud.com';
    const utmParams = `utm_source=email&utm_medium=${templateType}&utm_campaign=email`;
    
    return {
      mainCtaLink: `${baseUrl}/stories/create?userId=${userId}&childId=${childId}&${utmParams}`,
      createStoryLink: `${baseUrl}/stories/create?userId=${userId}&childId=${childId}&${utmParams}`,
      browseStoriesLink: `${baseUrl}/stories/browse?userId=${userId}&${utmParams}`,
      profileLink: `${baseUrl}/profile?userId=${userId}&${utmParams}`,
      settingsLink: `${baseUrl}/settings?userId=${userId}&${utmParams}`,
      feedbackLink: `${baseUrl}/feedback?userId=${userId}&${utmParams}`,
      upgradeLink: `${baseUrl}/upgrade?userId=${userId}&${utmParams}`,
      unsubscribeLink: `${baseUrl}/unsubscribe?userId=${userId}&email={{user_email}}`,
      logoUrl: process.env.LOGO_URL || 'https://i.imgur.com/UHKz2jA.png'
    };
  }
  
  /**
   * Check for special occasions (birthdays, holidays, etc.)
   */
  async checkSpecialOccasions(childId) {
    try {
      const childData = await this.fetchChildData(childId);
      if (!childData || !childData.birthDate) {
        return {};
      }
      
      const today = new Date();
      const birthDate = new Date(childData.birthDate);
      
      // Check if today is the child's birthday
      const isBirthday = (
        today.getDate() === birthDate.getDate() &&
        today.getMonth() === birthDate.getMonth()
      );
      
      // Check for upcoming birthday (within 7 days)
      const daysUntilBirthday = this.calculateDaysUntilBirthday(birthDate);
      const upcomingBirthday = daysUntilBirthday > 0 && daysUntilBirthday <= 7;
      
      // Check for holidays
      const currentHoliday = this.getCurrentHoliday();
      const currentSeason = this.getCurrentSeason();
      
      return {
        isBirthday,
        upcomingBirthday,
        daysUntilBirthday,
        birthdayDate: birthDate,
        holidayName: currentHoliday,
        seasonalTheme: currentSeason
      };
    } catch (error) {
      console.error(`Error checking special occasions:`, error);
      return {};
    }
  }
  
  /**
   * Calculate days until next birthday
   */
  calculateDaysUntilBirthday(birthDate) {
    const today = new Date();
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = thisYearBirthday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Get current holiday if applicable
   */
  getCurrentHoliday() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Simplified holiday detection - expand as needed
    const holidays = {
      '1-1': "New Year's Day",
      '2-14': "Valentine's Day",
      '3-17': "St. Patrick's Day",
      '7-4': "Independence Day",
      '10-31': "Halloween",
      '12-25': "Christmas"
    };
    
    return holidays[`${month}-${day}`] || null;
  }
  
  /**
   * Get current season
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Fall';
    return 'Winter';
  }
  
  /**
   * Batch fetch data for multiple users (for bulk email sends)
   */
  async batchPrepareContexts(userIds, templateType, options = {}) {
    const contexts = await Promise.allSettled(
      userIds.map(userId => 
        this.prepareTemplateContext(templateType, userId, options)
      )
    );
    
    return contexts.map((result, index) => ({
      userId: userIds[index],
      success: result.status === 'fulfilled',
      context: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
}

// Export singleton instance by default
module.exports = EmailDataService;

// Also export the class for testing purposes
module.exports.EmailDataService = EmailDataService;