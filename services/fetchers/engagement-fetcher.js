/**
 * Engagement Data Fetcher
 * Fetches reading activity, achievements, and engagement metrics
 */

const { ReadingActivity, AchievementData } = require('../../models/email-data-models');

class EngagementFetcher {
  constructor(dbConnection = null) {
    this.db = dbConnection;
  }
  
  /**
   * Fetch reading activity metrics
   */
  async fetchReadingActivity(userId, childId = null) {
    try {
      // TODO: Replace with actual database queries
      // Example queries:
      // SELECT COUNT(*) FROM stories WHERE user_id = ? AND child_id = ?
      // SELECT MAX(streak) FROM reading_streaks WHERE user_id = ?
      
      // Mock implementation
      const activity = await this.mockFetchActivity(userId, childId);
      
      return new ReadingActivity({
        totalStoriesCreated: activity.storiesCreated,
        totalStoriesCompleted: activity.storiesCompleted,
        readingStreak: activity.currentStreak,
        longestStreak: activity.longestStreak,
        averageReadingTime: activity.avgReadingTime,
        totalReadingTime: activity.totalReadingTime,
        lastStoryDate: activity.lastStoryDate,
        daysSinceLastStory: this.calculateDaysSince(activity.lastStoryDate),
        peakReadingHour: activity.peakHour,
        weeklyReadingGoal: activity.weeklyGoal,
        weeklyReadingProgress: activity.weeklyProgress,
        storiesStartedNotFinished: activity.incompleteStories,
        favoriteReadingDay: activity.favoriteDay
      });
      
    } catch (error) {
      console.error(`Error fetching reading activity:`, error);
      return new ReadingActivity();
    }
  }
  
  /**
   * Fetch achievement data
   */
  async fetchAchievements(userId, childId = null) {
    try {
      // TODO: Replace with actual database queries
      // Example: SELECT * FROM achievements WHERE user_id = ? AND child_id = ?
      
      // Mock implementation
      const achievements = await this.mockFetchAchievements(userId, childId);
      
      return new AchievementData({
        badgesEarned: achievements.badges,
        totalBadgeCount: achievements.badges.length,
        nextMilestone: achievements.nextMilestone,
        progressToNextMilestone: achievements.progress,
        storiesUntilNextBadge: achievements.storiesNeeded,
        readingLevelProgress: achievements.levelProgress,
        currentLevel: achievements.currentLevel,
        nextLevel: achievements.nextLevel,
        recentAchievements: achievements.recent
      });
      
    } catch (error) {
      console.error(`Error fetching achievements:`, error);
      return new AchievementData();
    }
  }
  
  /**
   * Fetch reading streak data
   */
  async fetchStreakData(userId, childId = null) {
    try {
      // TODO: Replace with actual database query
      // Example: SELECT * FROM reading_streaks WHERE user_id = ? ORDER BY date DESC
      
      // Mock implementation
      const streakData = await this.mockFetchStreaks(userId, childId);
      
      return {
        currentStreak: streakData.current,
        longestStreak: streakData.longest,
        streakStartDate: streakData.startDate,
        lastReadingDate: streakData.lastDate,
        totalReadingDays: streakData.totalDays,
        streaksLost: streakData.streaksLost,
        averageStreakLength: streakData.avgLength
      };
      
    } catch (error) {
      console.error(`Error fetching streak data:`, error);
      return {
        currentStreak: 0,
        longestStreak: 0
      };
    }
  }
  
  /**
   * Fetch weekly/monthly progress
   */
  async fetchProgressMetrics(userId, childId = null, period = 'week') {
    try {
      // TODO: Replace with actual database queries
      // Example: SELECT COUNT(*), SUM(reading_time) FROM stories 
      //          WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 WEEK)
      
      // Mock implementation
      const progress = await this.mockFetchProgress(userId, childId, period);
      
      return {
        storiesRead: progress.stories,
        totalReadingTime: progress.readingTime,
        goal: progress.goal,
        goalProgress: (progress.stories / progress.goal) * 100,
        comparisonToPrevious: progress.comparison, // e.g., "+20%"
        bestDay: progress.bestDay,
        consistency: progress.consistency // percentage
      };
      
    } catch (error) {
      console.error(`Error fetching progress metrics:`, error);
      return {};
    }
  }
  
