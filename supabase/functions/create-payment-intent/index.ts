import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { tokenPackage } = await req.json();
    
    // Define token packages
    const packages = {
      basic: { tokens: 100, price: 4000 }, // $40 for 100 tokens
      premium: { tokens: 250, price: 8000 }, // $80 for 250 tokens
      ultimate: { tokens: 500, price: 14000 }, // $140 for 500 tokens
    };

    const selectedPackage = packages[tokenPackage as keyof typeof packages];
    if (!selectedPackage) {
      throw new Error("Invalid token package");
    }

    // Get or create Stripe customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedPackage.price,
      currency: "usd",
      customer: customerId,
      metadata: {
        user_id: user.id,
        tokens: selectedPackage.tokens.toString(),
        package: tokenPackage,
      },
    });

    // Record payment in database
    await supabaseClient.from("payments").insert({
      user_id: user.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: selectedPackage.price,
      status: "pending",
      tokens_purchased: selectedPackage.tokens,
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        amount: selectedPackage.price,
        tokens: selectedPackage.tokens,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});