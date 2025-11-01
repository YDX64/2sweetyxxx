import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new (await import('https://esm.sh/stripe@14.21.0')).Stripe(
  Deno.env.get('STRIPE_SECRET_KEY') || '',
  { apiVersion: '2023-10-16' }
);

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Price ID'lerini tier'lara map et
const PRICE_ID_TO_TIER: Record<string, string> = {
  // Monthly price IDs
  'price_1QSNw4P5YF3DuQzx8kE3HQRE': 'silver',  // Silver monthly
  'price_1QSNw5P5YF3DuQzxwQB3KZVU': 'gold',    // Gold monthly
  'price_1QSNw6P5YF3DuQzxMNOP4RST': 'platinum', // Platinum monthly
  
  // Yearly price IDs (placeholder - replace with actual)
  'price_silver_yearly': 'silver',
  'price_gold_yearly': 'gold',
  'price_platinum_yearly': 'platinum',
  
  // Legacy/fallback mappings
  'price_silver_monthly': 'silver',
  'price_gold_monthly': 'gold',
  'price_platinum_monthly': 'platinum',
};

async function updateUserSubscription(userId: string, email: string, tier: string, subscriptionId: string, periodEnd: number) {
  try {
    console.log(`🔔 Updating subscription for user ${userId} (${email}) to ${tier}`);
    
    const expiresAt = new Date(periodEnd * 1000).toISOString();
    
    // 1. Profiles tablosunu güncelle - use the new function that syncs both fields
    const { error: profileError } = await supabase.rpc('update_user_subscription', {
      p_user_id: userId,
      p_tier: tier,
      p_status: 'active'
    });

    if (profileError) {
      console.error('❌ Profile update error:', profileError);
      throw profileError;
    }

    // 2. Subscriptions tablosunu güncelle (varsa)
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'active',
        subscription_tier: tier,
        current_period_end: expiresAt,
        stripe_subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      });

    if (subscriptionsError) {
      console.error('❌ Subscriptions table error:', subscriptionsError);
    }

    // 3. Subscribers tablosunu güncelle
    const { error: subscribersError } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: email,
        subscribed: true,
        subscription_tier: tier,
        subscription_end: expiresAt,
        updated_at: new Date().toISOString()
      });

    if (subscribersError) {
      console.error('❌ Subscribers table error:', subscribersError);
    }

    console.log(`✅ Subscription updated successfully for ${email} → ${tier}`);
    return true;

  } catch (error) {
    console.error('❌ Update subscription error:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const userId = subscription.metadata?.user_id;
    const email = subscription.metadata?.user_email || subscription.customer_email;
    
    if (!userId) {
      console.error('❌ No user_id in subscription metadata');
      return false;
    }

    // Price ID'den tier'ı bul
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = PRICE_ID_TO_TIER[priceId];
    
    if (!tier) {
      console.error('❌ Unknown price ID:', priceId);
      return false;
    }

    await updateUserSubscription(
      userId,
      email,
      tier,
      subscription.id,
      subscription.current_period_end
    );

    return true;
  } catch (error) {
    console.error('❌ Handle subscription created error:', error);
    return false;
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log('🔔 Checkout session completed:', JSON.stringify(session, null, 2));
    
    const userId = session.metadata?.user_id;
    const email = session.customer_details?.email || session.metadata?.user_email;
    
    if (!userId) {
      console.error('❌ No user_id in checkout session metadata');
      return false;
    }

    // Subscription mode kontrolü
    if (session.mode !== 'subscription') {
      console.log('ℹ️ Not a subscription checkout, skipping');
      return true;
    }

    // Subscription ID'yi al
    const subscriptionId = session.subscription;
    if (!subscriptionId) {
      console.error('❌ No subscription ID in checkout session');
      return false;
    }

    // Subscription detaylarını al
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('🔔 Subscription details:', JSON.stringify(subscription, null, 2));
    
    // Price ID'den tier'ı bul
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = PRICE_ID_TO_TIER[priceId];
    
    console.log('🔔 Price ID:', priceId, 'Tier:', tier);
    
    if (!tier) {
      console.error('❌ Unknown price ID:', priceId);
      console.log('🔔 Available price mappings:', PRICE_ID_TO_TIER);
      return false;
    }

    await updateUserSubscription(
      userId,
      email,
      tier,
      subscription.id,
      subscription.current_period_end
    );

    return true;
  } catch (error) {
    console.error('❌ Handle checkout session completed error:', error);
    return false;
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) {
      console.log('ℹ️ No subscription ID in invoice');
      return false;
    }

    // Subscription'ı al
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const userId = subscription.metadata?.user_id;
    const email = subscription.metadata?.user_email || invoice.customer_email;
    
    if (!userId) {
      console.error('❌ No user_id in subscription metadata');
      return false;
    }

    // Price ID'den tier'ı bul
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = PRICE_ID_TO_TIER[priceId];
    
    if (!tier) {
      console.error('❌ Unknown price ID:', priceId);
      return false;
    }

    await updateUserSubscription(
      userId,
      email,
      tier,
      subscription.id,
      subscription.current_period_end
    );

    return true;
  } catch (error) {
    console.error('❌ Handle invoice payment succeeded error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response('No signature', { status: 400 });
    }

    // Webhook signature'ı doğrula
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('🔔 Webhook event received:', event.type);
    console.log('🔔 Full event data:', JSON.stringify(event.data.object, null, 2));

    let handled = false;

    // Event tipine göre işle
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🔔 Processing checkout.session.completed event');
        handled = await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        console.log('🔔 Processing customer.subscription.created event');
        handled = await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        console.log('🔔 Processing customer.subscription.updated event');
        handled = await handleSubscriptionCreated(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('🔔 Processing invoice.payment_succeeded event');
        handled = await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.succeeded':
        // Mobile payment intent başarılı olduğunda
        const paymentIntent = event.data.object;
        const { user_id, plan, billing, user_email } = paymentIntent.metadata;
        
        if (user_id && plan) {
          // Create subscription based on payment
          const interval = billing === 'yearly' ? 'year' : 'month';
          const priceData = {
            currency: 'usd',
            product_data: {
              name: `${plan} Plan`,
            },
            unit_amount: paymentIntent.amount,
            recurring: { interval }
          };
          
          // Create subscription for the customer
          const subscription = await stripe.subscriptions.create({
            customer: paymentIntent.customer,
            items: [{ price_data: priceData }],
            metadata: {
              user_id: user_id,
              user_email: user_email
            }
          });
          
          // Update user subscription
          await updateUserSubscription(
            user_id,
            user_email,
            plan,
            subscription.id,
            subscription.current_period_end
          );
          
          handled = true;
        }
        break;

      case 'customer.subscription.deleted':
        // Abonelik iptal edildi
        const canceledSub = event.data.object;
        const canceledUserId = canceledSub.metadata?.user_id;
        
        if (canceledUserId) {
          // Use the sync function to ensure both fields are updated
          await supabase.rpc('update_user_subscription', {
            p_user_id: canceledUserId,
            p_tier: 'registered',
            p_status: 'canceled'
          });
          
          handled = true;
        }
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        handled = true; // Bilinmeyen event'ler için 200 döndür
    }

    if (handled) {
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    } else {
      return new Response('Event not handled', { 
        status: 400,
        headers: corsHeaders
      });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    });
  }
});