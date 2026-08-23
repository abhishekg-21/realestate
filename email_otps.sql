CREATE TABLE public.email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-delete expired OTPs
CREATE INDEX email_otps_email_idx ON public.email_otps(email);
CREATE INDEX email_otps_expires_idx ON public.email_otps(expires_at);

-- No RLS needed — only service role touches this table
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;