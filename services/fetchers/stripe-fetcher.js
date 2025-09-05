/**
 * Stripe Data Fetcher
 * Fetches subscription and payment data from Stripe API
 */

const { SubscriptionStatus } = require('../../models/email-data-models');

class StripeFetcher {
  constructor(stripeClient = null) {
    // Initialize Stripe client
    // In production: this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    this.stripe = stripeClient;
  }
  
  /**
   * Fetch subscription status from Stripe
   */
  async fetchSubscriptionStatus(stripeCustomerId) {
    try {
      if (!stripeCustomerId) {
        return new SubscriptionStatus();
      }
      
      // TODO: Replace with actual Stripe API calls
      // const customer = await this.stripe.customers.retrieve(stripeCustomerId);
      // const subscriptions = await this.stripe.subscriptions.list({
      //   customer: stripeCustomerId,
      //   status: 'all',
      //   limit: 1
      // });
      
      // Mock implementation - replace with real Stripe API call
      const stripeData = await this.mockFetchStripeData(stripeCustomerId);
      
      if (!stripeData.subscription) {
        return new SubscriptionStatus({
          stripeCustomerId
        });
      }
      
      const sub = stripeData.subscription;
      const plan = stripeData.plan;
      
      // Calculate trial days remaining
      let trialDaysRemaining = 0;
      if (sub.trialEnd) {
        const trialEndDate = new Date(sub.trialEnd * 1000);
        const today = new Date();
        trialDaysRemaining = Math.max(0, 
          Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24))
        );
      }
      
      // Calculate lifetime value
      const lifetimeValue = await this.calculateLifetimeValue(stripeCustomerId);
      
      // Get credit usage from metadata or database
      const creditUsage = await this.fetchCreditUsage(stripeCustomerId);
      
      return new SubscriptionStatus({
        subscriptionId: sub.id,
        subscriptionName: plan.name || this.getPlanDisplayName(plan.id),
        subscriptionPrice: this.formatPrice(plan.amount, plan.currency),
        subscriptionStatus: sub.status,
        trialStartDate: sub.trialStart ? new Date(sub.trialStart * 1000) : null,
        trialEndDate: sub.trialEnd ? new Date(sub.trialEnd * 1000) : null,
        trialDaysRemaining: trialDaysRemaining,
        nextBillingDate: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd * 1000) : null,
        creditsRemaining: creditUsage.remaining,
        creditsUsedThisMonth: creditUsage.usedThisMonth,
        monthlyCreditsLimit: creditUsage.monthlyLimit,
        lifetimeValue: lifetimeValue,
        stripeCustomerId: stripeCustomerId,
        paymentMethodLast4: stripeData.paymentMethod?.last4 || null
      });
      
    } catch (error) {
      console.error(`Error fetching Stripe data for ${stripeCustomerId}:`, error);
      return new SubscriptionStatus({
        stripeCustomerId
      });
    }
  }
  
  /**
   * Calculate customer lifetime value
   */
  async calculateLifetimeValue(stripeCustomerId) {
    try {
      // TODO: Replace with actual Stripe API call
      // const charges = await this.stripe.charges.list({
      //   customer: stripeCustomerId,
      //   limit: 100
      // });
      
      // Mock implementation
      const charges = await this.mockFetchCharges(stripeCustomerId);
      
      return charges.reduce((total, charge) => {
        if (charge.paid && charge.status === 'succeeded') {
          return total + (charge.amount / 100); // Convert cents to dollars
        }
        return total;
      }, 0);
      
    } catch (error) {
      console.error(`Error calculating lifetime value:`, error);
      return 0;
    }
  }
  
  /**
   * Fetch credit usage data
   */
  async fetchCreditUsage(stripeCustomerId) {
    try {
      // TODO: This might come from your database rather than Stripe
      // Implement based on your credit tracking system
      
      // Mock implementation
      return {
        remaining: 45,
        usedThisMonth: 15,
        monthlyLimit: 60
      };
      
    } catch (error) {
      console.error(`Error fetching credit usage:`, error);
      return {
        remaining: 0,
        usedThisMonth: 0,
        monthlyLimit: 0
      };
    }
  }
  
  /**
   * Get display name for plan ID
   */
  getPlanDisplayName(planId) {
    const planNames = {
      'sprout_monthly': 'Sprout',
      'tree_monthly': 'Tree',
      'forest_monthly': 'Forest',
      'sprout_annual': 'Sprout Annual',
      'tree_annual': 'Tree Annual',
      'forest_annual': 'Forest Annual',
      'trial': 'Free Trial'
    };
    
    return planNames[planId] || 'Subscription';
  }
  
  /**
   * Format price for display
   */
  formatPrice(amountInCents, currency = 'usd') {
    const amount = amountInCents / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }
  
  /**
   * Fetch upcoming invoice
   */
  async fetchUpcomingInvoice(stripeCustomerId) {
    try {
      // TODO: Replace with actual Stripe API call
      // const invoice = await this.stripe.invoices.retrieveUpcoming({
      //   customer: stripeCustomerId
      // });
      
      // Mock implementation
      const invoice = await this.mockFetchUpcomingInvoice(stripeCustomerId);
      
      return {
        amountDue: this.formatPrice(invoice.amountDue),
        dueDate: new Date(invoice.dueDate * 1000),
        lineItems: invoice.lines.data.map(item => ({
          description: item.description,
          amount: this.formatPrice(item.amount)
        }))
      };
      
    } catch (error) {
      console.error(`Error fetching upcoming invoice:`, error);
      return null;
    }
  }
  
  /**
   * Check if customer has valid payment method
   */
  async hasValidPaymentMethod(stripeCustomerId) {
    try {
      // TODO: Replace with actual Stripe API call
      // const paymentMethods = await this.stripe.paymentMethods.list({
      //   customer: stripeCustomerId,
      //   type: 'card'
      // });
      
      // Mock implementation
      return true;
      
    } catch (error) {
      console.error(`Error checking payment method:`, error);
      return false;
    }
  }
  
  // ============================================
  // MOCK IMPLEMENTATIONS - Replace with real Stripe API calls
  // ============================================
  
  async mockFetchStripeData(stripeCustomerId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      subscription: {
        id: 'sub_mock123',
        status: 'trialing',
        trialStart: Date.now() / 1000 - (7 * 24 * 60 * 60), // 7 days ago
        trialEnd: Date.now() / 1000 + (7 * 24 * 60 * 60), // 7 days from now
        currentPeriodEnd: Date.now() / 1000 + (7 * 24 * 60 * 60)
      },
      plan: {
        id: 'sprout_monthly',
        name: 'Sprout Plan',
        amount: 999, // $9.99 in cents
        currency: 'usd',
        interval: 'month'
      },
      paymentMethod: {
        last4: '4242',
        brand: 'visa'
      }
    };
  }
  
  async mockFetchCharges(stripeCustomerId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return [
      { amount: 999, paid: true, status: 'succeeded' },
      { amount: 999, paid: true, status: 'succeeded' },
      { amount: 999, paid: true, status: 'succeeded' }
    ];
  }
  
  async mockFetchUpcomingInvoice(stripeCustomerId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      amountDue: 999,
      dueDate: Date.now() / 1000 + (7 * 24 * 60 * 60),
      lines: {
        data: [
          {
            description: 'Sprout Plan - Monthly Subscription',
            amount: 999
          }
        ]
      }
    };
  }
}

// Export singleton instance
module.exports = new StripeFetcher();

// Also export class for testing
module.exports.StripeFetcher = StripeFetcher;