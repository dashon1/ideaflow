import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // Parse event manually to handle application-specific logic
    try {
      const stripe = await getUncachableStripeClient();
      const event = JSON.parse(payload.toString());

      await WebhookHandlers.handleStripeEvent(event);
    } catch (error) {
      console.error('Error processing webhook event:', error);
    }
  }

  static async handleStripeEvent(event: any): Promise<void> {
    const { type, data } = event;

    switch (type) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutComplete(data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await WebhookHandlers.handleSubscriptionUpdate(data.object);
        break;

      case 'customer.subscription.deleted':
        await WebhookHandlers.handleSubscriptionCancelled(data.object);
        break;

      case 'invoice.paid':
        await WebhookHandlers.handleInvoicePaid(data.object);
        break;

      default:
        console.log(`Unhandled event type: ${type}`);
    }
  }

  static async handleCheckoutComplete(session: any): Promise<void> {
    const { metadata, mode, customer } = session;

    if (!metadata?.userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    const userId = metadata.userId;

    if (metadata.type === 'credit_purchase') {
      // One-time credit purchase
      const credits = parseInt(metadata.credits || '0');
      const bonusCredits = parseInt(metadata.bonusCredits || '0');
      const totalCredits = credits + bonusCredits;

      if (totalCredits > 0) {
        await storage.addCredits(
          userId,
          totalCredits,
          `Purchased ${metadata.packageName || 'credits'} via Stripe`,
          { sessionId: session.id, customer }
        );
        console.log(`Added ${totalCredits} credits to user ${userId}`);
      }
    } else if (metadata.type === 'subscription') {
      // Subscription started
      await storage.updateUser(userId, {
        subscriptionTier: metadata.tierId || 'starter',
        subscriptionStatus: 'active',
        stripeCustomerId: customer,
      });

      // Add monthly credits
      const monthlyCredits = parseInt(metadata.monthlyCredits || '500');
      await storage.addCredits(
        userId,
        monthlyCredits,
        `Monthly credits for ${metadata.tierId} subscription`,
        { sessionId: session.id }
      );
      console.log(`Activated ${metadata.tierId} subscription for user ${userId}`);
    }
  }

  static async handleSubscriptionUpdate(subscription: any): Promise<void> {
    const { customer, status, metadata } = subscription;

    // Find user by stripe customer id
    const user = await storage.getUserByStripeCustomerId(customer);
    if (!user) {
      console.log(`No user found for customer ${customer}`);
      return;
    }

    await storage.updateUser(user.id, {
      subscriptionStatus: status === 'active' ? 'active' : 'cancelled',
      stripeSubscriptionId: subscription.id,
    });
    console.log(`Updated subscription status for user ${user.id}: ${status}`);
  }

  static async handleSubscriptionCancelled(subscription: any): Promise<void> {
    const { customer } = subscription;

    const user = await storage.getUserByStripeCustomerId(customer);
    if (!user) {
      console.log(`No user found for customer ${customer}`);
      return;
    }

    await storage.updateUser(user.id, {
      subscriptionStatus: 'cancelled',
      subscriptionTier: 'starter',
    });
    console.log(`Cancelled subscription for user ${user.id}`);
  }

  static async handleInvoicePaid(invoice: any): Promise<void> {
    const { customer, subscription } = invoice;

    if (!subscription) return; // Only handle subscription invoices

    const user = await storage.getUserByStripeCustomerId(customer);
    if (!user) {
      console.log(`No user found for customer ${customer}`);
      return;
    }

    // Add monthly credits for recurring subscription
    const tierCredits: Record<string, number> = {
      starter: 500,
      professional: 1500,
      enterprise: 5000,
    };

    const credits = tierCredits[user.subscriptionTier] || 500;
    await storage.addCredits(
      user.id,
      credits,
      `Monthly subscription credits (${user.subscriptionTier})`,
      { invoiceId: invoice.id }
    );
    console.log(`Added ${credits} monthly credits to user ${user.id}`);
  }
}