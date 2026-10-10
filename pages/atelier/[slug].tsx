import { useRouter } from "next/router";
import AtelierExperience from "@/libs/components/ateliers/AtelierExperience";

export default function AtelierRoute() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  if (!router.isReady || !slug) return <main className="atelier-page"><p className="atelier-state">Loading atelier…</p></main>;
  return <AtelierExperience slug={slug} />;
}
