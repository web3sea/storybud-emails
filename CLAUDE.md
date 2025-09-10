# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains email templates for StoryBud, a personalized children's storytelling platform. StoryBud creates AI-powered, illustrated storybooks featuring children as the main characters. The email templates support user onboarding, engagement, retention, and educational campaigns.

## Repository Structure

```
/templates/              # HTML email templates
  - onboarding_*.html    # Welcome and first-story emails
  - storytime_*.html     # Daily engagement series (7-day cycle)
  - retention_*.html     # Weekly/monthly engagement emails
  - churn_recovery*.html # Re-engagement campaigns
  - trial_welcome_*.html # Trial user onboarding
  - power_user_*.html    # Advanced user features

/docs/                   # Comprehensive email guidelines
  - EMAIL_GMAIL_COMPATIBILITY_GUIDE.md
  - EMAIL_ACCESSIBILITY_GUIDE.md
  - EMAIL_RESPONSIVENESS_GUIDE.md
  - EMAIL_DARK_MODE_GUIDE.md
  - EMAIL_READABILITY_GUIDE.md
  - Brand Guidelines_Colors_Fonts_Background.md

/assets/                 # Images and resources
/scripts/                # Utility scripts
```

## Architecture & Design Patterns

### Email Template Architecture
- **Table-based layouts** using `role="presentation"` for maximum email client compatibility
- **Inline CSS styling** (no external stylesheets or `<style>` blocks for Gmail compatibility)
- **Progressive enhancement** approach with fallbacks for image blocking
- **Mobile-first responsive design** using single-column layouts that stack naturally

