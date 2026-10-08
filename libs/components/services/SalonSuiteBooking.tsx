import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { CREATE_SALON_RESERVATION } from "@/libs/graphql/services";

type Props = { open: boolean; onClose: () => void };

type ReservationReceipt = {
  reference: string;
  status: string;
  suiteName: string;
  date: string;
  time: string;
  guestName: string;
  guestContact: string;
  manifest: string;
  amenities: string[];
  valet: boolean;
};

const suites = [
  {
    name: "The Sovereign Vault",
    image:
      "/images/stitch/services/salon-suite-sovereign-vault.jpg",
    description:
      "Armored bullion custody, sovereign vault transit & 100× digital stereomicroscopy.",
    guests: "1–4 Guests",
    feature: "Vault Armor",
  },
  {
    name: "The Aurum Atelier Suite",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDBdrkkErdpaSHutBFOlpt46IL8rxfyCkaA2ql7RDR57uw2L4G55jDc-7zzD9pk7yxs1KhAyNnNWRmkFKXbxDToMem_QorrsTOVWk6U-JOi47pXFukLfswGZZl7_lgkpU_Mg6cljNSl-oVZ2LRlbMF4uRLZjCX8oo3i87tvdYBvRY0u2hmQ_-iWYmcb4w9kDUxhSOrRzPLtmuCGj1p8jJdE1I52TvR4f0kDgMlv0A",
    description:
      "Direct interaction with a master bench, 3D wax sculpting, and heirloom remounting.",
    guests: "1–3 Guests",
    feature: "Goldsmith Bench",
  },
  {
    name: "The Royal Connoisseur Lounge",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9wG9M51X-VwOPE3wnqF5X15ZJt79UhiDewEx2uOjrLM9FUTifPF8Nepc-bbuWNBkFSX0wY_sIfry34s4vuFfQSQORu963BcVwlD7SArNYHuYqb06mAGVnTvUdhXMgdo0bG2RpBPAxaYIyvz4pOBf8KlALSsehiwqI7BL7qdXQwZlXQyH0P4BzXbWkRz4udPhqHdachC6V9r2w8O-T9wOAtFDNnj1pEbyo3wWPqw",
    description:
      "An intimate conversation lounge with private consultation and full-spectrum viewing.",
    guests: "1–6 Guests",
    feature: "Private Salon",
  },
  {
    name: "The Cheongdam Vitrine Salon",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ8bCF1ywsRleTNko8toTADQzfmrWjxtzgI50HJ-laOpNCd4NAQlNMDZGMhM96kLhWgKkQR0aqLecJvNJ1cXMcLrbrc0GSTXAiDfEgInYs2E7OIgo5amqdfsVf9WyvDSXUXaCxYuUYf0WPUE5sivypmETRfNdvjcLWRc3a7uhg_reIsV8aUEEiCrLfxw-W8UcwELG5jf7JDJfKSCgnrw66Pb2rGBaumHmfaEJ2CA",
    description:
      "Street-level illuminated vitrines and a private gallery for premier collections.",
    guests: "1–4 Guests",
    feature: "Vitrine Gallery",
  },
  {
    name: "The Grand Imperial Presidential Sanctuary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDS6tPLXHTBK9FfKq_2hB2Dn4G9_VagCYn-E_VNTz0n4webuJDTs_wTvQfODEr9uh06eHRFU7HX4rOO4D02Io3xAuKkEQzXKkCUkoeVC2ml5nmcQpwajWGKnSlEty_rvjxWRpmFlzWlCTSsdRl5k4kjMfOe3eozVsqFX5KLDtvBwdFJm9_fehG9oLOIY0wxqu9TG7Ey0dlIYv_95DotiQzIV-4zF3Gx949_VN31KQ",
    description:
      "A private Gangnam skyline suite with an exclusive vault and white-glove service.",
    guests: "1–8 Guests",
    feature: "Skyline Vault",
    exclusive: true,
  },
];

const amenities = [
  {
    id: "vault",
    icon: "⚿",
    name: "Individual Vault Box",
    description: "Dual-key temporary deposit lock allocated",
  },
  {
    id: "acoustic",
    icon: "◖",
    name: "Acoustic Seclusion",
    description: "Soundproof private suite activated",
  },
  {
    id: "laser",
    icon: "⌕",
    name: "Laser Metrology & Raman",
    description: "Spectrometric live assay standby",
  },
  {
    id: "sommelier",
    icon: "◇",
    name: "Korean Tea Service",
    description: "Rare Korean teas served privately",
  },
];

