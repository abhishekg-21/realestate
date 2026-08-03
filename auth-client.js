window.PNAuth = {
  client() {
    const url = window.PN_SUPABASE_URL;
    const key = window.PN_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes("YOUR_SUPABASE") || key.includes("YOUR_SUPABASE")) {
      throw new Error("Add your Supabase Project URL and anon key in supabase-config.js first.");
    }
    if (!window.__pnSupabase) window.__pnSupabase = window.supabase.createClient(url, key);
    return window.__pnSupabase;
  },
  redirect(path) {
    window.location.href = path;
  },
  async requireUser() {
    const { data } = await this.client().auth.getUser();
    if (!data.user) this.redirect("login.html");
    return data.user;
  },
  message(element, text, kind = "success") {
    element.textContent = text;
    element.className = `message ${kind}`;
  }
};

// Supabase automatically exchanges a confirmation/recovery link for a session.
// When a user returns from an email-confirmation link, take them straight to their account.
if (window.location.pathname.endsWith("/verify-email.html")) {
  try {
    window.PNAuth.client().auth.getSession().then(({ data }) => {
      if (data.session) window.PNAuth.redirect("user-dashboard.html");
    });
  } catch (_) {
    // The verification page still displays a helpful configuration error on form submit.
  }
}
