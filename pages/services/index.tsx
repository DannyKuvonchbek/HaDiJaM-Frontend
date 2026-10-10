import { atelierBookingRules } from '@/libs/utils/serviceBookingRules';
import { authValue } from "@/libs/auth";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EntityLikeButton from "@/libs/components/catalog/EntityLikeButton";
import SalonSuiteBooking from "@/libs/components/services/SalonSuiteBooking";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import { GET_SERVICES, CREATE_SERVICE_BOOKING, GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS } from "@/libs/graphql/services";

const services = [
  {
    title: "Jewelry Repair & Restoration",
    category: "REPAIR",
    duration: "24–48h Delivery",
    image: "/images/services/repair-v2.webp",
    description:
      "Laser microweaving, broken chain link repair, secure claw retipping, and gemstone prong tightening executed with microscopic accuracy.",
  },
  {
    title: "Custom Design & 3D Atelier",
    category: "CUSTOM",
    duration: "7–14 Days",
    image: "/images/services/custom-design-v2.webp",
    description:
      "Transform a personal heirloom or sketch into a bespoke piece with photorealistic 3D CAD and a wax model preview.",
  },
  {
    title: "Ultrasonic Cleansing & Rhodium Polish",
    category: "POLISHING",
    duration: "Same Day (2–4h)",
    image: "/images/services/cleaning-v2.webp",
    description:
      "High-frequency cleansing, delicate scratch buffing, mirror polishing, and Swiss rhodium plating for lasting brilliance.",
  },
  {
    title: "Certified Gemological Appraisal",
    category: "GEMOLOGY",
    duration: "24h Lab Passport",
    image: "/images/services/gemology-v2.webp",
    description:
      "Diamond mapping, origin verification, synthetic detection, purity assay, and an official insurance passport.",
  },
  {
    title: "Ring Resizing & Metal Refining",
    category: "RESIZING",
    duration: "24–48h Delivery",
    image: "/images/services/resizing-v2.webp",
    description:
      "Resize delicate bands and bridal rings without visible seams or compromising stone security.",
  },
  {
    title: "Precious Metal Assay & Laser Hallmark",
    category: "ASSAY",
    duration: "Same Day",
    image: "/images/services/assay-v2.webp",
    description:
      "Spectrometric precious-metal analysis with a documented assay and laser hallmark service.",
  },
];

