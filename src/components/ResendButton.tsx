// components/ResendButton.tsx (or inline in your verify-email page)
import { useState } from "react";

export function ResendButton({ onResend }: { onResend: () => Promise<void> }) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    try {
      await onResend();
    } finally {
      setLoading(false);
      // 60-second cooldown after each attempt
      let remaining = 60;
      setCooldown(remaining);
      const timer = setInterval(() => {
        remaining -= 1;
        setCooldown(remaining);
        if (remaining <= 0) clearInterval(timer);
      }, 1000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={cooldown > 0 || loading}
      className="text-sm font-bold text-navy disabled:text-muted disabled:cursor-not-allowed transition-colors"
    >
      {loading
        ? "Sending..."
        : cooldown > 0
          ? `Resend available in ${cooldown}s`
          : "Resend verification email"}
    </button>
  );
}
