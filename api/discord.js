export default async function handler(req, res) {
  try {
    const uid = (req.query.uid || "").toString();
    if (!uid) return res.status(400).json({ ok: false, error: "Missing uid" });

    const r = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(uid)}`, {
      headers: { "user-agent": "bio/1.0" },
    });

    const j = await r.json();
    const d = j?.data;
    if (!d) return res.status(200).json({ ok: false });

    const u = d.discord_user || {};
    const name = u.global_name || u.username || "User";

    // avatar
    let avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    if (u.id && u.avatar) {
      const ext = u.avatar.startsWith("a_") ? "gif" : "png";
      avatar = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`;
    } else if (u.discriminator) {
      const idx = (Number(u.discriminator) || 0) % 5;
      avatar = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    }

    // activity
    const acts = Array.isArray(d.activities) ? d.activities : [];
    const nonCustom = acts.find(a => a && a.name && a.type !== 4);
    const custom = acts.find(a => a && a.name && a.type === 4);
    const activity = nonCustom || custom || null;

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      ok: true,
      name,
      status: d.discord_status || "offline",
      avatar,
      activity: activity ? { name: activity.name, details: activity.details || activity.state || "" } : null,
      spotify: d.spotify ? {
        song: d.spotify.song,
        artist: d.spotify.artist,
        album: d.spotify.album,
        album_art_url: d.spotify.album_art_url
      } : null
    });
  } catch (e) {
    return res.status(200).json({ ok: false });
  }
}
