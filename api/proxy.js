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

    console.log("Raw request body:", body);

    if (!body) {
      console.error("Empty request body");
      return res.status(400).json({ error: "Empty request body" });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log("Parsed request body:", parsedBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }

    const SUPABASE_URL =
      "https://gazxtyurtygfcsydesxx.supabase.co/rest/v1/test";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_ANON_KEY env variable");
      return res.status(500).json({ error: "Missing Supabase anon key" });
    }

    console.log("Forwarding request to Supabase...");

    const supabaseResponse = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedBody),
    });

    console.log("Supabase response status:", supabaseResponse.status);

    // FIX: Only parse JSON if there's a response body
    let data = null;
    const text = await supabaseResponse.text();

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Could not parse Supabase response as JSON:", e.message);
      data = text;
    }

    console.log("Supabase response data:", data);
    res.status(supabaseResponse.status).json({ result: data });
  } catch (error) {
    console.error("Proxy failed with error:", error.message);
    res.status(500).json({ error: "Proxy failed", details: error.message });
  }
}
