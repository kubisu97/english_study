import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const slots = [
    {
      slot: "takuro",
      name: "拓郎",
      email: process.env.TAKURO_LOGIN_EMAIL ?? "takuro@english-quest.app",
      password: process.env.TAKURO_INITIAL_PASSWORD ?? "takuro123"
    },
    {
      slot: "kazumi",
      name: "和美",
      email: process.env.KAZUMI_LOGIN_EMAIL ?? "kazumi@english-quest.app",
      password: process.env.KAZUMI_INITIAL_PASSWORD ?? "kazumi123"
    }
  ];

  const { data: existingUsers } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });

  for (const slot of slots) {
    const existing = existingUsers?.users.find((user) => user.email === slot.email);

    let userId = existing?.id;

    if (!existing) {
      const created = await admin.auth.admin.createUser({
        email: slot.email,
        password: slot.password,
        email_confirm: true,
        user_metadata: {
          slot: slot.slot,
          display_name: slot.name
        }
      });

      userId = created.data.user?.id;
    }

    if (!userId) {
      continue;
    }

    await admin.from("profiles").upsert(
      {
        id: userId,
        slot: slot.slot,
        display_name: slot.name
      },
      { onConflict: "id" }
    );

    await admin.from("study_progress").upsert(
      {
        user_id: userId,
        vocabulary_index: 0,
        grammar_index: 0,
        grammar_score: 0,
        conversation_history: [
          {
            role: "ai",
            text: "Hi! Press the mic and answer in simple English. I will help you say it more naturally."
          }
        ]
      },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ ok: true });
}
