import { storage } from './storage';
import { getUncachableStripeClient } from './stripeClient';

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string,
    mode: 'subscription' | 'payment' = 'payment'
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCreditPurchaseSession(
    customerId: string,
    creditPackage: { name: string; priceUsd: number; credits: number; bonusCredits: number },
    successUrl: string,
    cancelUrl: string,
    userId: string
  ) {
    const stripe = await getUncachableStripeClient();
    
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: creditPackage.name,
            description: `${creditPackage.credits} credits + ${creditPackage.bonusCredits} bonus credits`,
          },
          unit_amount: Math.round(creditPackage.priceUsd * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        packageName: creditPackage.name,
        credits: creditPackage.credits.toString(),
        bonusCredits: creditPackage.bonusCredits.toString(),
        type: 'credit_purchase',
      },
    });
  }

  async createSubscriptionSession(
    customerId: string,
    tierId: string,
    successUrl: string,
    cancelUrl: string,
    userId: string
  ) {
    const stripe = await getUncachableStripeClient();
    
    const tierPrices: Record<string, { amount: number; credits: number; name: string }> = {
      starter: { amount: 4900, credits: 750, name: 'Starter Plan' },
      professional: { amount: 9900, credits: 2000, name: 'Professional Plan' },
      enterprise: { amount: 24900, credits: 6000, name: 'Enterprise Plan' },
    };

    const tier = tierPrices[tierId];
    if (!tier) {
      throw new Error('Invalid tier');
    }

    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: tier.name,
            description: `${tier.credits} credits per month`,
          },
          unit_amount: tier.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        tierId,
        monthlyCredits: tier.credits.toString(),
        type: 'subscription',
      },
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
}

export const stripeService = new StripeService();