const timeSlots = [
  ["10:00", "Morning Opening"],
  ["11:30", "Daylight Assay"],
  ["14:00", "Private Consultation"],
  ["15:30", "Atelier Viewing"],
  ["18:00", "Evening Parure Fitting"],
  ["19:30", "Connoisseur Session"],
];

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function SalonSuiteBooking({ open, onClose }: Props) {
  const router = useRouter();
  const [createReservation, { loading }] = useMutation(
    CREATE_SALON_RESERVATION,
  );
  const [suiteIndex, setSuiteIndex] = useState(3);
  const [chosenAmenities, setChosenAmenities] = useState([
    "vault",
    "acoustic",
    "laser",
    "sommelier",
  ]);
  const [month, setMonth] = useState(() => new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 9, 23));
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [valet, setValet] = useState(true);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<ReservationReceipt | null>(null);

  if (!open) return null;

  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Seoul",
  }).format(month);
  const dateName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Seoul",
  }).format(selectedDate);
  const daysCount = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const offset =
    (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;

  const toggleAmenity = (id: string) =>
    setChosenAmenities((selected) =>
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      await router.push("/sign-in?mode=signin&next=%2Fservices");
      return;
    }
    const form = new FormData(event.currentTarget);
    const date = toDateInput(selectedDate);
    const time = selectedTime;
    const bookingDate = new Date(`${date}T12:00:00+09:00`).toISOString();
    const bookingTime = new Date(`${date}T${time}:00+09:00`).toISOString();
    const note = String(form.get("manifest") ?? "");
    setError("");
    try {
      const result = await createReservation({
        variables: {
          input: {
            suiteId: `suite-0${suiteIndex + 1}`,
            suiteName: suites[suiteIndex].name,
            bookingDate,
            bookingTime,
            guestName: String(form.get("guestName")),
            guestContact: String(form.get("guestContact")),
            itemManifest: note,
            selectedAmenities: chosenAmenities,
            valetRequested: valet,
          },
        },
      });
      const reference =
        result.data?.createSalonReservation?.reservationReference;
      const saved = result.data?.createSalonReservation;
      if (!reference || !saved) throw new Error("Reservation was not confirmed by the server.");
      setConfirmation({
        reference,
        status: saved.reservationStatus,
        suiteName: suites[suiteIndex].name,
        date: dateName,
        time,
        guestName: String(form.get("guestName")),
        guestContact: String(form.get("guestContact")),
        manifest: note.trim() || "No item details provided",
        amenities: chosenAmenities.map((id) => amenities.find((item) => item.id === id)?.name ?? id),
        valet,
      });
    } catch (requestError) {
      console.error("Salon reservation failed", requestError);
      setError(
        "Bronni saqlab bo‘lmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring.",
      );
    }
  };

  return (
    <div
      className="salon-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        className={`salon-modal${confirmation ? " salon-modal-confirmed" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="salon-dialog-title"
      >
        {confirmation ? (
          <div className="salon-confirmation-card">
            <div className="salon-confirmation-icon" aria-hidden="true">✓</div>
            <span className="salon-confirmation-eyebrow">DATABASE RECORD COMMITTED · HADĲAM VIP LEDGER</span>
            <h2>VIP Reservation Confirmed</h2>
            <dl className="salon-confirmation-details">
              <div><dt>Booking Reference</dt><dd>{confirmation.reference}</dd></div>
              <div><dt>Allocated Suite</dt><dd>{confirmation.suiteName}</dd></div>
              <div><dt>Date &amp; Time Block</dt><dd>{confirmation.date} · {confirmation.time} KST</dd></div>
              <div><dt>Guest</dt><dd>{confirmation.guestName} · {confirmation.guestContact}</dd></div>
              <div><dt>Vault Amenities</dt><dd>{confirmation.amenities.length ? confirmation.amenities.join(", ") : "None selected"}{confirmation.valet ? " · Private valet" : ""}</dd></div>
              <div><dt>Intake Manifest</dt><dd>{confirmation.manifest}</dd></div>
              <div><dt>Reservation Status</dt><dd>{confirmation.status}</dd></div>
            </dl>
            <p className="salon-confirmation-note">Your reservation has been saved. The Gangnam salon team will contact you using the details provided.</p>
            <button type="button" className="salon-confirmation-return" onClick={onClose}>Accept &amp; Return to Salon View</button>
          </div>
        ) : <>
        <header className="salon-modal-header">
          <div>
            <span>
              ⌖ CHEONGDAM-DONG GANGNAM, SEOUL · FLAGSHIP ATELIER SALON
            </span>
            <h2 id="salon-dialog-title">
              VIP Suite Booking &amp; Connoisseur Private Consultation
            </h2>
          </div>
          <div className="salon-header-actions">
            <span>♢ Confidential Escrow &amp; Discretion Protocol</span>
            <button
              type="button"
              aria-label="Close booking"
              onClick={onClose}
              disabled={loading}
            >
              ×
            </button>
          </div>
        </header>
        <form
          id="salon-booking-form"
          className="salon-modal-body"
          onSubmit={handleSubmit}
        >
          <div className="salon-step-heading">
            <div>
              <span className="salon-step-label">
                STEP 01 / SELECT A PRIVATE SUITE
              </span>
              <h3>
                Select Dedicated Private Salon <small>(5 Curated Suites)</small>
              </h3>
            </div>
            <p>
              Exclusive single-client reservation per block · White-glove
              concierge
            </p>
          </div>
          <div className="salon-suite-grid">
            {suites.map((suite, index) => (
              <button
                type="button"
                key={suite.name}
                className={`salon-suite-card${suiteIndex === index ? " selected" : ""}`}
                onClick={() => setSuiteIndex(index)}
              >
                <span className="salon-suite-number">SUITE 0{index + 1}</span>
                {suite.exclusive && (
                  <span className="salon-exclusive">
                    PRESIDENTIAL EXCLUSIVE
                  </span>
                )}
                <span className="salon-suite-select">
                  {suiteIndex === index ? "✓" : ""}
                </span>
                <img
                  src={suite.image}
                  alt={suite.name}
                />
                <span className="salon-suite-copy">
                  <strong>{suite.name}</strong>
                  <small>{suite.description}</small>
                  <span>
                    <i>♟ {suite.guests}</i>
                    <b>{suite.feature}</b>
                  </span>
                </span>
              </button>
            ))}
          </div>
          <section className="salon-amenities">
            <div className="salon-section-title">
              <div>
                <span className="salon-step-label">
                  CUSTOM PROTOCOL FILTER / OPTIONAL PRIVILEGES
                </span>
                <h3>Connoisseur Amenities &amp; Vault Safeguards</h3>
              </div>
              <p>Tailor your consultation setup prior to arrival</p>
            </div>
            <div className="salon-amenity-grid">
              {amenities.map((amenity) => (
                <button
                  type="button"
                  key={amenity.id}
                  className={
                    chosenAmenities.includes(amenity.id) ? "active" : ""
                  }
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  <span>{amenity.icon}</span>
                  <i>
                    <strong>{amenity.name}</strong>
                    <small>{amenity.description}</small>
                  </i>
                  <b>{chosenAmenities.includes(amenity.id) ? "✓" : ""}</b>
                </button>
              ))}
            </div>
          </section>
          <div className="salon-schedule-grid">
            <section className="salon-calendar-panel">
              <div className="salon-section-title">
                <div>
                  <span className="salon-step-label">
                    STEP 02 / SELECT A DATE
                  </span>
                  <h3>
                    {monthName} <small>· Gangnam Salon Schedule</small>
                  </h3>
                </div>
                <span className="salon-calendar-status">Calendar Active</span>
              </div>
              <div className="salon-selected-date">
                ▣ <span>Selected Date:</span>
                <strong>{dateName}</strong>
                <b>VAULT OPEN · UTC+9</b>
              </div>
              <div className="salon-calendar-nav">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  ),
                )}
              </div>
              <div className="salon-calendar-days">
                {Array.from({ length: offset }, (_, index) => (
                  <span key={`empty-${index}`} />
                ))}
                {Array.from({ length: daysCount }, (_, index) => {
                  const day = index + 1;
                  const active =
                    selectedDate.getFullYear() === month.getFullYear() &&
                    selectedDate.getMonth() === month.getMonth() &&
                    selectedDate.getDate() === day;
                  return (
                    <button
                      type="button"
                      key={day}
                      className={active ? "selected" : ""}
                      onClick={() =>
                        setSelectedDate(
                          new Date(month.getFullYear(), month.getMonth(), day),
                        )
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="salon-month-controls">
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                    )
                  }
                >
                  ← Previous month
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    )
                  }
                >
                  Next month →
                </button>
              </div>
            </section>
            <section className="salon-time-panel">
              <div className="salon-section-title">
                <div>
                  <span className="salon-step-label">
                    STEP 03 / SELECT A TIME
                  </span>
                  <h3>Private Appointment Slots</h3>
                  <p>
                    Selected date: <strong>{dateName}</strong>
                  </p>
                </div>
                <span className="salon-duration">90 MIN BLOCK</span>
              </div>
              <div className="salon-time-grid">
                {timeSlots.map(([time, label]) => (
                  <button
                    type="button"
                    key={time}
                    className={selectedTime === time ? "selected" : ""}
                    onClick={() => setSelectedTime(time)}
                  >
                    <strong>{time} KST</strong>
                    <small>{label}</small>
                  </button>
                ))}
              </div>
              <div className="salon-assignee">
                <span>KM</span>
                <p>
                  <b>Kang Min-woo</b>
                  <small>Master Gemologist &amp; Metrology Lead</small>
                </p>
                <strong>ASSIGNED</strong>
              </div>
            </section>
          </div>
          <section className="salon-guest-panel">
            <div className="salon-section-title">
              <div>
                <span className="salon-step-label">
                  STEP 04 / GUEST DETAILS
                </span>
                <h3>VIP Guest Credentials &amp; Private Intake</h3>
              </div>
            </div>
            <div className="salon-guest-fields">
              <label>
                Full Name or Pseudonym
                <input
                  name="guestName"
                  required
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>
              <label>
                Confidential Contact
                <input
                  name="guestContact"
                  required
                  placeholder="Mobile number or Telegram handle"
                  autoComplete="tel"
                />
              </label>
              <label className="wide">
                Items for inspection or consultation
                <input
                  name="manifest"
                  placeholder="Tell us what you would like to discuss"
                />
              </label>
            </div>
            <label className="salon-valet">
              <input
                type="checkbox"
                checked={valet}
                onChange={(event) => setValet(event.target.checked)}
              />
              <span>
                <b>Discrete Subterranean Valet &amp; Direct Lift</b>
                <small>
                  Private parking with direct, discreet access to the salon.
                </small>
              </span>
            </label>
          </section>
          <section className="salon-summary">
            <div>
              <span className="salon-step-label">RESERVATION SUMMARY</span>
              <h3>{suites[suiteIndex].name}</h3>
              <p>
                {dateName} · {selectedTime} KST · Cheongdam-dong, Gangnam
              </p>
              <div className="salon-summary-tags">
                {chosenAmenities.map((id) => (
                  <span key={id}>
                    {amenities.find((item) => item.id === id)?.name}
                  </span>
                ))}
                {valet && <span>Private Valet</span>}
              </div>
            </div>
            <div className="salon-summary-actions">
              <button
                type="button"
                onClick={() => {
                  const entry = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:HaDiJaM Gangnam Salon Visit\nDTSTART:${new Date(`${toDateInput(selectedDate)}T${selectedTime}:00+09:00`).toISOString().replace(/[-:]/g, "").slice(0, 15)}00\nEND:VEVENT\nEND:VCALENDAR`;
                  const url = URL.createObjectURL(
                    new Blob([entry], { type: "text/calendar" }),
                  );
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = "hadijam-salon-visit.ics";
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export calendar invite
              </button>
              <button type="submit" disabled={loading}>
                {loading
                  ? "Saving reservation…"
                  : "Confirm VIP Suite Reservation →"}
              </button>
            </div>
            {error && (
              <p className="salon-booking-error" role="alert">
                {error}
              </p>
            )}
          </section>
        </form>
        <footer className="salon-modal-footer">
          <span>♙ Encrypted Client Privacy · KOLAS-aligned assessment</span>
          <span>Cheongdam Flagship Salon Concierge: +82 (0)2 548 7700</span>
        </footer>
        </>}
      </section>
    </div>
  );
}
