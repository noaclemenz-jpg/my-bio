// In-memory counter (resets sometimes on serverless cold starts).
// Good enough for “nice views count”. If you want permanent views,
// I’ll swap this to Upstash Redis in 2 minutes.
let views = 0;

export default function handler(req, res) {
  views += 1;
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ views });
}