  /**
   * Fetch milestone data
   */
  async fetchMilestones(userId, childId = null) {
    try {
      // TODO: Replace with actual database queries
      
      // Mock implementation
      const milestones = await this.mockFetchMilestones(userId, childId);
      
      return {
        completed: milestones.completed,
        upcoming: milestones.upcoming,
        nextMilestone: milestones.next,
        daysUntilNext: milestones.daysUntil,
        totalPoints: milestones.points,
        rank: milestones.rank
      };
      
    } catch (error) {
      console.error(`Error fetching milestones:`, error);
      return {};
    }
  }
  
  /**
   * Calculate engagement score
   */
  async calculateEngagementScore(userId, childId = null) {
    try {
      const [activity, achievements, streak] = await Promise.all([
        this.fetchReadingActivity(userId, childId),
        this.fetchAchievements(userId, childId),
        this.fetchStreakData(userId, childId)
      ]);
      
      // Calculate score based on multiple factors
      let score = 0;
      
      // Activity score (max 40 points)
      score += Math.min(activity.totalStoriesCompleted * 2, 20);
      score += Math.min(activity.weeklyReadingProgress / 10, 10);
      score += Math.min(activity.readingStreak * 2, 10);
      
      // Achievement score (max 30 points)
      score += Math.min(achievements.totalBadgeCount * 3, 15);
      score += Math.min(achievements.progressToNextMilestone / 10, 15);
      
      // Consistency score (max 30 points)
      score += Math.min(streak.currentStreak, 15);
      score += Math.min(streak.totalReadingDays / 10, 15);
      
      return {
        score: Math.round(score),
        level: this.getEngagementLevel(score),
        percentile: this.getPercentile(score)
      };
      
    } catch (error) {
      console.error(`Error calculating engagement score:`, error);
      return {
        score: 0,
        level: 'beginner',
        percentile: 50
      };
    }
  }
  
  /**
   * Helper: Calculate days since date
   */
  calculateDaysSince(date) {
    if (!date) return null;
    
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Helper: Get engagement level from score
   */
  getEngagementLevel(score) {
    if (score >= 80) return 'champion';
    if (score >= 60) return 'expert';
    if (score >= 40) return 'explorer';
    if (score >= 20) return 'learner';
    return 'beginner';
  }
  
  /**
   * Helper: Get percentile from score
   */
  getPercentile(score) {
    // Simplified percentile calculation
    // In production, compare against all users
    if (score >= 90) return 99;
    if (score >= 75) return 90;
    if (score >= 60) return 75;
    if (score >= 45) return 50;
    if (score >= 30) return 25;
    return 10;
  }
  
  // ============================================
  // MOCK IMPLEMENTATIONS - Replace with real database queries
  // ============================================
  
  async mockFetchActivity(userId, childId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      storiesCreated: 45,
      storiesCompleted: 38,
      currentStreak: 5,
      longestStreak: 12,
      avgReadingTime: 15, // minutes
      totalReadingTime: 570, // minutes
      lastStoryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      peakHour: 19, // 7 PM
      weeklyGoal: 3,
      weeklyProgress: 2,
      incompleteStories: 7,
      favoriteDay: 'Saturday'
    };
  }
  
  async mockFetchAchievements(userId, childId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      badges: [
        'First Story',
        'Week Warrior',
        'Story Explorer',
        'Creative Mind',
        'Reading Champion'
      ],
      nextMilestone: '50 Stories Completed',
      progress: 76, // 76% to next milestone
      storiesNeeded: 12,
      levelProgress: 65,
      currentLevel: 'Story Explorer',
      nextLevel: 'Story Master',
      recent: [
        { name: 'Reading Champion', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { name: 'Creative Mind', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
      ]
    };
  }
  
  async mockFetchStreaks(userId, childId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      current: 5,
      longest: 12,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      totalDays: 35,
      streaksLost: 3,
      avgLength: 7
    };
  }
  
  async mockFetchProgress(userId, childId, period) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      stories: period === 'week' ? 2 : 8,
      readingTime: period === 'week' ? 30 : 120, // minutes
      goal: period === 'week' ? 3 : 12,
      comparison: '+20%',
      bestDay: 'Saturday',
      consistency: 71 // percentage
    };
  }
  
  async mockFetchMilestones(userId, childId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      completed: [
        'First Story',
        '10 Stories',
        '25 Stories',
        'Week Streak'
      ],
      upcoming: [
        '50 Stories',
        '100 Stories',
        'Month Streak'
      ],
      next: '50 Stories',
      daysUntil: 15,
      points: 450,
      rank: 'Explorer'
    };
  }
}

// Export singleton instance
module.exports = new EngagementFetcher();

// Also export class for testing
module.exports.EngagementFetcher = EngagementFetcher;