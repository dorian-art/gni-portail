module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id, table } = req.query;
  if (!id) return res.status(400).json({ error: "Missing: id" });

  const dbTable = table === "prospects" ? "prospects" : "clients";
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://niueqiwxhljhouqsjqqx.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY not configured" });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${dbTable}?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: "Supabase error" });
    if (!data || data.length === 0) return res.status(404).json({ error: "Not found" });
    res.status(200).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
