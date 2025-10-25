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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Invalid token or user not found');
    }

    const { plan, billing } = await req.json();

    // Plan ve billing'den price belirle
    const PLAN_TO_PRICE: Record<string, Record<string, number>> = {
      'silver': {
        'monthly': 999,  // $9.99
        'yearly': 9999   // $99.99
      },
      'gold': {
        'monthly': 1999, // $19.99
        'yearly': 19999  // $199.99
      },
      'platinum': {
        'monthly': 2999, // $29.99
        'yearly': 29999  // $299.99
      }
    };

    const amount = PLAN_TO_PRICE[plan]?.[billing];
    if (!amount) {
      throw new Error('Invalid plan or billing cycle');
    }

    // Check if customer exists
    let customer;
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(profile.stripe_customer_id);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });

      // Save customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id);
    }

    // Create ephemeral key for mobile
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' }
    );

    // Create payment intent instead of checkout session for mobile
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        plan: plan,
        billing: billing,
        user_email: user.email || ''
      }
    });

    // Create subscription after payment
    // This will be handled by webhook when payment succeeds

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating mobile checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});