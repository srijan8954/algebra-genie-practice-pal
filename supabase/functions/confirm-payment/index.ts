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

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { payment_intent_id } = await req.json();

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === "succeeded") {
      const tokens = parseInt(paymentIntent.metadata.tokens);

      // Update payment status
      await supabaseClient
        .from("payments")
        .update({ status: "completed" })
        .eq("stripe_payment_intent_id", payment_intent_id)
        .eq("user_id", user.id);

      // Add tokens to user's account
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("tokens_remaining")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        await supabaseClient
          .from("profiles")
          .update({
            tokens_remaining: profile.tokens_remaining + tokens,
          })
          .eq("user_id", user.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          tokens_added: tokens,
          message: `Successfully added ${tokens} tokens to your account!`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Update payment status to failed
      await supabaseClient
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", payment_intent_id)
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment was not successful",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});