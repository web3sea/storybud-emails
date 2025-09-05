/**
 * User Data Fetcher
 * Fetches user, child, and family data from the database
 */

const { UserProfile, ChildProfile, FamilyData } = require('../../models/email-data-models');

class UserFetcher {
  constructor(dbConnection = null) {
    // Database connection - replace with your actual database client
    this.db = dbConnection;
  }
  
  /**
   * Fetch user profile from database
   */
  async fetchUserProfile(userId) {
    try {
      // TODO: Replace with actual database query
      // Example query: SELECT * FROM users WHERE id = ?
      
      // Mock implementation - replace with real database call
      const userData = await this.mockFetchUser(userId);
      
      return new UserProfile({
        userId: userData.id,
        userName: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
        userEmail: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountCreatedDate: userData.createdAt,
        lastLoginDate: userData.lastLoginAt,
        timezone: userData.timezone,
        preferredLanguage: userData.language,
        stripeCustomerId: userData.stripeCustomerId,
        primaryChildId: userData.primaryChildId
      });
      
    } catch (error) {
      console.error(`Error fetching user profile for ${userId}:`, error);
      // Return default user profile with minimal data
      return new UserProfile({ userId });
    }
  }
  
  /**
   * Fetch child profile from database
   */
  async fetchChildProfile(childId, userId = null) {
    try {
      // TODO: Replace with actual database query
      // Example query: SELECT * FROM children WHERE id = ? AND (parent_id = ? OR ?)
      
      // Mock implementation - replace with real database call
      const childData = await this.mockFetchChild(childId, userId);
      
      if (!childData) {
        return new ChildProfile({ childId });
      }
      
      // Calculate age from birth date
      const age = childData.birthDate ? 
        this.calculateAge(new Date(childData.birthDate)) : null;
      
      return new ChildProfile({
        childId: childData.id,
        childName: childData.name,
        childAge: age,
        birthDate: childData.birthDate,
        interests: childData.interests || [],
        readingLevel: childData.readingLevel,
        favoriteThemes: childData.favoriteThemes || [],
        avatarUrl: childData.avatarUrl,
        parentUserId: childData.parentId || userId
      });
      
    } catch (error) {
      console.error(`Error fetching child profile for ${childId}:`, error);
      return new ChildProfile({ childId });
    }
  }
  
  /**
   * Fetch family data including all children profiles
   */
  async fetchFamilyData(userId) {
    try {
      // TODO: Replace with actual database query
      // Example query: 
      // SELECT * FROM children WHERE parent_id = ?
      // SELECT COUNT(*) as shared_count FROM stories WHERE shared = true AND user_id = ?
      
      // Mock implementation - replace with real database call
      const familyData = await this.mockFetchFamily(userId);
      
      // Fetch all child profiles
      const childProfiles = await Promise.all(
        familyData.childIds.map(childId => 
          this.fetchChildProfile(childId, userId)
        )
      );
      
      return new FamilyData({
        familyMembersCount: childProfiles.length + 1, // +1 for parent
        childProfiles: childProfiles,
        sharedStoriesCount: familyData.sharedStoriesCount || 0,
        favoriteCoauthor: familyData.favoriteCoauthor,
        familyReadingGoal: familyData.familyReadingGoal,
        familyAchievements: familyData.achievements || []
      });
      
    } catch (error) {
      console.error(`Error fetching family data for ${userId}:`, error);
      return new FamilyData({
        familyMembersCount: 1
      });
    }
  }
  
  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // ============================================
  // MOCK IMPLEMENTATIONS - Replace with real DB calls
  // ============================================
  
  async mockFetchUser(userId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock user data
    return {
      id: userId,
      email: 'user@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2024-12-20'),
      timezone: 'America/New_York',
      language: 'en',
      stripeCustomerId: 'cus_mock123456',
      primaryChildId: 'child_001'
    };
  }
  
  async mockFetchChild(childId, userId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock child data
    return {
      id: childId,
      name: 'Emma',
      birthDate: new Date('2018-06-15'),
      interests: ['dragons', 'space', 'friendship', 'animals'],
      readingLevel: 'intermediate',
      favoriteThemes: ['adventure', 'fantasy', 'mystery'],
      avatarUrl: 'https://example.com/avatar.png',
      parentId: userId
    };
  }
  
  async mockFetchFamily(userId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock family data
    return {
      childIds: ['child_001', 'child_002'],
      sharedStoriesCount: 15,
      favoriteCoauthor: 'Grandma',
      familyReadingGoal: 5,
      achievements: ['Family Reader', 'Story Sharers']
    };
  }
}

// Export singleton instance
module.exports = new UserFetcher();

// Also export class for testing
module.exports.UserFetcher = UserFetcher;