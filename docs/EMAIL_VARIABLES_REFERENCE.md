# Email Variables Reference Guide

## Overview
This document provides a complete reference for all available variables that can be used in StoryBud email templates. Variables are dynamically replaced with actual data when emails are sent.

## Variable Syntax
Variables use double curly braces: `{{variable_name}}`

### Filters
Variables support filters for formatting:
- `{{variable|default:"fallback"}}` - Provide fallback value
- `{{variable|uppercase}}` - Convert to uppercase
- `{{variable|lowercase}}` - Convert to lowercase
- `{{variable|capitalize}}` - Capitalize first letter
- `{{variable|truncate:50}}` - Truncate to 50 characters
- `{{variable|date:"format"}}` - Format date (short/long/time)
- `{{variable|possessive}}` - Add possessive apostrophe
- `{{count|pluralize:"story,stories"}}` - Pluralize based on count

## Variable Categories

### 1. User Data Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{user_name}}` | User's full name | Database | "Friend" | "Sarah Johnson" |
| `{{user_email}}` | User's email address | Database | "" | "sarah@example.com" |
| `{{first_name}}` | User's first name | Database | "" | "Sarah" |
| `{{last_name}}` | User's last name | Database | "" | "Johnson" |
| `{{greeting}}` | Time-based greeting | Computed | "Hello" | "Good morning" |

### 2. Child Profile Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{child_name}}` | Child's name | Database | "your little reader" | "Emma" |
| `{{child_age}}` | Child's age | Database | null | "7" |
| `{{child_age_ordinal}}` | Age with ordinal | Computed | "" | "7th" |
| `{{child_name_possessive}}` | Possessive form | Computed | "" | "Emma's" |
| `{{child_interests}}` | List of interests | Database | "adventures and learning" | "dragons, space, friendship" |
| `{{reading_level}}` | Current reading level | Database | "beginner" | "intermediate" |
| `{{favorite_themes}}` | Favorite story themes | Database | [] | "Adventure, Fantasy" |

### 3. Subscription & Billing Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{subscription_name}}` | Plan name | Stripe | "Free Trial" | "Sprout" |
| `{{subscription_price}}` | Monthly price | Stripe | "$9.99" | "$14.99" |
| `{{subscription_status}}` | Current status | Stripe | "trial" | "active" |
| `{{trial_days_remaining}}` | Days left in trial | Stripe | "7" | "3" |
| `{{trial_message}}` | Trial urgency message | Computed | "" | "3 days left!" |
| `{{next_billing_date}}` | Next charge date | Stripe | "soon" | "January 15, 2025" |
| `{{credits_remaining}}` | Story credits left | Database | "10" | "45" |
| `{{credits_used_this_month}}` | Credits used | Database | "0" | "15" |
| `{{monthly_credits_limit}}` | Monthly limit | Stripe | "60" | "100" |
| `{{lifetime_value}}` | Total spent | Stripe | "0" | "$89.91" |

### 4. Reading Activity Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{stories_created}}` | Total stories created | Database | "0" | "45" |
| `{{stories_completed}}` | Stories finished | Database | "0" | "38" |
| `{{total_stories_completed}}` | Same as above | Database | "0" | "38" |
| `{{reading_streak}}` | Current streak days | Database | "0" | "5" |
| `{{longest_streak}}` | Best streak | Database | "0" | "12" |
| `{{avg_reading_time}}` | Average per story | PostHog | "15" | "18" |
| `{{average_reading_time}}` | Formatted version | PostHog | "15 minutes" | "18 minutes" |
| `{{total_reading_time}}` | Total time read | PostHog | "0" | "570" |
| `{{days_since_last_story}}` | Days inactive | Computed | "a few" | "2" |
| `{{peak_reading_hour}}` | Best reading time | PostHog | "evening" | "7 PM" |
| `{{favorite_reading_day}}` | Most active day | PostHog | null | "Saturday" |
| `{{stories_started_not_finished}}` | Incomplete stories | Database | "0" | "7" |

### 5. Weekly/Monthly Progress Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{weekly_reading_goal}}` | Weekly target | Database | "3" | "5" |
| `{{weekly_reading_progress}}` | Stories this week | Database | "0" | "2" |
| `{{progress_percentage}}` | Goal completion % | Computed | "0" | "67" |
| `{{stories_remaining}}` | To reach goal | Computed | "3" | "1" |
| `{{weekly_status}}` | Progress message | Computed | "Just getting started" | "Almost there!" |
| `{{weekly_status_color}}` | Status color | Computed | "#8B5CF6" | "#10B981" |

