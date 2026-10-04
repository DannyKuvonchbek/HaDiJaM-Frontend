import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PageIntro from "@/libs/components/layout/PageIntro";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import { GET_SERVICES, CREATE_SERVICE_BOOKING } from "@/libs/graphql/services";

const services = [
  {
    title: "Gold restoration",
    category: "RESTORATION",
    duration: "3–7 days",
    image:
      "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-macro-luxury-photography-of-a-master-jeweler-in-a-dark-bespoke-atelier-e-087.jpg",
    description:
      "Bring back the warmth and brilliance of your most treasured gold pieces.",
  },
  {
    title: "Jewelry repair",
    category: "REPAIR",
    duration: "2–5 days",
    image:
      "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-close-up-precision-shot-of-laser-welding-repair-on-an-antique-intricate--088.jpg",
    description:
      "Careful, considered repairs entrusted to experienced master jewelers.",
  },
  {
    title: "Ring resizing",
    category: "RESIZING",
    duration: "2–4 days",
    image:
      "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-ring-resizing-mandrel-and-gold-calibration-gauges-on-a-dark-oak-jeweler--092.jpg",
    description:
      "A precise fit, finished by hand and made to feel entirely your own.",
  },
  {
    title: "Stone replacement",
    category: "STONE_SETTING",
    duration: "By consultation",
    image:
      "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-licensed-gia-certified-gemologist-utilizing-an-electronic-refractometer--091.jpg",
    description:
      "Thoughtful stone matching and setting with a clear provenance record.",
  },
];

export default function ServicesPage() {
  const [bookingService, setBookingService] = useState<string | null>(null);
  const { data } = useQuery(GET_SERVICES, {
    variables: {
      input: {
        page: 1,
        limit: 12,
        sort: "createdAt",
        direction: "DESC",
        search: {},
      },
    },
  });
  const [createBooking, { loading }] = useMutation(CREATE_SERVICE_BOOKING);
  const handleBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingService) return;
    if (bookingService === "consultation") {
      window.location.href =
        "mailto:concierge@hadijam.uz?subject=Private%20atelier%20consultation";
      return;
    }
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!accessToken) {
      window.location.href = "/sign-in?mode=signin&next=%2Fservices";
      return;
    }
    const form = new FormData(event.currentTarget);
    const date = new Date(String(form.get("bookingDate")));
    const time = new Date(
      `${String(form.get("bookingDate"))}T${String(form.get("bookingTime"))}:00`,
    );
    try {
      await createBooking({
        variables: {
          input: {
            serviceId: bookingService,
            bookingDate: date.toISOString(),
            bookingTime: time.toISOString(),
            customerPhone: String(form.get("customerPhone")),
            customerAddress: String(form.get("customerAddress")),
            customerNote: String(form.get("customerNote") ?? ""),
          },
        },
      });
      window.alert(
        "Your consultation request has been sent. Our concierge will be in touch.",
      );
      setBookingService(null);
    } catch {
      window.alert(
        "We could not send your request. Please sign in and check your details.",
      );
    }
  };
  const liveServices = data?.getServices?.list ?? [];

  return (
    <SiteLayout title="Atelier services | HaDiJaM">
      <PageIntro
        eyebrow="PRESERVE · RESTORE · REIMAGINE"
        title="Care for what you keep close."
        description="From a careful polish to a considered restoration, find expert care for the pieces that matter most."
      />
      <section className="service-page section-shell">
        <div className="service-intro-row">
          <div>
            <span className="eyebrow">EXQUISITE ATELIER SERVICES</span>
            <h2>
              Masterful hands.
              <br />
              <em>Meaningful care.</em>
            </h2>
          </div>
          <p>
            Our atelier network brings together certified specialists, trusted
            techniques and a personal approach to every piece entrusted to us.
          </p>
        </div>
        <div className="service-grid" id="atelier-workshop">
          {services.map((service, index) => {
            const live =
              liveServices.find(
                (entry: any) =>
                  entry.serviceCategory?.toLowerCase() ===
                  service.category.toLowerCase(),
              ) ?? liveServices[index];
            return (
              <article className="service-card" key={service.title}>
                <div className="service-card-image">
                  <img
                    src={
                      live?.serviceImages?.[0]
                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702"}/${live.serviceImages[0]}`
                        : service.image
                    }
                    alt={service.title}
                  />
                  <span>0{index + 1}</span>
                </div>
                <div className="service-card-copy">
                  <div className="service-meta">
                    <VerifiedUserOutlinedIcon /> HaDiJaM atelier partner{" "}
                    <span>·</span> {live?.serviceDuration ?? service.duration}
                  </div>
                  <h3>{live?.serviceTitle ?? service.title}</h3>
                  <p>{live?.serviceDesc ?? service.description}</p>
                  <button
                    onClick={() =>
                      setBookingService(live?._id ?? "consultation")
                    }
                    className="text-link"
                  >
                    Arrange a consultation <ArrowForwardRoundedIcon />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="service-process">
          <div className="eyebrow">A THOUGHTFUL PROCESS</div>
          <h2>
            From first conversation
            <br />
            to <em>beautifully finished.</em>
          </h2>
          <div className="process-steps">
            {[
              "Tell us about your piece",
              "Receive a clear assessment",
              "Approve the care plan",
              "Welcome it back, renewed",
            ].map((step, index) => (
              <div key={step}>
                <span>0{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {bookingService && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setBookingService(null)}
        >
          <form
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            onSubmit={handleBooking}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setBookingService(null)}
            >
              ×
            </button>
            <span className="eyebrow">PERSONAL CONSULTATION</span>
            <h2>Begin with a conversation.</h2>
            <p>
              Our concierge will help you choose a time and connect you with the
              right specialist.
            </p>
            {bookingService === "consultation" ? (
              <a
                className="button button-gold"
                href="mailto:concierge@hadijam.uz?subject=Private%20atelier%20consultation"
              >
                Email our concierge <span>↗</span>
              </a>
            ) : (
              <>
                <label>
                  Phone number
                  <input
                    name="customerPhone"
                    required
                    placeholder="+998 90 000 00 00"
                  />
                </label>
                <div className="booking-form-row">
                  <label>
                    Preferred date
                    <input
                      type="date"
                      name="bookingDate"
                      required
                      min={new Date(Date.now() + 86400000)
                        .toISOString()
                        .slice(0, 10)}
                    />
                  </label>
                  <label>
                    Preferred time
                    <input type="time" name="bookingTime" required />
                  </label>
                </div>
                <label>
                  Your address
                  <input
                    name="customerAddress"
                    required
                    placeholder="City and neighborhood"
                  />
                </label>
                <label>
                  Note (optional)
                  <textarea
                    name="customerNote"
                    rows={2}
                    placeholder="Tell us how we can help"
                  />
                </label>
                <button
                  type="submit"
                  className="button button-gold"
                  disabled={loading}
                >
                  {loading ? "Sending request…" : "Request a consultation"}{" "}
                  <span>↗</span>
                </button>
              </>
            )}
            <Link href="/sign-in?mode=signin" className="modal-login">
              Sign in to manage your requests
            </Link>
          </form>
        </div>
      )}
    </SiteLayout>
  );
}
