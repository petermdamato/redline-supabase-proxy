export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const SUPABASE_URL = "https://gazxtyurtygfcsydesxx.supabase.co/rest/v1/test";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Missing Supabase anon key" });
  }

  try {
    const supabaseResponse = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await supabaseResponse.json();
    res.status(supabaseResponse.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy failed", details: error.message });
  }
}