### 6. Story Content Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{story_title}}` | Current story title | Database | "Your Personalized Adventure" | "The Dragon's Quest" |
| `{{last_story_title}}` | Previous story | Database | "your latest adventure" | "Space Explorer Emma" |
| `{{story_preview_text}}` | Story preview | Database | "An exciting story awaits..." | "Join Emma as she..." |
| `{{story_theme}}` | Story category | Database | "Adventure" | "Mystery" |
| `{{reading_time}}` | Estimated duration | Database | "10 minutes" | "12 minutes" |
| `{{key_lesson}}` | Educational value | Database | "importance of imagination" | "teamwork and courage" |
| `{{educational_topics}}` | Learning areas | Database | [] | "Problem-solving, Nature" |
| `{{story_link}}` | Link to story | Computed | "#" | "https://storybud.com/..." |

### 7. Achievement & Gamification Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{badges_earned}}` | List of badges | Database | "First Steps" | "Explorer, Champion" |
| `{{total_badges}}` | Badge count | Database | "1" | "5" |
| `{{next_milestone}}` | Upcoming achievement | Database | "First Story" | "50 Stories" |
| `{{stories_until_next_badge}}` | Stories needed | Computed | "1" | "12" |
| `{{reading_level_progress}}` | Level progression % | Database | "0" | "65" |
| `{{current_level}}` | Current level name | Database | "Beginner Reader" | "Story Explorer" |
| `{{next_level}}` | Next level name | Database | "Story Explorer" | "Story Master" |
| `{{level_description}}` | Progress description | Computed | "just getting started" | "almost there!" |

### 8. Engagement Metrics Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{favorite_story_theme}}` | Most read theme | PostHog | "Adventure" | "Fantasy" |
| `{{email_open_rate}}` | Email engagement % | PostHog | "0" | "72" |
| `{{email_click_rate}}` | Click rate % | PostHog | "0" | "28" |
| `{{app_sessions_this_week}}` | App usage | PostHog | "0" | "5" |
| `{{engagement_trend}}` | Activity trend | PostHog | "stable" | "increasing" |

### 9. Family & Social Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{family_members_count}}` | Family size | Database | "1" | "3" |
| `{{shared_stories_count}}` | Stories shared | Database | "0" | "15" |
| `{{favorite_coauthor}}` | Co-creator | Database | null | "Grandma" |
| `{{family_reading_goal}}` | Family goal | Database | null | "10 stories/week" |

### 10. Recommendation Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{recommended_themes}}` | Suggested themes | Algorithm | ["Adventure", "Friendship"] | ["Dragons", "Space"] |
| `{{trending_story_types}}` | Popular now | PostHog | ["Adventure Stories"] | ["Mystery Tales"] |
| `{{age_appropriate_topics}}` | Age-based | Computed | ["Friendship", "Learning"] | ["Science", "History"] |
| `{{suggested_story_1_title}}` | Next story 1 | Algorithm | "The Castle of Kind Hearts" | "Dragon's Mystery" |
| `{{suggested_story_1_desc}}` | Description 1 | Algorithm | "Discover kindness" | "Solve puzzles..." |
| `{{story_1_emoji}}` | Emoji 1 | Algorithm | "🏰" | "🐉" |
| `{{suggested_story_2_title}}` | Next story 2 | Algorithm | "The Starlight Detective" | "Space Adventure" |
| `{{suggested_story_2_desc}}` | Description 2 | Algorithm | "Solve mysteries" | "Explore galaxies..." |
| `{{story_2_emoji}}` | Emoji 2 | Algorithm | "🌟" | "🚀" |
| `{{suggested_story_3_title}}` | Next story 3 | Algorithm | "The Butterfly Garden" | "Ocean Explorer" |
| `{{suggested_story_3_desc}}` | Description 3 | Algorithm | "Discover nature" | "Underwater journey..." |
| `{{story_3_emoji}}` | Emoji 3 | Algorithm | "🦋" | "🌊" |

### 11. Discussion & Interaction Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{question_1}}` | Discussion prompt 1 | Computed | "What was your favorite part?" | Custom question |
| `{{question_2}}` | Discussion prompt 2 | Computed | "How did the character show courage?" | Custom question |
| `{{question_3}}` | Discussion prompt 3 | Computed | "What would you have done?" | Custom question |

