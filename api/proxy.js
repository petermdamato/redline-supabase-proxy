import { parseStringPromise } from "xml2js";

export default async function handler(req, res) {
  console.log("=== New Request Received ===");
  console.log("Request method:", req.method);

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  let body = "";

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks).toString();

    console.log("Raw request body (XML):", body);

    if (!body) {
      console.error("Empty request body");
      return res.status(400).json({ error: "Empty request body" });
    }

    // Store the raw XML string directly
    const record = {
      xml_data: body, // Store the raw XML string
      received_at: new Date().toISOString(),
    };

    // Send to Supabase
    const SUPABASE_URL =
      "https://gazxtyurtygfcsydesxx.supabase.co/rest/v1/test";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_ANON_KEY env variable");
      return res.status(500).json({ error: "Missing Supabase anon key" });
    }

    console.log("Storing raw XML data in Supabase");

    const supabaseResponse = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(record),
    });

    const text = await supabaseResponse.text();
    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Supabase response is not JSON:", e.message);
      data = text;
    }

    console.log("Supabase response:", data);
    res.status(supabaseResponse.status).json({ result: data });
  } catch (error) {
    console.error("Handler error:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