function serviceMatchesCard(entry: any, service: (typeof services)[number]) {
  const identity = `${entry?.serviceCategory ?? ""} ${entry?.serviceTitle ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  if (service.category === "REPAIR") return /\brepair\b|\brestor(?:ation|ing|e)?\b|micro laser/.test(identity);
  if (service.category === "POLISHING") return /ultrasonic|\bpolish(?:ing)?\b|\bclean(?:ing|se|sing)?\b|rhodium/.test(identity);
  return identity.includes(service.category.toLowerCase());
}

export default function ServicesPage() {
  const [bookingService, setBookingService] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState("All Specializations");
  const [serviceSearch, setServiceSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [salonOpen, setSalonOpen] = useState(false);
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
  const selectedService = data?.getServices?.list?.find((entry: any) => entry._id === bookingService);
  const bookingRule = atelierBookingRules[selectedService?.serviceCategory];
  const [modalBookingDate, setModalBookingDate] = useState('');
  const modalAvailability = useQuery(GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS, {
    variables: {input: {serviceId: bookingService ?? '', date: modalBookingDate, technician: bookingRule?.technician ?? 'Atelier Concierge'}},
    skip: !selectedService || !modalBookingDate || !authValue('accessToken'), fetchPolicy: 'network-only',
  });
  const unavailableTimes: string[] = modalAvailability.data?.getUnavailableServiceBookingSlots ?? [];
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
        ? authValue("accessToken")
        : null;
    if (!accessToken) {
      window.location.href = "/sign-in?mode=signin&next=%2Fservices";
      return;
    }
    const form = new FormData(event.currentTarget);
    const date = new Date(`${String(form.get("bookingDate"))}T12:00:00+09:00`);
    const time = new Date(
      `${String(form.get("bookingDate"))}T${String(form.get("bookingTime"))}:00+09:00`,
    );
    try {
      await createBooking({
        variables: {
          input: {
            serviceId: bookingService,
            selectedTechnician: bookingRule?.technician ?? "Atelier Concierge",
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
  const visibleServices = services.filter((service) => {
    const group =
      (service.category === "GEMOLOGY" || service.category === "ASSAY")
        ? "Gemology Lab"
        : service.category === "RESTORATION" || service.category === "REPAIR"
          ? "Heirloom Restoration"
          : "All Specializations";
    const matchesGroup =
      serviceFilter === "All Specializations" || group === serviceFilter;
    const matchesSearch = `${service.title} ${service.description}`
      .toLowerCase()
      .includes(serviceSearch.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <SiteLayout title="Atelier services | HaDiJaM">
      <div className="service-redesign">
        <section className="service-hero">
          <div className="service-hero-glow" />
          <div className="service-hero-inner">
            <div className="service-hero-copy">
              <span className="service-eyebrow">
                <i /> MASTER CRAFTSMANSHIP &amp; CERTIFIED TRUST
              </span>
              <h1>
                Preserve, Restore &amp;
                <br />
                <em>Re-imagine</em> Your Precious Heirlooms
              </h1>
              <p>
                Connect directly with verified master jewelers, licensed
                gemologists, and bespoke ateliers across Korea. Full escrow
                protection, insured transit, and state-certified hallmark
                guarantees.
              </p>
              <div className="service-searchbar">
                <label>
                  <span>⌕</span>
                  <input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Search service (e.g. Ring resizing, Laser repair...)"
                  />
                </label>
                <select
                  aria-label="Service category"
                  value={serviceFilter}
                  onChange={(event) => setServiceFilter(event.target.value)}
                >
                  <option>All Specializations</option>
                  <option>Heirloom Restoration</option>
                  <option>Gemology Lab</option>
                </select>
                <span className="service-location">⌖ Seoul Flagship</span>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("service-catalog")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore <span>→</span>
                </button>
              </div>
            </div>
            <div className="service-hero-photo">
              <img
                src="/images/stitch/services/hadijam-service-booking-vault-logistics-desktop-modal-close-up-of-goldsmith-hands-using-precision-tweezers-holding-a-sparkling-086.jpg"
                alt="Korean master jeweler carefully restoring a fine gold heirloom"
              />
              <div className="service-photo-badge">
                <span>✦</span>
                <div>
                  <strong>Master Hallmark Assayed</strong>
                  <small>
                    Metrological state laboratory testing on every restored
                    alloy.
                  </small>
                </div>
              </div>
            </div>
            <div className="service-trustbar">
              {[
                ["✧", "15,000+", "Restored Heirlooms"],
                ["◈", "100% Escrow", "Insured Custody Vault"],
                ["◷", "48hr Express", "Rapid Atelier Turnaround"],
                ["◇", "GIA & State Lab", "Certified Appraisers"],
              ].map(([icon, value, label]) => (
                <div key={value}>
                  <span>{icon}</span>
                  <p>
                    <strong>{value}</strong>
                    <small>{label}</small>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="service-catalog" id="service-catalog">
          <div className="service-content-width">
            <div className="service-section-heading">
              <div>
                <span className="service-eyebrow">CERTIFIED PORTFOLIO</span>
                <h2>Exquisite Atelier Services</h2>
                <p>
                  Every service is conducted within sterile, high-precision
                  ateliers by vetted master artisans using state-of-the-art
                  metrology and Swiss laser instruments.
                </p>
              </div>
              <div className="service-tabs">
                {[
                  "All Specializations",
                  "Heirloom Restoration",
                  "Gemology Lab",
                ].map((tab) => (
                  <button
                    type="button"
                    className={serviceFilter === tab ? "active" : ""}
                    key={tab}
                    onClick={() => setServiceFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="service-grid service-grid-redesign">
              {visibleServices.map((service) => {
                const live =
                  liveServices.find(
                    (entry: any) => serviceMatchesCard(entry, service),
                  );
                return (
                  <article
                    className="service-card service-card-redesign"
                    key={service.title}
                  >
                    <div className="service-card-image">
                      <img
                        src={service.image}
                        loading="lazy"
                        decoding="async"
                        width={1200}
                        height={800}
                        alt={service.title}
                      />
                      <EntityLikeButton
                        entityType="service"
                        entityId={live?._id}
                        initialLiked={Boolean(
                          live?.meLiked?.some(
                            (like: { myFavorite: boolean }) => like.myFavorite,
                          ),
                        )}
                        initialCount={live?.serviceLikes ?? 0}
                        label={live?.serviceTitle ?? service.title}
                        className="service-favorite"
                      />
                    </div>
                    <div className="service-card-copy">
                      <span className="service-photo-meta">
                        ✦ {service.category.replace("_", " ")} <b>·</b>{" "}
                        {service.duration}
                      </span>

                      <div className="service-meta">
                        <VerifiedUserOutlinedIcon /> VERIFIED ATELIER PARTNER
                      </div>
                      <h3>{live?.serviceTitle ?? service.title}</h3>
                      <p>{live?.serviceDesc ?? service.description}</p>
                      {service.title === "Custom Design & 3D Atelier" ? (
                        <Link href={`/services/custom-design${live?._id ? `?serviceId=${live._id}` : ""}`} className="text-link">
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </Link>
                      ) : service.title === "Certified Gemological Appraisal" ? (
                        <Link href={`/services/gemological-appraisal${live?._id ? `?serviceId=${live._id}` : ""}`} className="text-link">
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </Link>
                      ) : service.title === "Ring Resizing & Metal Refining" ? (
                        <Link href={`/services/ring-resizing${live?._id ? `?serviceId=${live._id}` : ""}`} className="text-link">
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </Link>
                      ) : service.category === "REPAIR" ? (
                        <Link href={`/services/repair-restoration${live?._id ? `?serviceId=${live._id}` : ""}`} className="text-link">
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </Link>
                      ) : service.category === "POLISHING" ? (
                        <Link href={`/services/ultrasonic-cleaning${live?._id ? `?serviceId=${live._id}` : ""}`} className="text-link">
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </Link>
                      ) : service.category === "ASSAY" ? (
                        <button
                          type="button"
                          onClick={() => window.alert("Coming soon")}
                          className="text-link"
                        >
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </button>
                      ) : (
                        <button
                          onClick={() => setBookingService(live?._id ?? "consultation")}
                          className="text-link"
                        >
                          Book {service.title} <ArrowForwardRoundedIcon />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="service-protocol">
          <div className="service-content-width">
            <span className="service-eyebrow">THE PROTOCOL</span>
            <h2>How HaDiJaM Services Works</h2>
            <p className="service-center-lede">
              A seamless four-step journey designed for utmost peace of mind,
              uncompromising security, and bespoke craftsmanship.
            </p>
            <div className="service-steps">
              {[
                [
                  "01",
                  "Instant Estimate",
                  "Select desired service, submit high-resolution photos or specifications, and receive a binding digital quote within minutes.",
                ],
                [
                  "02",
                  "Armored Transit",
                  "Choose fully insured courier dispatch or hand-deliver directly into our private Seoul Cheongdam-dong vault.",
                ],
                [
                  "03",
                  "Live Video Report",
                  "Witness cleanroom restoration progress via encrypted private video feeds and high-magnification inspection shots.",
                ],
                [
                  "04",
                  "Hallmarked Return",
                  "Delivered in a sealed velvet presentation box with a digital ledger warranty and laboratory certification.",
                ],
              ].map(([number, title, body]) => (
                <article key={number}>
                  <span>{number}</span>
                  <b>✦</b>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="service-masters">
          <div className="service-content-width">
            <div className="service-section-heading">
              <div>
                <span className="service-eyebrow">VERIFIED MASTERS</span>
                <h2>Partner Ateliers &amp; Certified Fellows</h2>
                <p>
                  Meet the venerable artisans entrusted with royal restorations,
                  high-carat setting, and scientific metallurgical validation.
                </p>
              </div>
              <a href="#service-contact">View all certified ateliers →</a>
            </div>
            <div className="service-master-grid">
              {[
                [
                  "Kang & Sons Haute Atelier",
                  "kang-and-sons",
                  "Cheongdam-dong, Seoul",
                  "Second-generation master goldsmith with 28 years of bespoke bridal restorations.",
                  "Platinum Master · Hand Engraving",
                  "hadijam-service-booking-vault-logistics-desktop-modal-senior-master-jeweler-in-bespoke-charcoal-suit-and-leather-artisan-apron-083.jpg",
                  "4.98",
                  "1,240",
                ],
                [
                  "Aurum Gemological Lab",
                  "aurum-gemological-lab",
                  "Gangnam, Seoul",
                  "GIA Graduate Gemologist specializing in spectroscopy and gemstone origin reports.",
                  "GIA Certified · Spectroscopy",
                  "hadijam-services-live-calculator-photo-uploaded-state-professional-female-gia-graduate-gemologist-in-dark-sleek-lab-coat-analy-095.jpg",
                  "5.00",
                  "890",
                ],
                [
                  "Milano Heritage Restoration",
                  "milano-heritage-restoration",
                  "Itaewon, Seoul",
                  "Archival vintage restoration, Art Deco filigree stabilization, and precious gemstone recutting.",
                  "Art Deco · Gem Recutting",
                  "hadijam-service-booking-vault-logistics-desktop-modal-portrait-of-an-esteemed-senior-master-goldsmith-in-silk-apron-holding-lo-084.jpg",
                  "4.95",
                  "640",
                ],
              ].map(([name, slug, location, bio, tags, image, rating, jobs]) => (
                <article key={name}>
                  <Link
                    href={`/atelier/${slug}`}
                    className="service-master-image-link"
                    aria-label={`View ${name} atelier profile`}
                  >
                    <img src={`/images/stitch/services/${image}`} alt={name} />
                  </Link>
                  <div>
                    <span>
                      ★ {rating} <small>({jobs} jobs)</small>
                    </span>
                    <h3>{name}</h3>
                    <small>{location}</small>
                    <p>{bio}</p>
                    <label>{tags}</label>
                    <Link href={`/atelier/${slug}`}>Visit atelier →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="service-faq-section">
          <div className="service-content-width">
            <div className="service-faq-visual">
              <aside>
                <span className="service-eyebrow">
                  AI LOUPE &amp; METROLOGY SCAN ACTIVE
                </span>
                <img
                  src="/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-close-up-precision-shot-of-laser-welding-repair-on-an-antique-intricate--088.jpg"
                  alt="Precision laser restoration"
                />
                <b>✦ Diagnostic Note</b>
                <p>
                  Every piece is examined and documented before restoration
                  begins.
                </p>
                <button
                  type="button"
                  onClick={() => setBookingService("consultation")}
                >
                  Request an estimate →
                </button>
              </aside>
            </div>
            <div className="service-faq-list">
              {[
                [
                  "Is my jewelry fully insured during transport and repair?",
                  "Yes. From collection by our dedicated armored courier or receipt at our Seoul Gangnam salon, your item is covered under our insured custody process. Higher-value pieces can be arranged with additional coverage.",
                ],
                [
                  "How do you verify diamond authenticity before and after repair?",
                  "Before work begins, every stone can be inspected with optical and spectral tools. The assessment and completed work are documented for your records.",
                ],
                [
                  "Can I provide my own broken gold heirlooms for custom pieces?",
                  "Yes. Our Bespoke 3D Atelier can assess your family gold, discuss refining options, and apply its agreed value toward a custom piece.",
                ],
                [
                  "What is the digital certificate and guarantee policy?",
                  "Verified atelier work includes a digital record of the service and applicable warranty details, provided with your completed piece.",
                ],
              ].map(([question, answer], index) => (
                <article
                  key={question}
                  className={openFaq === index ? "open" : ""}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  >
                    {question}
                    <span>{openFaq === index ? "−" : "+"}</span>
                  </button>
                  {openFaq === index && <p>{answer}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="service-closing" id="service-contact">
          <div>
            <span className="service-eyebrow">BEGIN YOUR RESTORATION</span>
            <h2>
              Entrust Your Heirloom to
              <br />
              Certified Korean Masters
            </h2>
            <p>
              Experience salon-grade care from the comfort of your residence.
              Insured door-to-door courier dispatch or schedule a private
              appointment in Cheongdam-dong.
            </p>
            <div className="service-salon-action">
              <button
                type="button"
                className="service-salon-cta"
                aria-haspopup="dialog"
                onClick={() => setSalonOpen(true)}
              >
                <span className="service-salon-cta-icon" aria-hidden="true">◈</span>
                <span>Schedule Gangnam Salon Visit<small>Choose your private suite, date &amp; time</small></span>
                <ArrowForwardRoundedIcon />
              </button>
              <span className="service-salon-location">CHEONGDAM-DONG · SEOUL</span>
            </div>
          </div>
          <img
            src="/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-macro-cinematic-photo-of-an-open-black-velvet-bespoke-jewelry-box-displa-097.jpg"
            alt="Restored heirloom presented in a HaDiJaM jewelry box"
          />
        </section>
      </div>
      <SalonSuiteBooking open={salonOpen} onClose={() => setSalonOpen(false)} />
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
                      value={modalBookingDate}
                      onChange={(event) => setModalBookingDate(event.target.value)}
                      required
                      min={new Date(Date.now() + 86400000)
                        .toISOString()
                        .slice(0, 10)}
                    />
                  </label>
                  <label>
                    Preferred time (KST)
                    {bookingRule ? <select name="bookingTime" required defaultValue=""><option value="" disabled>Choose an available time</option>{bookingRule.slots.map(time => <option key={time} value={time} disabled={unavailableTimes.includes(time)}>{time}{unavailableTimes.includes(time) ? ' · Unavailable' : ''}</option>)}</select> : <input type="time" name="bookingTime" required />}
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
                  disabled={loading || modalAvailability.loading}
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