### 12. Special Occasion Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{is_birthday}}` | Birthday flag | Computed | false | true |
| `{{birthday_date}}` | Birth date | Database | null | "June 15" |
| `{{days_until_birthday}}` | Countdown | Computed | null | "7" |
| `{{holiday_name}}` | Current holiday | Computed | null | "Halloween" |
| `{{seasonal_theme}}` | Current season | Computed | "Spring" | "Winter" |
| `{{birthday_story_title}}` | Birthday story | Computed | "Birthday Adventure" | "Emma's 8th Birthday" |
| `{{birthday_story_emoji}}` | Birthday emoji | Computed | "🎪" | "🎂" |
| `{{birthday_gift}}` | Birthday reward | Computed | "100 bonus credits" | Special offer |

### 13. Link & URL Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{main_cta_link}}` | Primary action | Computed | "#" | Story creation URL |
| `{{create_story_link}}` | Create story | Computed | "#" | With tracking params |
| `{{browse_stories_link}}` | Browse library | Computed | "#" | Library URL |
| `{{create_next_story_link}}` | Next story | Computed | "#" | Creation URL |
| `{{profile_link}}` | User profile | Computed | "#" | Profile URL |
| `{{settings_link}}` | Settings page | Computed | "#" | Settings URL |
| `{{feedback_link}}` | Feedback form | Computed | "#" | Feedback URL |
| `{{upgrade_link}}` | Upgrade page | Computed | "#" | Pricing URL |
| `{{unsubscribe_link}}` | Unsubscribe | Computed | "#" | Unsubscribe URL |
| `{{birthday_story_link}}` | Birthday story | Computed | "#" | Special story URL |
| `{{claim_gift_link}}` | Claim reward | Computed | "#" | Gift claim URL |
| `{{save_memory_link}}` | Save memory | Computed | "#" | Memory save URL |
| `{{logo_url}}` | Logo image | Config | "https://i.imgur.com/UHKz2jA.png" | CDN URL |

### 14. Campaign & Offer Variables

| Variable | Description | Data Source | Fallback | Example |
|----------|-------------|-------------|----------|---------|
| `{{special_offer.headline}}` | Offer title | Campaign | "Welcome Back Offer" | "Holiday Special" |
| `{{special_offer.discount}}` | Discount amount | Campaign | "50% off" | "25% off" |
| `{{special_offer.duration}}` | Offer period | Campaign | "first month" | "3 months" |
| `{{special_offer.code}}` | Promo code | Campaign | "WELCOME50" | "HOLIDAY25" |
| `{{special_offer.expires}}` | Expiry date | Campaign | In 7 days | "December 31" |

## Data Sources

### Database
- User account table
- Child profiles table
- Stories table
- Reading activity table
- Achievements table

### Stripe API
- Subscription status
- Payment history
- Credit usage
- Billing dates

### PostHog Analytics
- User behavior metrics
- Email engagement
- Reading patterns
- Feature usage

### Computed/Derived
- Calculated from other data
- Time-based values
- Formatted strings
- Contextual messages

## Template-Specific Variables

Different email templates may have access to different sets of variables:

### Onboarding Emails
- Focus on user setup variables
- Trial information
- Getting started content

### Retention Emails
- Reading activity metrics
- Progress tracking
- Achievement data

### Re-engagement Emails
- Inactivity metrics
- Special offers
- Win-back content

### Birthday Emails
- Age-specific content
- Birthday rewards
- Celebration messages

## Testing Variables

Use these commands to test variable rendering:

```javascript
// Preview template with sample data
const engine = new TemplateEngine();
const preview = await engine.preview('template_name', {
  user_name: 'Test User',
  child_name: 'Test Child',
  // ... other test data
});

// Render for specific user
const rendered = await engine.render('template_name', userId, {
  childId: 'child_001',
  includeRecommendations: true
});
```

## Best Practices

1. **Always use fallbacks**: `{{variable|default:"fallback value"}}`
2. **Test with missing data**: Ensure templates work when data is unavailable
3. **Use semantic variable names**: Clear, descriptive names
4. **Document new variables**: Update this reference when adding variables
5. **Validate data types**: Ensure correct data types for formatting
6. **Consider email client compatibility**: Test rendered output across clients

## Troubleshooting

### Variable not rendering
- Check variable name spelling
- Verify data source is configured
- Check fallback is working
- Review console logs for errors

### Incorrect formatting
- Verify filter syntax
- Check data type compatibility
- Test filter separately

### Missing data
- Check data fetcher modules
- Verify API connections
- Review fallback configuration

## Support

For questions about variables or data access:
- Review fetcher modules in `/services/fetchers/`
- Check transformer in `/services/transformers/`
- Consult template engine in `/services/template-engine.js`