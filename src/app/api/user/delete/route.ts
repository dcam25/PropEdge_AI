import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured for account deletion" }, { status: 500 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete user error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete account" },
      { status: 500 }
    );
  }
}
