/**
 * Email Data Models
 * Defines the structure for all data types used in email templates
 */

// User Profile Model
class UserProfile {
  constructor(data = {}) {
    this.userId = data.userId || null;
    this.userName = data.userName || 'Friend';
    this.userEmail = data.userEmail || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.accountCreatedDate = data.accountCreatedDate || null;
    this.lastLoginDate = data.lastLoginDate || null;
    this.timezone = data.timezone || 'UTC';
    this.preferredLanguage = data.preferredLanguage || 'en';
    this.referralCode = data.referralCode || null;
    this.referredFriendsCount = data.referredFriendsCount || 0;
    this.accountAnniversary = data.accountAnniversary || null;
  }
}

// Child Profile Model
class ChildProfile {
  constructor(data = {}) {
    this.childId = data.childId || null;
    this.childName = data.childName || 'your little reader';
    this.childAge = data.childAge || null;
    this.birthDate = data.birthDate || null;
    this.interests = data.interests || [];
    this.readingLevel = data.readingLevel || 'beginner';
    this.favoriteThemes = data.favoriteThemes || [];
    this.avatarUrl = data.avatarUrl || null;
    this.parentUserId = data.parentUserId || null;
    this.favoriteCharacter = data.favoriteCharacter || null;
    this.favoriteCharacterStory = data.favoriteCharacterStory || null;
  }
}

// Subscription Status Model
class SubscriptionStatus {
  constructor(data = {}) {
    this.subscriptionId = data.subscriptionId || null;
    this.subscriptionName = data.subscriptionName || 'Free Trial';
    this.subscriptionPrice = data.subscriptionPrice || '$0.00';
    this.subscriptionStatus = data.subscriptionStatus || 'trial';
    this.trialStartDate = data.trialStartDate || null;
    this.trialEndDate = data.trialEndDate || null;
    this.trialDaysRemaining = data.trialDaysRemaining || 0;
    this.nextBillingDate = data.nextBillingDate || null;
    this.subscriptionRenewalDate = data.subscriptionRenewalDate || null;
    this.daysUntilRenewal = data.daysUntilRenewal || null;
    this.creditsRemaining = data.creditsRemaining || 0;
    this.creditsUsedThisMonth = data.creditsUsedThisMonth || 0;
    this.monthlyCreditsLimit = data.monthlyCreditsLimit || 0;
    this.lifetimeValue = data.lifetimeValue || 0;
    this.stripeCustomerId = data.stripeCustomerId || null;
    this.paymentMethodLast4 = data.paymentMethodLast4 || null;
    this.discountAmount = data.discountAmount || null;
    this.discountPercentage = data.discountPercentage || null;
    this.activePromoCode = data.activePromoCode || null;
  }
}

// Reading Activity Model
class ReadingActivity {
  constructor(data = {}) {
    this.totalStoriesCreated = data.totalStoriesCreated || 0;
    this.totalStoriesCompleted = data.totalStoriesCompleted || 0;
    this.readingStreak = data.readingStreak || 0;
    this.longestStreak = data.longestStreak || 0;
    this.averageReadingTime = data.averageReadingTime || 0;
    this.totalReadingTime = data.totalReadingTime || 0;
    this.lastStoryDate = data.lastStoryDate || null;
    this.daysSinceLastStory = data.daysSinceLastStory || null;
    this.peakReadingHour = data.peakReadingHour || null;
    this.weeklyReadingGoal = data.weeklyReadingGoal || 3;
    this.weeklyReadingProgress = data.weeklyReadingProgress || 0;
    this.storiesStartedNotFinished = data.storiesStartedNotFinished || 0;
    this.favoriteReadingDay = data.favoriteReadingDay || null;
  }
}

// Story Metadata Model
class StoryMetadata {
  constructor(data = {}) {
    this.storyId = data.storyId || null;
    this.storyTitle = data.storyTitle || 'Your Personalized Adventure';
    this.storyTheme = data.storyTheme || 'Adventure';
    this.storyPreviewText = data.storyPreviewText || '';
    this.readingTime = data.readingTime || '10 minutes';
    this.ageRange = data.ageRange || '5-7';
    this.createdDate = data.createdDate || null;
    this.completedDate = data.completedDate || null;
    this.storyLink = data.storyLink || '#';
    this.coverImageUrl = data.coverImageUrl || null;
    this.storyThumbnail = data.storyThumbnail || null;
    this.keyLesson = data.keyLesson || '';
    this.educationalTopics = data.educationalTopics || [];
    this.characterNames = data.characterNames || [];
    this.isCompleted = data.isCompleted || false;
    this.isFavorite = data.isFavorite || false;
    this.shareCount = data.shareCount || 0;
    this.completionPercentage = data.completionPercentage || 0;
  }
}

