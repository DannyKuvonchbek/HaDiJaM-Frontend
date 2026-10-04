import { FormEvent, useState } from "react";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SiteLayout from "@/libs/components/layout/SiteLayout";

const questions = [
  {
    question: "How can I verify a HaDiJaM piece?",
    preview: "Ask our team about documentation and appraisal.",
    answer:
      "For a specific piece, contact our concierge with its item details. The team can explain which documentation and appraisal information is available for that item.",
  },
  {
    question: "Can I visit an atelier before commissioning?",
    preview: "Visits are arranged by appointment.",
    answer:
      "Atelier visits and private viewings are arranged in advance. Send your preferred location and dates through the dispatch form and the team can follow up.",
  },
  {
    question: "When can I reach the Tashkent team?",
    preview: "Daily, 09:00–21:00 UZT.",
    answer:
      "The Tashkent central switchboard is listed as available daily from 09:00 to 21:00 UZT. Use the official Telegram channel or the dispatch form to leave a request outside those hours.",
  },
  {
    question: "How is a private delivery arranged?",
    preview: "Delivery details are confirmed with the concierge.",
    answer:
      "Delivery and collection options depend on the item and destination. Contact the concierge with your location so the team can confirm available arrangements.",
  },
  {
    question: "Can I discuss a custom piece?",
    preview: "Share your idea and preferred materials.",
    answer:
      "Yes. Include the piece type, materials, approximate budget, and any reference details in your inquiry so the team can direct it to the right specialist.",
  },
];

const channelCards = [
  {
    icon: "send",
    title: "Telegram VIP Desk",
    tag: "verified channel",
    text: "Contact the concierge team directly for private enquiries and appointment requests.",
    handle: "@HaDiJaM_Official",
    action: "Open Telegram",
    href: "https://t.me/hadijam_official",
  },
  {
    icon: "alternate_email",
    title: "Official Inquiries",
    tag: "concierge email",
    text: "For product questions, documentation requests, and private salon enquiries.",
    handle: "concierge@hadijam.uz",
    action: "Copy email",
    href: "",
  },
  {
    icon: "photo_camera",
    title: "Instagram Gallery",
    tag: "official profile",
    text: "Explore new pieces, atelier work, and updates from HaDiJaM.",
    handle: "@hadijam.luxury",
    action: "Visit Instagram",
    href: "https://instagram.com/hadijam.luxury",
  },
];

const ateliers = [
  {
    number: "01",
    category: "Certified Guild",
    name: "Kang & Sons Haute Atelier",
    status: "Active Bench",
    initials: "JK",
    master: "Master Jin-Woo Kang",
    role: "Chief Master Jeweler · 32 years of experience",
    workshopPhone: "+998 (71) 234-77-10",
    masterPhone: "+998 (90) 845-22-11",
    availability: "WhatsApp & Telegram available",
    address: "Mirabad District, Artisan Guild Alley, Suite 4B, Tashkent",
    specialty: "18K/24K hand-carved solitaires and Muzo emerald mountings",
  },
  {
    number: "02",
    category: "High Lapidary",
    name: "Maison de L'Or & Lapidary Vault",
    status: "Active Bench",
    initials: "AV",
    master: "Alexander Vance",
    role: "Haute Lapidary & Pavé Setting Specialist",
    workshopPhone: "+998 (71) 289-44-32",
    masterPhone: "+998 (97) 120-66-88",
    availability: "Micro-pavé appraisal line open",
    address: "Yakkasaray District, Goldsmith Quarters #12, Tashkent",
    specialty: "Diamond invisible setting and antique restoration",
  },
  {
    number: "03",
    category: "Royal Heritage",
    name: "Samarkand Royal Filigree Guild",
    status: "By Appointment",
    initials: "MI",
    master: "Usta Mirzo Ibrohimov",
    role: "National Heritage Master Craftsman · 40 years of experience",
    workshopPhone: "+998 (66) 233-19-45",
    masterPhone: "+998 (93) 311-50-50",
    availability: "Bespoke commissions by appointment",
    address: "Registan Artisan Quarter, Pavilion 7, Samarkand",
    specialty: "Traditional filigree and heritage goldwork",
  },
];

