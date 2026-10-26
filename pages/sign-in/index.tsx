import { withAuthCookieLock } from "@/libs/auth";
import { acceptLogin } from "@/libs/auth";
import { setAuthValue } from "@/libs/auth";
import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import {
  SUBMIT_APPLICATION,
  uploadSellerDocument,
  saveSellerDraft,
  clearSellerDraft,
} from "@/libs/graphql/sellerApproval";
import { LOGIN, SIGNUP } from "@/libs/graphql/auth";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

type AccountType = "USER" | "SELLER";
type SocialProvider = "google" | "facebook";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.58-5.14 3.58-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-3c-1.08.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.76-4.97H1.24v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.24 14.26a7.2 7.2 0 0 1 0-4.52v-3.1H1.24a12 12 0 0 0 0 10.72l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.8L20 3.15C17.95 1.23 15.23 0 12 0A12 12 0 0 0 1.24 6.64l4 3.1C6.2 6.89 8.86 4.77 12 4.77Z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.71 4.54-4.71 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.28h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07Z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [register, setRegister] = useState(true);
  const [accountType, setAccountType] = useState<AccountType>("USER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useMutation(LOGIN);
  const [signup] = useMutation(SIGNUP);
  const [submitApplication] = useMutation(SUBMIT_APPLICATION);

  useEffect(() => {
    if (router.isReady && router.query.mode === "signin") setRegister(false);
    if (router.isReady && router.query.mode === "signup") setRegister(true);
    if (router.isReady && typeof router.query.oauth_error === "string") {
      const messages: Record<string, string> = {
        provider_not_configured: "This sign-in provider is not configured yet.",
        provider_cancelled: "Sign-in was cancelled. You can try again.",
        invalid_callback: "The sign-in response was incomplete. Please try again.",
        invalid_state: "The sign-in session expired. Please try again.",
        provider_verification_failed: "The provider could not verify your account. Please try again.",
      };
      setError(messages[router.query.oauth_error] ?? "Social sign-in could not be completed.");
    }
  }, [router.isReady, router.query.mode, router.query.oauth_error]);

  const returnPath = () => {
    const next = router.query.next;
    return typeof next === "string" &&
      next.startsWith("/") &&
      !next.startsWith("//")
      ? next
      : "/";
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const input = {
      memberNick: String(form.get("memberNick") ?? "").trim(),
      memberPassword: String(form.get("memberPassword") ?? ""),
    };
    try {
      const result = await withAuthCookieLock(() => register
        ? signup({
            context: { skipSessionRefresh: true },
            variables: {
              input: {
                ...input,
                memberFullName: input.memberNick,
                memberPhone: String(form.get("memberPhone") ?? "").trim(),
                memberType: accountType,
                sellerIntent: accountType === "SELLER",
              },
            },
          })
        : login({ variables: { input }, context: { skipSessionRefresh: true } }));
      const member = result.data?.[register ? "signup" : "login"];
      if (!member?.accessToken)
        throw new Error(
          register
            ? "Account creation did not return a sign-in token. Please try again."
            : "Sign-in did not return an authentication token. Please try again.",
        );
      await acceptLogin(member.accessToken, member);

      if (register && accountType === "SELLER") {
        const draft = {
          businessName: String(form.get("businessName")).trim(),
          businessAddress: String(form.get("businessAddress")).trim(),
          idDocumentId: "",
          businessDocumentId: "",
        };
        saveSellerDraft(draft);
        try {
          const idFile = form.get("idDocument") as File;
          const businessFile = form.get("businessDocument") as File;
          if (idFile?.size) draft.idDocumentId = await uploadSellerDocument(idFile);
          if (businessFile?.size) draft.businessDocumentId = await uploadSellerDocument(businessFile);
          saveSellerDraft(draft);
          await submitApplication({ variables: { input: {...draft, idDocumentId: draft.idDocumentId || null, businessDocumentId: draft.businessDocumentId || null} } });
          clearSellerDraft();
          window.alert(
            "Please wait. Your seller application is being reviewed by our administrator. We will notify you as soon as a decision is made.",
          );
        } catch (uploadError) {
          const reason =
            uploadError instanceof Error
              ? uploadError.message
              : "Please try again.";
          window.alert(
            `Your user account was created, but your seller application was NOT submitted. ${reason} Continue from My Page; your uploaded documents and business details have been saved for retry.`,
          );
        }
        await router.push("/my-page?tab=messages");
        return;
      }
      setSuccess(
        register
          ? "Your account was created and you are now signed in."
          : "You are now signed in.",
      );
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      await router.push(returnPath());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not complete your request.",
      );
    } finally {
      setBusy(false);
    }
  };

  const startSocialAuth = (provider: SocialProvider) => {
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1997").replace(/\/$/, "");
    const destination = new URL(`${apiBase}/auth/oauth/${provider}`);
    destination.searchParams.set("next", returnPath());
    if (register && accountType === "SELLER") destination.searchParams.set("seller", "1");
    window.location.assign(destination.toString());
  };

  return (
    <SiteLayout title="Private client access | HaDiJaM">
      <section className="auth-page">
        <aside className="auth-story">
          <div className="auth-story-brand">
            <img src="/images/stitch/brand/diamond-mark.png" alt="" />
            <span>
              <strong>HaDiJaM</strong>
              <small>MAISON DE HAUTE ORFÈVRERIE</small>
            </span>
          </div>
          <div className="eyebrow">
            <span /> BESPOKE PRIVATE SALON VAULT
          </div>
          <h1>
            Where High Jewelry
            <br />
            Meets{" "}
            <em>
              Uncompromising
              <br />
              Trust.
            </em>
          </h1>
          <p>
            Join an exclusive circle of collectors and master ateliers, with
            sovereign hallmarked treasures and personal care.
          </p>
          <article className="auth-seal-card">
            <img
              src="/images/stitch/account/hadijam-sign-in-sign-up-ro-yxatdan-o-tish-va-kirish-sovereign-official-gold-metrological-assay-seal-coin-stamped-with-luxury-102.jpg"
              alt="Gold assay seal from the HaDiJaM Stitch design"
            />
            <div>
              <span className="eyebrow">✺ STATE METROLOGY GUARANTEED</span>
              <h2>Assay Office &amp; GIA Escrow Vault</h2>
              <p>
                Every gold, carat and gem independently appraised and recorded
                on the sovereign ledger.
              </p>
            </div>
          </article>
          <div className="auth-trust-row">
            <div>
              <b>✧</b>
              <strong>100% CERTIFIED</strong>
              <span>State Proba Assay</span>
            </div>
            <div>
              <b>♙</b>
              <strong>BANK ESCROW</strong>
              <span>Zero-Risk Transit</span>
            </div>
            <div>
              <b>↗</b>
              <strong>VIP CONCIERGE</strong>
              <span>Private Salon View</span>
            </div>
          </div>
          <div className="auth-story-foot">
            <span>
              ◉ &nbsp;Curated by HaDiJaM Council
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp; Geneva · Tashkent · Seoul
            </span>
            <b>MAISON SÉCURISÉ</b>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-heading">
            <div>
              <span className="eyebrow">PRIVATE PORTAL ACCESS</span>
              <h2>{register ? "Create Your Account" : "Welcome Back"}</h2>
              <p>
                {register
                  ? "Unlock fine bespoke jewelry, metrological verifications, and private auctions."
                  : "Sign in to your private HaDiJaM salon account."}
              </p>
            </div>
            <div
              className="auth-mode"
              role="tablist"
              aria-label="Account access mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={register}
                className={register ? "active" : ""}
                onClick={() => {
                  setRegister(true);
                  setError("");
                  setSuccess("");
                }}
              >
                Sign Up
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!register}
                className={!register ? "active" : ""}
                onClick={() => {
                  setRegister(false);
                  setError("");
                  setSuccess("");
                }}
              >
                Sign In
              </button>
            </div>
          </div>

          {register && (
            <div className="auth-roles">
              <span className="auth-field-caption">
                ACCOUNT PRIVILEGE CLASSIFICATION
              </span>
              <div>
                <button
                  type="button"
                  className={accountType === "USER" ? "selected" : ""}
                  aria-pressed={accountType === "USER"}
                  onClick={() => setAccountType("USER")}
                >
                  <b>♙</b>
                  <span>
                    <strong>Collector / Buyer</strong>
                    <small>Private salon acquisition</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={accountType === "SELLER" ? "selected" : ""}
                  aria-pressed={accountType === "SELLER"}
                  onClick={() => setAccountType("SELLER")}
                >
                  <b>⚒</b>
                  <span>
                    <strong>Master Jeweler</strong>
                    <small>Certified atelier showcase</small>
                  </span>
                </button>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
            {register && (
              <label>
                <span className="auth-field-caption">FULL NAME OR DISPLAY NAME</span>
                <input
                  name="memberNick"
                  minLength={3}
                  maxLength={100}
                  autoComplete="name"
                  required
                  placeholder="Enter your full name or preferred name"
                />
              </label>
            )}
            {register && (
              <label>
                <span className="auth-field-caption">
                  DIRECT MOBILE &amp; VAULT VERIFICATION
                </span>
                <input
                  name="memberPhone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+998 90 123 45 67"
                />
              </label>
            )}
            {!register && (
              <label className="auth-username">
                <span className="auth-field-caption">USERNAME OR FULL NAME</span>
                <input
                  name="memberNick"
                  minLength={3}
                  maxLength={100}
                  autoComplete="username"
                  required
                  placeholder="Your username or full name"
                />
              </label>
            )}
            <label className="auth-password">
              <span className="auth-field-caption">PASSWORD</span>
              <div className="auth-password-control">
                <input
                  name="memberPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete={register ? "new-password" : "current-password"}
                  minLength={5}
                  maxLength={72}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </button>
              </div>
            </label>
            {register && accountType === "SELLER" && (
              <>
                <label>
                  Business name
                  <input
                    name="businessName"
                    minLength={2}
                    maxLength={150}
                    required
                  />
                </label>
                <label>
                  Business address
                  <input
                    name="businessAddress"
                    minLength={5}
                    maxLength={500}
                    required
                  />
                </label>
                <label>
                  ID document (optional · PDF, JPG or PNG, up to 10 MB)
                  <input
                    name="idDocument"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                  />
                </label>
                <label>
                  Business registration document (optional · PDF, JPG or PNG, up to 10 MB)
                  <input
                    name="businessDocument"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                  />
                </label>
                <p>
                  Document upload is optional. Your seller account will be activated automatically after a short review.
                </p>
              </>
            )}
            {register && (
              <label className="auth-consent">
                <input type="checkbox" required />
                <span>
                  I agree to the <b>HaDiJaM Metrological Assays Protocol</b>,
                  Escrow Guarantee, and data confidentiality protection.
                </span>
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="form-success" role="status">
                {success}
              </p>
            )}
            <button className="button button-gold auth-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : register
                  ? "Create Exclusive Account"
                  : "Login"}{" "}
              <span>→</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH / YOKI ORQALI</span>
          </div>
          <div className="auth-socials">
            <button type="button" onClick={() => startSocialAuth("google")}>
              <GoogleMark /> Google Account
            </button>
            <button type="button" onClick={() => startSocialAuth("facebook")}>
              <FacebookMark /> Facebook
            </button>
          </div>
          <div className="auth-switch">
            {register
              ? "Already registered in the high-jewelry vault?"
              : "New to the HaDiJaM salon?"}{" "}
            <button
              type="button"
              onClick={() => {
                setRegister(!register);
                setError("");
                setSuccess("");
              }}
            >
              {register ? "Sign In to Salon →" : "Create your account →"}
            </button>
          </div>
          <div className="auth-security">
            <span>♙ 256-Bit SSL Escrow Protected</span>
            <span>✺ Davlat Proba Assayed</span>
            <span>♧ Kafolat &amp; Insurance Protocol</span>
          </div>
        </section>
      </section>
    </SiteLayout>
  );
}
