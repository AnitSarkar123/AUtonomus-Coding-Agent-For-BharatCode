"use client";

import { authClient } from "@/lib/auth-client";
import Icon from "@/components/Icon";

export function SignInButton() {
  const { data: session } = authClient.useSession();

  if (session?.user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img
          src={session.user.image || "/default-avatar.png"}
          alt={session.user.name || "User"}
          style={{ width: 24, height: 24, borderRadius: "50%" }}
        />
        <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => authClient.signOut()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "var(--fg-faint)",
            borderRadius: 3,
            lineHeight: 1,
          }}
          title="Sign out"
        >
          <Icon name="log-out" size={13} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/" })}
      className="pill"
      style={{ display: "flex", alignItems: "center", gap: 6 }}
    >
      <Icon name="github" size={13} />
      <span>Sign in with GitHub</span>
    </button>
  );
}