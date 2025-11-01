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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Invalid token or user not found');
    }

    // Get request body
    const { plan, billing, priceId, successUrl, cancelUrl } = await req.json();

    // Plan ve billing'den priceId'yi belirle ya da direkt priceId kullan
    let finalPriceId = priceId;
    
    if (!finalPriceId && plan && billing) {
      // Plan ve billing'den priceId mapping'i
      // TODO: Replace these with your actual Stripe Price IDs from your Stripe Dashboard
      const PLAN_TO_PRICE_ID: Record<string, Record<string, string>> = {
        'silver': {
          'monthly': 'price_1QSNw4P5YF3DuQzx8kE3HQRE', // Silver Monthly Price ID
          'yearly': 'price_silver_yearly'                // TODO: Replace with actual Silver Yearly Price ID
        },
        'gold': {
          'monthly': 'price_1QSNw5P5YF3DuQzxwQB3KZVU', // Gold Monthly Price ID
          'yearly': 'price_gold_yearly'                  // TODO: Replace with actual Gold Yearly Price ID
        },
        'platinum': {
          'monthly': 'price_1QSNw6P5YF3DuQzxMNOP4RST', // Platinum Monthly Price ID
          'yearly': 'price_platinum_yearly'              // TODO: Replace with actual Platinum Yearly Price ID
        }
      };
      
      finalPriceId = PLAN_TO_PRICE_ID[plan]?.[billing];
    }

    if (!finalPriceId) {
      throw new Error('Price ID could not be determined from plan/billing or direct priceId');
    }

    console.log('Creating checkout session for user:', user.id, 'plan:', plan, 'billing:', billing, 'finalPriceId:', finalPriceId);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${new URL(req.url).origin}/upgrades?success=true`,
      cancel_url: cancelUrl || `${new URL(req.url).origin}/upgrades?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email || '',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email || '',
        },
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});