import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function getSessionUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export class AuthError extends Error {}

export async function requireUser(supabase: SupabaseClient): Promise<User> {
  const user = await getSessionUser(supabase);
  if (!user) throw new AuthError("You must be signed in to do this.");
  return user;
}

export function unauthorizedResponse(message = "You must be signed in to do this.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function verifyProjectOwnership(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    return { ok: false, response: NextResponse.json({ error: error.message }, { status: 500 }) };
  }
  if (!project) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Project not found." }, { status: 404 }),
    };
  }
  if (project.user_id !== userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "This project is read-only." },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
}
