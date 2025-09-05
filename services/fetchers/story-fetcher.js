/**
 * Story Data Fetcher
 * Fetches story data, history, and recommendations
 */

const { StoryMetadata, StoryRecommendations } = require('../../models/email-data-models');

class StoryFetcher {
  constructor(dbConnection = null) {
    this.db = dbConnection;
  }
  
  /**
   * Fetch details for a specific story
   */
  async fetchStoryDetails(storyId) {
    try {
      // TODO: Replace with actual database query
      // Example: SELECT * FROM stories WHERE id = ?
      
      // Mock implementation
      const story = await this.mockFetchStory(storyId);
      
      if (!story) {
        return null;
      }
      
      return new StoryMetadata({
        storyId: story.id,
        storyTitle: story.title,
        storyTheme: story.theme,
        storyPreviewText: story.preview,
        readingTime: `${story.estimatedReadingTime} minutes`,
        ageRange: story.ageRange,
        createdDate: story.createdAt,
        completedDate: story.completedAt,
        storyLink: this.generateStoryLink(story.id),
        coverImageUrl: story.coverImage,
        keyLesson: story.keyLesson,
        educationalTopics: story.educationalTopics || [],
        characterNames: story.characters || [],
        isCompleted: story.isCompleted,
        isFavorite: story.isFavorite,
        shareCount: story.shareCount
      });
      
    } catch (error) {
      console.error(`Error fetching story ${storyId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch story history for a child
   */
  async fetchStoryHistory(childId, limit = 10) {
    try {
      // TODO: Replace with actual database query
      // Example: SELECT * FROM stories WHERE child_id = ? ORDER BY created_at DESC LIMIT ?
      
      // Mock implementation
      const stories = await this.mockFetchStoryHistory(childId, limit);
      
      return stories.map(story => new StoryMetadata({
        storyId: story.id,
        storyTitle: story.title,
        storyTheme: story.theme,
        storyPreviewText: story.preview,
        readingTime: `${story.estimatedReadingTime} minutes`,
        ageRange: story.ageRange,
        createdDate: story.createdAt,
        completedDate: story.completedAt,
        storyLink: this.generateStoryLink(story.id),
        coverImageUrl: story.coverImage,
        isCompleted: story.isCompleted,
        isFavorite: story.isFavorite
      }));
      
    } catch (error) {
      console.error(`Error fetching story history for ${childId}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch the last story created/read
   */
  async fetchLastStory(childId) {
    try {
      const history = await this.fetchStoryHistory(childId, 1);
      return history[0] || null;
    } catch (error) {
      console.error(`Error fetching last story for ${childId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch trending stories across the platform
   */
  async fetchTrendingStories(limit = 5) {
    try {
      // TODO: Replace with actual database query
      // Example: SELECT theme, COUNT(*) as count FROM stories 
      //          WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      //          GROUP BY theme ORDER BY count DESC LIMIT ?
      
      // Mock implementation
      const trending = await this.mockFetchTrending(limit);
      
      return trending;
      
    } catch (error) {
      console.error(`Error fetching trending stories:`, error);
      return [];
    }
  }
  
  /**
   * Generate story recommendations
   */
  async generateRecommendations(childProfile, storyHistory, trending, limit = 3) {
    try {
      if (!childProfile) {
        return new StoryRecommendations();
      }
      
      // Analyze child's interests and reading history
      const themes = this.analyzePreferences(childProfile, storyHistory);
      
      // Get age-appropriate topics
      const ageTopics = this.getAgeAppropriateTopics(childProfile.childAge);
      
      // Generate personalized recommendations
      const suggestions = await this.generateSuggestions(
        themes,
        ageTopics,
        childProfile.interests,
        limit
      );
      
      return new StoryRecommendations({
        recommendedThemes: themes.slice(0, 5),
        trendingStoryTypes: trending.map(t => t.type),
        ageAppropriateTopics: ageTopics,
        suggestedStories: suggestions,
        personalizedCategories: this.getPersonalizedCategories(childProfile),
        nextStoryIdeas: this.generateStoryIdeas(childProfile, storyHistory)
      });
      
    } catch (error) {
      console.error(`Error generating recommendations:`, error);
      return new StoryRecommendations();
    }
  }
  
  /**
   * Analyze child's preferences from history
   */
  analyzePreferences(childProfile, storyHistory) {
    const themes = {};
    
    // Count themes from history
    storyHistory.forEach(story => {
      if (story.storyTheme) {
        themes[story.storyTheme] = (themes[story.storyTheme] || 0) + 1;
        if (story.isFavorite) {
          themes[story.storyTheme] += 2; // Weight favorites more
        }
      }
    });
    
    // Add child's stated interests
    childProfile.favoriteThemes.forEach(theme => {
      themes[theme] = (themes[theme] || 0) + 3;
    });
    
    // Sort by frequency and return top themes
    return Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme);
  }
  
  /**
   * Get age-appropriate topics
   */
  getAgeAppropriateTopics(age) {
    if (!age) return ['Adventure', 'Friendship', 'Family'];
    
    const topicsByAge = {
      '3-4': ['Animals', 'Colors', 'Shapes', 'Family', 'Bedtime'],
      '5-6': ['Friendship', 'Adventure', 'School', 'Nature', 'Imagination'],
      '7-8': ['Mystery', 'Science', 'Sports', 'Fantasy', 'Problem-Solving'],
      '9-10': ['History', 'Space', 'Detective', 'Mythology', 'Technology'],
      '11+': ['Time Travel', 'Complex Mysteries', 'Social Issues', 'Epic Adventures']
    };
    
    if (age <= 4) return topicsByAge['3-4'];
    if (age <= 6) return topicsByAge['5-6'];
    if (age <= 8) return topicsByAge['7-8'];
    if (age <= 10) return topicsByAge['9-10'];
    return topicsByAge['11+'];
  }
  
  /**
   * Generate specific story suggestions
   */
  async generateSuggestions(themes, ageTopics, interests, limit) {
    // TODO: Implement ML-based or rule-based recommendation engine
    
    const suggestions = [];
    const templates = [
      {
        title: 'The {interest} Adventure',
        emoji: '🌟',
        description: 'Explore the world of {interest} in this exciting journey'
      },
      {
        title: '{theme} Mystery',
        emoji: '🔍',
        description: 'Solve puzzles and uncover secrets about {theme}'
      },
      {
        title: 'The Brave {interest} Explorer',
        emoji: '🚀',
        description: 'Discover new worlds through {interest} and courage'
      }
    ];
    
    for (let i = 0; i < limit && i < templates.length; i++) {
      const template = templates[i];
      const interest = interests[i % interests.length] || 'adventure';
      const theme = themes[i % themes.length] || 'friendship';
      
      suggestions.push({
        title: template.title.replace('{interest}', interest).replace('{theme}', theme),
        emoji: template.emoji,
        description: template.description.replace('{interest}', interest).replace('{theme}', theme)
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get personalized categories
   */
  getPersonalizedCategories(childProfile) {
    const categories = [];
    
    if (childProfile.interests.includes('animals')) {
      categories.push('Animal Adventures');
    }
    if (childProfile.interests.includes('space')) {
      categories.push('Space Exploration');
    }
    if (childProfile.interests.includes('dragons')) {
      categories.push('Dragon Tales');
    }
    if (childProfile.readingLevel === 'advanced') {
      categories.push('Chapter Books');
    }
    
    // Add default categories
    categories.push('New This Week', 'Bedtime Stories', 'Quick Reads');
    
    return categories.slice(0, 6);
  }
  
  /**
   * Generate story ideas based on profile
   */
  generateStoryIdeas(childProfile, storyHistory) {
    const ideas = [];
    
    // Based on upcoming events
    const today = new Date();
    const month = today.getMonth();
    
    if (month === 11) { // December
      ideas.push('A Winter Wonderland Adventure');
    }
    if (month === 9) { // October
      ideas.push('The Friendly Halloween Monster');
    }
    
    // Based on interests not yet explored
    const exploredThemes = storyHistory.map(s => s.storyTheme);
    childProfile.interests.forEach(interest => {
      if (!exploredThemes.includes(interest)) {
        ideas.push(`Discover the World of ${interest}`);
      }
    });
    
    // Educational ideas
    if (childProfile.childAge >= 6) {
      ideas.push('Learn About Different Cultures');
      ideas.push('Science Experiment Gone Fun!');
    }
    
    return ideas.slice(0, 3);
  }
  
  /**
   * Generate story link
   */
  generateStoryLink(storyId) {
    const baseUrl = process.env.APP_BASE_URL || 'https://storybud.com';
    return `${baseUrl}/stories/${storyId}`;
  }
  
  // ============================================
  // MOCK IMPLEMENTATIONS - Replace with real database queries
  // ============================================
  
  async mockFetchStory(storyId) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: storyId,
      title: 'The Magical Forest Adventure',
      theme: 'Adventure',
      preview: 'Join Emma on an incredible journey through an enchanted forest where she discovers the power of friendship and courage...',
      estimatedReadingTime: 10,
      ageRange: '5-7',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      coverImage: 'https://example.com/cover.jpg',
      keyLesson: 'The importance of helping friends and being brave',
      educationalTopics: ['Friendship', 'Problem-solving', 'Nature'],
      characters: ['Emma', 'Sparkle the Unicorn', 'Wise Owl'],
      isCompleted: true,
      isFavorite: true,
      shareCount: 3
    };
  }
  
  async mockFetchStoryHistory(childId, limit) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stories = [];
    const themes = ['Adventure', 'Fantasy', 'Mystery', 'Friendship', 'Science'];
    const titles = [
      'The Dragon\'s Secret',
      'Space Explorer Emma',
      'The Mystery of the Missing Cookie',
      'Best Friends Forever',
      'The Time Machine Adventure'
    ];
    
    for (let i = 0; i < limit && i < 5; i++) {
      stories.push({
        id: `story_${i + 1}`,
        title: titles[i],
        theme: themes[i],
        preview: `An exciting story about ${themes[i].toLowerCase()}...`,
        estimatedReadingTime: 8 + i,
        ageRange: '5-7',
        createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        completedAt: i < 3 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null,
        coverImage: `https://example.com/cover${i}.jpg`,
        isCompleted: i < 3,
        isFavorite: i === 0 || i === 2
      });
    }
    
    return stories;
  }
  
  async mockFetchTrending(limit) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return [
      { type: 'Dragon Adventures', count: 150 },
      { type: 'Space Exploration', count: 120 },
      { type: 'Friendship Stories', count: 100 },
      { type: 'Mystery Solving', count: 90 },
      { type: 'Animal Tales', count: 85 }
    ].slice(0, limit);
  }
}

// Export singleton instance
module.exports = new StoryFetcher();

// Also export class for testing
module.exports.StoryFetcher = StoryFetcher;