// Achievement Data Model
class AchievementData {
  constructor(data = {}) {
    this.badgesEarned = data.badgesEarned || [];
    this.totalBadgeCount = data.totalBadgeCount || 0;
    this.nextMilestone = data.nextMilestone || 'First Story';
    this.progressToNextMilestone = data.progressToNextMilestone || 0;
    this.storiesUntilNextBadge = data.storiesUntilNextBadge || 1;
    this.readingLevelProgress = data.readingLevelProgress || 0;
    this.currentLevel = data.currentLevel || 'Beginner Reader';
    this.nextLevel = data.nextLevel || 'Story Explorer';
    this.recentAchievements = data.recentAchievements || [];
  }
}

// Engagement Metrics Model
class EngagementMetrics {
  constructor(data = {}) {
    this.daysSinceLastLogin = data.daysSinceLastLogin || 0;
    this.favoriteStoryTheme = data.favoriteStoryTheme || null;
    this.mostActiveDay = data.mostActiveDay || null;
    this.mostActiveTime = data.mostActiveTime || null;
    this.emailOpenRate = data.emailOpenRate || 0;
    this.emailClickRate = data.emailClickRate || 0;
    this.appSessionsThisWeek = data.appSessionsThisWeek || 0;
    this.averageSessionDuration = data.averageSessionDuration || 0;
    this.storiesSharedCount = data.storiesSharedCount || 0;
    this.referralCount = data.referralCount || 0;
  }
}

// Story Recommendations Model
class StoryRecommendations {
  constructor(data = {}) {
    this.recommendedThemes = data.recommendedThemes || [];
    this.trendingStoryTypes = data.trendingStoryTypes || [];
    this.ageAppropriateTopics = data.ageAppropriateTopics || [];
    this.suggestedStories = data.suggestedStories || [];
    this.personalizedCategories = data.personalizedCategories || [];
    this.nextStoryIdeas = data.nextStoryIdeas || [];
  }
}

// Family Data Model
class FamilyData {
  constructor(data = {}) {
    this.familyMembersCount = data.familyMembersCount || 1;
    this.childProfiles = data.childProfiles || [];
    this.sharedStoriesCount = data.sharedStoriesCount || 0;
    this.favoriteCoauthor = data.favoriteCoauthor || null;
    this.familyReadingGoal = data.familyReadingGoal || null;
    this.familyAchievements = data.familyAchievements || [];
    this.siblingsNames = data.siblingsNames || [];
  }
}

// Complete Email Context Model (combines all data)
class EmailContext {
  constructor(data = {}) {
    this.user = new UserProfile(data.user);
    this.child = new ChildProfile(data.child);
    this.subscription = new SubscriptionStatus(data.subscription);
    this.activity = new ReadingActivity(data.activity);
    this.currentStory = data.currentStory ? new StoryMetadata(data.currentStory) : null;
    this.lastStory = data.lastStory ? new StoryMetadata(data.lastStory) : null;
    this.achievements = new AchievementData(data.achievements);
    this.engagement = new EngagementMetrics(data.engagement);
    this.recommendations = new StoryRecommendations(data.recommendations);
    this.family = new FamilyData(data.family);
    
    // Email-specific data
    this.emailType = data.emailType || null;
    this.campaignName = data.campaignName || null;
    this.sendDate = data.sendDate || new Date();
    
    // Dynamic links
    this.links = {
      mainCtaLink: data.links?.mainCtaLink || '#',
      createStoryLink: data.links?.createStoryLink || '#',
      browseStoriesLink: data.links?.browseStoriesLink || '#',
      profileLink: data.links?.profileLink || '#',
      settingsLink: data.links?.settingsLink || '#',
      feedbackLink: data.links?.feedbackLink || '#',
      upgradeLink: data.links?.upgradeLink || '#',
      unsubscribeLink: data.links?.unsubscribeLink || '#',
      logoUrl: data.links?.logoUrl || 'https://i.imgur.com/UHKz2jA.png'
    };
    
    // Special occasion data
    this.occasions = {
      isBirthday: data.occasions?.isBirthday || false,
      birthdayDate: data.occasions?.birthdayDate || null,
      holidayName: data.occasions?.holidayName || null,
      seasonalTheme: data.occasions?.seasonalTheme || null
    };
  }
  