export default function ContactPage() {
  const [view, setView] = useState<"hq" | "atelier">("hq");
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState("");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("concierge@hadijam.uz");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const copyNumber = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      window.setTimeout(() => setCopiedNumber(""), 1800);
    } catch {
      setCopiedNumber("");
    }
  };

  const submitDispatch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(
      `Private enquiry: ${data.get("classification")}`,
    );
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nPhone or Telegram: ${data.get("contact")}\nEnquiry: ${data.get("classification")}\n\n${data.get("brief")}`,
    );
    setDispatchStatus(
      "Your email app will open with the enquiry details. Review and send it there to reach our concierge.",
    );
    window.location.href = `mailto:concierge@hadijam.uz?subject=${subject}&body=${body}`;
  };

  const askQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    setCustomQuestion(prompt.trim());
    setActiveQuestion(null);
    setPrompt("");
  };

  return (
    <SiteLayout title="Contact | HaDiJaM">
      <div className="contact-page">
        <header className="contact-heading">
          <span className="contact-eyebrow">
            <i /> Concierge &amp; Atelier Direct Access
          </span>
          <h1>
            Direct Concierge &amp; <em>Master Ateliers</em>
          </h1>
          <p>
            Connect with HaDiJaM headquarters, our atelier partners, or browse
            answers to common jewellery enquiries.
          </p>
          <div
            className="contact-switcher"
            role="tablist"
            aria-label="Contact destination"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "hq"}
              className={view === "hq" ? "selected" : ""}
              onClick={() => setView("hq")}
            >
              <span className="material-symbols-outlined">domain</span>
              <span>HaDiJaM Headquarters &amp; Concierge</span>
              <small>Official Desk</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "atelier"}
              className={view === "atelier" ? "selected" : ""}
              onClick={() => setView("atelier")}
            >
              <span className="material-symbols-outlined">handyman</span>
              <span>Master Ateliers &amp; Goldsmiths</span>
              <small>Atelier Enquiries</small>
            </button>
          </div>
        </header>

        {view === "hq" ? (
          <section
            className="contact-primary-grid"
            aria-label="Contact channels and private enquiry"
          >
            <div className="contact-channels">
              <div className="contact-section-title">
                <div>
                  <span className="contact-kicker">
                    {view === "hq"
                      ? "Official Contact Channels"
                      : "Atelier Contact Channels"}
                  </span>
                  <h2>
                    {view === "hq"
                      ? "Central Secretariat & Digital Desks"
                      : "Master Ateliers & Goldsmiths"}
                  </h2>
                </div>
                <span className="contact-live">
                  <i /> Concierge desk
                </span>
              </div>
              {channelCards.map((card, index) => (
                <article className="contact-channel-card" key={card.title}>
                  <div className="contact-channel-icon">
                    <span className="material-symbols-outlined">
                      {card.icon}
                    </span>
                  </div>
                  <div className="contact-channel-copy">
                    <div className="contact-channel-heading">
                      <h3>{card.title}</h3>
                      <span className="material-symbols-outlined">
                        {index === 1 ? "lock" : "verified"}
                      </span>
                    </div>
                    <p>{card.text}</p>
                    <span className="contact-handle">{card.handle}</span>
                  </div>
                  {index === 1 ? (
                    <button
                      className="contact-channel-action muted"
                      type="button"
                      onClick={copyEmail}
                    >
                      <span>{copied ? "Copied" : card.action}</span>
                      <span className="material-symbols-outlined">
                        {copied ? "check" : "content_copy"}
                      </span>
                    </button>
                  ) : (
                    <a
                      className={`contact-channel-action ${index === 0 ? "" : "muted"}`}
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{card.action}</span>
                      <span className="material-symbols-outlined">
                        arrow_outward
                      </span>
                    </a>
                  )}
                </article>
              ))}
              <div className="contact-phone-grid">
                <article>
                  <span className="material-symbols-outlined">call</span>
                  <span className="contact-kicker">
                    Tashkent Central Switchboard
                  </span>
                  <strong>+998 (71) 200-88-99</strong>
                  <p>Daily, 09:00–21:00 UZT</p>
                </article>
                <article>
                  <span className="material-symbols-outlined">call</span>
                  <span className="contact-kicker">
                    Seoul Gangnam Salon Desk
                  </span>
                  <strong>+82 (2) 548-8890</strong>
                  <p>Private viewing by appointment</p>
                </article>
              </div>
            </div>

            <aside className="contact-dispatch" id="dispatch">
              <div className="contact-dispatch-label">
                <span className="contact-kicker">Direct Dispatch</span>
                <span className="material-symbols-outlined">shield</span>
              </div>
              <h2>Book a Private Salon Visit or Enquire</h2>
              <p>
                Share a few details and your email app will prepare a message to
                our concierge for you to review.
              </p>
              <form onSubmit={submitDispatch}>
                <label>
                  Full Name
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />
                </label>
                <label>
                  Phone or Telegram ID
                  <input
                    name="contact"
                    placeholder="+998 … or @handle"
                    required
                  />
                </label>
                <label>
                  Enquiry Type
                  <select
                    name="classification"
                    defaultValue="Bespoke jewellery commission"
                  >
                    <option>Bespoke jewellery commission</option>
                    <option>Private salon appointment</option>
                    <option>Product enquiry</option>
                    <option>Repair or appraisal</option>
                    <option>Other enquiry</option>
                  </select>
                </label>
                <label>
                  Enquiry Details
                  <textarea
                    name="brief"
                    rows={3}
                    placeholder="Tell us what you would like help with…"
                    required
                  />
                </label>
                <p className="contact-privacy">
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>{" "}
                  Your message stays in your email app until you choose to send
                  it.
                </p>
                <button className="contact-submit" type="submit">
                  <span className="material-symbols-outlined">send</span>{" "}
                  Prepare Enquiry
                </button>
                {dispatchStatus && (
                  <p className="contact-form-status" role="status">
                    {dispatchStatus}
                  </p>
                )}
              </form>
            </aside>
          </section>
        ) : (
          <section
            className="contact-atelier-section"
            aria-label="Verified master ateliers and direct contact details"
          >
            <header className="contact-atelier-heading">
              <div>
                <span className="contact-kicker">Certified Artisan Guild</span>
                <h2>Verified Master Ateliers &amp; Direct Phone Lines</h2>
                <p>
                  Find the right specialist for your jewellery enquiry and
                  contact their workshop directly.
                </p>
              </div>
              <span className="contact-guild-count">
                <span className="material-symbols-outlined">verified</span>{" "}
                Official Guild Directory · 3 Hubs
              </span>
            </header>
            <div className="contact-atelier-grid">
              {ateliers.map((atelier) => (
                <article className="contact-atelier-card" key={atelier.number}>
                  <div className="contact-atelier-main">
                    <div className="contact-atelier-title">
                      <div>
                        <span className="contact-kicker">
                          Atelier #{atelier.number} · {atelier.category}
                        </span>
                        <h3>{atelier.name}</h3>
                      </div>
                      <span className="contact-atelier-status">
                        {atelier.status}
                      </span>
                    </div>
                    <div className="contact-master-profile">
                      <span className="contact-master-initials">
                        {atelier.initials}
                      </span>
                      <span>
                        <strong>{atelier.master}</strong>
                        <small>{atelier.role}</small>
                      </span>
                    </div>
                    <div className="contact-atelier-numbers">
                      <div>
                        <span>
                          <span className="material-symbols-outlined">
                            call
                          </span>{" "}
                          Workshop Desk
                        </span>
                        <strong>{atelier.workshopPhone}</strong>
                      </div>
                      <div className="master-number">
                        <span>
                          <span className="material-symbols-outlined">
                            smartphone
                          </span>{" "}
                          Master’s Direct Number
                        </span>
                        <strong>{atelier.masterPhone}</strong>
                        <small>
                          <i />
                          {atelier.availability}
                        </small>
                      </div>
                    </div>
                    <div className="contact-atelier-meta">
                      <p>
                        <b>Address</b>
                        {atelier.address}
                      </p>
                      <p>
                        <b>Specialty</b>
                        {atelier.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="contact-atelier-actions">
                    <button
                      type="button"
                      onClick={() => copyNumber(atelier.masterPhone)}
                    >
                      <span className="material-symbols-outlined">
                        {copiedNumber === atelier.masterPhone
                          ? "check"
                          : "content_copy"}
                      </span>
                      {copiedNumber === atelier.masterPhone
                        ? "Copied"
                        : "Copy Master Number"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyNumber(atelier.workshopPhone)}
                    >
                      <span className="material-symbols-outlined">
                        {copiedNumber === atelier.workshopPhone
                          ? "check"
                          : "content_copy"}
                      </span>
                      {copiedNumber === atelier.workshopPhone
                        ? "Copied"
                        : "Copy Workshop Number"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section
          className="contact-concierge"
          aria-labelledby="concierge-title"
        >
          <header>
            <span className="contact-eyebrow">
              <i /> Concierge Guide
            </span>
            <h2 id="concierge-title">
              Jewellery Concierge &amp; <em>Quick Answers</em>
            </h2>
            <p>
              Browse common questions, or enter an enquiry to see the best way
              to reach our team.
            </p>
          </header>
          <div className="contact-concierge-grid">
            <div className="contact-faq-list">
              <span className="contact-kicker">Frequently Asked Questions</span>
              {questions.map((item, index) => (
                <button
                  key={item.question}
                  className={`contact-faq ${activeQuestion === index ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    setActiveQuestion(index);
                    setCustomQuestion("");
                  }}
                >
                  <span className="contact-faq-number">{index + 1}</span>
                  <span>
                    <strong>{item.question}</strong>
                    <small>{item.preview}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="contact-chat" aria-live="polite">
              <div className="contact-chat-top">
                <span>
                  <i /> HaDiJaM Concierge Guide
                </span>
                <span>Contact information</span>
              </div>
              <div className="contact-chat-stream">
                <div className="contact-answer">
                  <span className="material-symbols-outlined">diamond</span>
                  <div>
                    <b>Concierge Guide</b>
                    <p>
                      Welcome. Choose a question to see guidance, or send your
                      details through the dispatch form above. For personal
                      assistance, use the official contact channels on this
                      page.
                    </p>
                  </div>
                </div>
                {activeQuestion !== null && (
                  <>
                    <div className="contact-question-bubble">
                      {questions[activeQuestion].question}
                    </div>
                    <div className="contact-answer">
                      <span className="material-symbols-outlined">diamond</span>
                      <div>
                        <b>Concierge Guide</b>
                        <p>{questions[activeQuestion].answer}</p>
                      </div>
                    </div>
                  </>
                )}
                {customQuestion && (
                  <>
                    <div className="contact-question-bubble">
                      {customQuestion}
                    </div>
                    <div className="contact-answer">
                      <span className="material-symbols-outlined">diamond</span>
                      <div>
                        <b>Concierge Guide</b>
                        <p>
                          This guide does not have a live AI connection. Please
                          use the enquiry form or contact the concierge through{" "}
                          <a
                            href="https://t.me/hadijam_official"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            our official Telegram channel
                          </a>{" "}
                          for a response.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <form className="contact-chat-form" onSubmit={askQuestion}>
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask about an appointment or jewellery enquiry…"
                  aria-label="Ask the concierge guide"
                />
                <button type="submit">
                  Ask <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="contact-salons">
          <div className="contact-salon-copy">
            <span className="contact-kicker">
              Physical Presence &amp; Salons
            </span>
            <h2>Private Viewing Lounges</h2>
            <p>
              Contact our team to confirm salon availability and arrange a
              private viewing.
            </p>
            <article>
              <strong>Tashkent Central Salon</strong>
              <span>Amir Temur Avenue, Tashkent</span>
              <small>Daily: 10:00–20:00 · Appointment recommended</small>
            </article>
            <article>
              <strong>Seoul Gangnam Salon Desk</strong>
              <span>Seoul, South Korea</span>
              <small>Private viewing by appointment</small>
            </article>
          </div>
          <div className="contact-map-panel">
            <iframe
              title="Map of Tashkent"
              src="https://maps.google.com/maps?q=Tashkent%2C%20Uzbekistan&t=&z=12&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="contact-map-overlay">
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <strong>Private Salon Appointments</strong>
                <small>
                  Contact the concierge to confirm the location and arrange your
                  visit.
                </small>
              </div>
              <a href="#dispatch">
                Book a salon <span>→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