### Brand Color System
- Primary: Purple (#8B5CF6), Indigo (#6366F1), Violet (#7C3AED)
- Secondary: Warm Gold (#FCD34D), Soft Pink (#F9A8D4), Sky Blue (#7DD3FC), Mint Green (#6EE7B7)
- Neutrals: Charcoal (#1F2937), Slate (#475569), Light Gray (#F3F4F6), White (#FFFFFF)

### Template Naming Convention
Templates follow the pattern: `[campaign_type]_[specific_purpose]_[audience]_[environment].html`
- campaign_type: onboarding, storytime, retention, churn_recovery, etc.
- audience: dm (direct mail), md (multi-demographic), etc.  
- environment: uat (user acceptance testing), prod (production)

## Email Development Standards

### HTML Structure Requirements
- Use semantic `<table role="presentation">` layouts
- Include proper DOCTYPE and email-specific meta tags
- Add Outlook-specific conditional comments (`<!--[if mso]-->`)
- Implement proper email header structure with preheader text

### CSS Guidelines
- **Inline styles only** - no external CSS or `<style>` blocks
- Use email-safe font stacks: Arial, sans-serif for body; Trebuchet MS for headlines
- Implement bulletproof buttons using nested table structures
- Include VML fallbacks for Outlook gradient backgrounds

### Accessibility Standards
- Minimum 4.5:1 color contrast ratio
- Descriptive alt text for all images
- Semantic HTML structure with proper heading hierarchy  
- Touch targets minimum 44px for mobile devices
- Role attributes for presentation tables

### Email Client Compatibility
**Primary targets:**
- Gmail (web, mobile app, iOS, Android)
- Outlook (2016, 2019, Office 365)
- Apple Mail (iOS, macOS)
- Yahoo Mail

**Key compatibility considerations:**
- Gmail strips `<style>` blocks and many CSS properties
- Outlook requires table-based layouts and VML for backgrounds
- Mobile clients need single-column responsive designs
- Dark mode support using CSS media queries and meta tags

## Development Workflow

### File Management
- Templates are standalone HTML files with no build process
- Images are hosted externally (StoryBud CDN)
- No package.json, build scripts, or dependency management
- Version control through Git with descriptive commit messages

### Testing Process  
1. **Validation**: HTML syntax validation
2. **Browser preview**: Open .html template files directly in web browsers to test visual changes
3. **Visual verification**: Confirm text contrast, layout, and styling render correctly
4. **Email testing**: Use email testing services (Litmus, Email on Acid)
5. **Client testing**: Send test emails to target email clients
6. **Mobile testing**: Verify responsive behavior on actual devices
7. **Accessibility testing**: Screen reader and keyboard navigation testing

**REQUIRED**: Always open template .html files in a browser before committing changes to verify visual appearance and readability.

### Quality Checklist
Before deploying any template:
- [ ] Brand colors and fonts correctly applied
- [ ] Mobile responsive single-column layout
- [ ] All images have descriptive alt text
- [ ] CTAs are prominent and accessible (44px+ touch targets)
- [ ] Gmail compatibility (inline styles, table layout)
- [ ] Outlook compatibility (VML fallbacks, proper spacing)
- [ ] Dark mode support implemented
- [ ] Links functional with proper tracking
- [ ] Unsubscribe link included
- [ ] HTML validates without errors

## Brand Voice & Content

### Tone Guidelines
- **Warm and encouraging**: "You're doing amazing!"
- **Playfully professional**: Balance fun with reliability
- **Imaginative yet trustworthy**: "Spark imagination, build confidence"
- **Inclusive and welcoming**: Use diverse examples and inclusive language

### Key Messages
- "Every child deserves their own story"
- "Inspire lifelong readers"  
- "Personalized adventures, unlimited possibilities"
- Focus on child development and family bonding

### Email Types & Purposes
- **Onboarding**: Welcome new users, guide first story creation
- **Storytime Series**: Daily 7-day engagement encouraging regular reading
- **Retention**: Weekly/monthly check-ins with reading progress
- **Educational**: Parent-focused content about child development benefits
- **Re-engagement**: Win-back campaigns for inactive users
- **Premium**: Upgrade messaging highlighting advanced features

## Subscription Plans & Pricing

### Current StoryBud Pricing Structure (Credit-Based System)
- **Sprout Plan**: $9.99/month = 600 credits/month (~6 stories)
- **Bloom Plan**: $19.99/month = 1400 credits/month (~14 stories)
- **Wonder Plan**: $39.99/month = 3200 credits/month (~32 stories) - "Most Popular"
- **Flourish Plan**: $79.99/month = 7200 credits/month (~72 stories) - "Best Value"

### Trial Structure
- **Free Trial**: 7 days with limited credits (160 + 120 additional credits)
- **Post-Trial**: Automatically continues to selected subscription plan
- **Important**: No "unlimited" story creation during trial - credit-based system applies

### Email Messaging Guidelines for Pricing
- **Avoid**: "Unlimited stories during trial" or "unlimited creation"
- **Use**: "Explore premium features with your trial credits"
- **Focus on**: Quality over quantity, premium features, value proposition
- **Emphasize**: Professional illustrations, AI voice narration, story saves, personalization

## Content Management

### Standardized Footer System
All email templates use a standardized footer with dynamic variables:
- **Tagline**: "Every child deserves their own story." (consistent across all templates)
- **Sign-off**: "Happy storytelling!" and "The StoryBud Team" (standardized)
- **Dynamic Links**: `{{contactUsLink}}`, `{{privacyPolicyLink}}`, `{{termsOfServiceLink}}`, `{{unsubscribeLink}}`, `{{companyAddress}}`
- **Template File**: `/footer-standard.html` contains the master footer structure

### Personalization Tokens
Templates support dynamic content insertion:
- `{{child_name}}` - Child's name with fallbacks
- `{{parent_name}}` - Parent/guardian name
- `{{stories_created}}` - Number of stories created
- `{{reading_streak}}` - Days of consecutive reading
- `{{contactUsLink}}` - Support/contact page URL
- `{{privacyPolicyLink}}` - Privacy policy page URL
- `{{termsOfServiceLink}}` - Terms of service page URL  
- `{{unsubscribeLink}}` - Unsubscribe URL
- `{{companyAddress}}` - Company mailing address

### Image Strategy
- Illustrations preferred over photographs
- Diverse representation in all imagery
- Optimized file sizes (<100KB total email size)
- Hosted on reliable CDN with proper alt text fallbacks
- Background color fallbacks for blocked images

This repository focuses on email template development without traditional build tools, emphasizing email client compatibility, accessibility, and brand consistency for StoryBud's family-focused audience.