  // Helper method to get flattened template variables
  toTemplateVariables() {
    return {
      // User variables
      user_name: this.user.userName,
      user_email: this.user.userEmail,
      first_name: this.user.firstName,
      last_name: this.user.lastName,
      referral_code: this.user.referralCode,
      referred_friends_count: this.user.referredFriendsCount,
      account_anniversary: this.user.accountAnniversary,
      
      // Child variables
      child_name: this.child.childName,
      child_age: this.child.childAge,
      child_interests: this.child.interests.join(', '),
      reading_level: this.child.readingLevel,
      favorite_character: this.child.favoriteCharacter,
      favorite_themes: this.child.favoriteThemes.join(', '),
      
      // Subscription variables
      subscription_name: this.subscription.subscriptionName,
      subscription_price: this.subscription.subscriptionPrice,
      subscription_status: this.subscription.subscriptionStatus,
      trial_days_remaining: this.subscription.trialDaysRemaining,
      next_billing_date: this.subscription.nextBillingDate,
      subscription_renewal_date: this.subscription.subscriptionRenewalDate || this.subscription.nextBillingDate,
      days_until_renewal: this.subscription.daysUntilRenewal || this.subscription.trialDaysRemaining,
      credits_remaining: this.subscription.creditsRemaining,
      credits_used_this_month: this.subscription.creditsUsedThisMonth,
      discount_amount: this.subscription.discountAmount,
      discount_percentage: this.subscription.discountPercentage,
      active_promo_code: this.subscription.activePromoCode,
      
      // Activity variables
      stories_created: this.activity.totalStoriesCreated,
      stories_created_count: this.activity.totalStoriesCreated, // alias
      stories_completed: this.activity.totalStoriesCompleted,
      stories_read_count: this.activity.totalStoriesCompleted, // alias
      total_stories_completed: this.activity.totalStoriesCompleted, // alias
      reading_streak: this.activity.readingStreak,
      longest_streak: this.activity.longestStreak,
      avg_reading_time: this.activity.averageReadingTime,
      total_reading_time: this.activity.totalReadingTime,
      last_story_date: this.activity.lastStoryDate,
      days_since_last_story: this.activity.daysSinceLastStory,
      peak_reading_hour: this.activity.peakReadingHour,
      stories_started_not_finished: this.activity.storiesStartedNotFinished,
      reading_goal_progress: this.activity.weeklyReadingProgress,
      weekly_reading_goal: this.activity.weeklyReadingGoal,
      weekly_reading_progress: this.activity.weeklyReadingProgress,
      
      // Current/Last story variables
      story_title: this.currentStory?.storyTitle,
      last_story_title: this.lastStory?.storyTitle,
      story_preview_text: this.currentStory?.storyPreviewText,
      story_theme: this.currentStory?.storyTheme,
      story_thumbnail: this.currentStory?.storyThumbnail,
      reading_time: this.currentStory?.readingTime,
      key_lesson: this.currentStory?.keyLesson,
      story_link: this.currentStory?.storyLink,
      story_completion_percentage: this.currentStory?.completionPercentage,
      
      // Achievement variables
      badges_earned: this.achievements.badgesEarned.join(', '),
      total_badges: this.achievements.totalBadgeCount,
      next_milestone: this.achievements.nextMilestone,
      milestone_achieved: this.achievements.recentAchievements?.[0]?.name || null,
      stories_until_next_badge: this.achievements.storiesUntilNextBadge,
      reading_level_progress: this.achievements.readingLevelProgress,
      current_level: this.achievements.currentLevel,
      
      // Engagement variables
      favorite_story_theme: this.engagement.favoriteStoryTheme,
      
      // Recommendations
      recommended_themes: this.recommendations.recommendedThemes,
      trending_story_types: this.recommendations.trendingStoryTypes,
      age_appropriate_topics: this.recommendations.ageAppropriateTopics,
      recommended_stories: this.recommendations.suggestedStories,
      
      // Family variables
      family_members_count: this.family.familyMembersCount,
      shared_stories_count: this.family.sharedStoriesCount,
      favorite_coauthor: this.family.favoriteCoauthor,
      siblings_names: this.family.siblingsNames.join(', '),
      
      // Links
      ...this.links,
      
      // Special occasions
      ...this.occasions
    };
  }
}

module.exports = {
  UserProfile,
  ChildProfile,
  SubscriptionStatus,
  ReadingActivity,
  StoryMetadata,
  AchievementData,
  EngagementMetrics,
  StoryRecommendations,
  FamilyData,
  EmailContext
};