import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import { acceptLogin } from "@/libs/auth";

type OAuthResult = {
  accessToken: string;
  member: { _id: string; memberNick: string; memberType: string; memberStatus?: string; memberImage?: string; sellerIntent?: boolean };
};

export default function OAuthCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Completing secure sign-in…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    const ticket = typeof router.query.ticket === "string" ? router.query.ticket : "";
    const next = typeof router.query.next === "string" && router.query.next.startsWith("/") && !router.query.next.startsWith("//") && !router.query.next.includes("\\") ? router.query.next : "/";
    if (!ticket) {
      setMessage("The sign-in link is missing or has expired. Please try again.");
      setFailed(true);
      return;
    }

    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1997").replace(/\/$/, "");
    void fetch(`${apiBase}/auth/oauth/exchange`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "X-Hadijam-CSRF": "1" },
      body: JSON.stringify({ ticket }),
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Secure sign-in could not be completed.");
      const auth = result as OAuthResult;
      await acceptLogin(auth.accessToken, auth.member);
      await router.replace(next);
    }).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Secure sign-in could not be completed.");
      setFailed(true);
    });
  }, [router.isReady, router.query.ticket, router.query.next, router]);

  return (
    <SiteLayout title="Secure sign-in | HaDiJaM">
      <main className="auth-page">
        <section className="auth-card" role="status" aria-live="polite">
          <span className="eyebrow">HADIJAM SECURE ACCESS</span>
          <h1>{failed ? "Sign-in could not be completed" : "Secure sign-in"}</h1>
          <p>{message}</p>
          {failed && <Link className="button button-gold" href="/sign-in?mode=signin">Return to sign in</Link>}
        </section>
      </main>
    </SiteLayout>
  );
}
