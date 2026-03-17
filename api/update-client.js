module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, table, data } = req.body;
  if (!id || !data) return res.status(400).json({ error: "Missing: id or data" });

  const dbTable = table === "prospects" ? "prospects" : "clients";
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://niueqiwxhljhouqsjqqx.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not configured" });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${dbTable}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
