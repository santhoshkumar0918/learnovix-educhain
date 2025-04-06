// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const code = searchParams.get("code");

//   if (code) {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
//     const supabase = createClient(supabaseUrl, supabaseAnonKey);

//     await supabase.auth.exchangeCodeForSession(code);
//   }

//   // Redirect to the auth page after processing
//   return NextResponse.redirect(new URL("/auth", request.url));
// }
import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth?error=missing_code", request.url)
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);

      return NextResponse.redirect(
        new URL(`/auth?error=${error.message}`, request.url)
      );
    }

    // Success - redirect to home page

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Unexpected error in callback:", error);

    return NextResponse.redirect(
      new URL("/auth?error=unexpected", request.url)
    );
  }
}
