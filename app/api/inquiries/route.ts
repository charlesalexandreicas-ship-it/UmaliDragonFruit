import { getDb } from "../../../db";
import { inquiries } from "../../../db/schema";
import { env } from "cloudflare:workers";

type Payload = Record<string, unknown>;

function clean(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    if (clean(payload.website) || Number(payload.startedAt) > Date.now() - 1400) {
      return Response.json({ error: "Please wait a moment and try again." }, { status: 429 });
    }
    const name = clean(payload.name);
    const email = clean(payload.email).toLowerCase();
    const consent = payload.consent === true;
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !consent) {
      return Response.json({ error: "Please complete the required fields and consent." }, { status: 400 });
    }
    const inquiryType = clean(payload.inquiryType, 30) || "order";
    const details = JSON.stringify(
      Object.fromEntries(
        Object.entries(payload)
          .filter(([key]) => !["website", "startedAt", "consent"].includes(key))
          .map(([key, value]) => [key, clean(value, 1200)])
      )
    );
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inquiry_type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    const db = getDb();
    const [saved] = await db
      .insert(inquiries)
      .values({
        inquiryType,
        name,
        email,
        phone: clean(payload.phone),
        company: clean(payload.company),
        location: clean(payload.location),
        details,
      })
      .returning({ id: inquiries.id });
    return Response.json({ id: saved.id }, { status: 201 });
  } catch (error) {
    console.error("Inquiry save failed", error);
    return Response.json({ error: "Your inquiry could not be saved. Please try again." }, { status: 500 });
  }
}
