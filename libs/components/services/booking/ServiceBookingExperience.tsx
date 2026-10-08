import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import { GET_MEMBER_PROFILE } from "@/libs/graphql/myPage";
import { CREATE_SERVICE_BOOKING, GET_SERVICES, GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS } from "@/libs/graphql/services";
import { readMemberId } from "@/libs/utils/account";

type Kind = "repair" | "ultrasonic";
type Profile = { memberFullName?: string; memberPhone?: string; memberAddress?: string };
type Service = { _id: string; serviceCategory: string; serviceTitle: string; servicePrice: number; serviceStatus: string };

function matchesServiceKind(service: Service, kind: Kind) {
  const identity = `${service.serviceCategory} ${service.serviceTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  return kind === "repair"
    ? /\brepair\b|\brestor(?:ation|ing|e)?\b|micro laser/.test(identity)
    : /ultrasonic|\bpolish(?:ing)?\b|\bclean(?:ing|se|sing)?\b|rhodium/.test(identity);
}

const repairMasters = [
  { name: "Master Kang Min-Seok", detail: "Micro-laser & antique restoration", years: "28 years", rating: "4.90 · 318 reviews", location: "Seoul · Apgujeong", photo: "hadijam-service-booking-vault-logistics-desktop-modal-senior-master-jeweler-in-bespoke-charcoal-suit-and-leather-artisan-apron-083.jpg" },
  { name: "Master Sofia Elena", detail: "Platinum & precision prong work", years: "19 years", rating: "4.95 · 442 reviews", location: "Gangnam Central", photo: "hadijam-services-live-calculator-photo-uploaded-state-professional-female-gia-graduate-gemologist-in-dark-sleek-lab-coat-analy-095.jpg" },
  { name: "Master Park Jin-Woo", detail: "Invisible settings & fine joints", years: "15 years", rating: "4.88 · 195 reviews", location: "Cheongdam East", photo: "hadijam-services-live-calculator-photo-uploaded-state-artisan-watchmaker-and-fine-jeweler-repairing-vintage-gold-luxury-watch--096.jpg" },
];
const polishMasters = [
  { name: "Express Vault Station", detail: "Fastest available certified bench", years: "Immediate allocation", rating: "Priority intake", location: "Gangnam Main Atelier", photo: "hadijam-service-booking-vault-logistics-desktop-modal-close-up-of-goldsmith-hands-using-precision-tweezers-holding-a-sparkling-086.jpg" },
  { name: "Senior Technician Lee Dong-Hae", detail: "Ultrasonic care & rhodium finish", years: "Senior technician", rating: "4.94 · 640+ jobs", location: "Gangnam Main Atelier", photo: "hadijam-service-booking-vault-logistics-desktop-modal-portrait-of-an-esteemed-senior-master-goldsmith-in-silk-apron-holding-lo-084.jpg" },
  { name: "Master Finisher Han So-Hee", detail: "Rhodium plating specialist", years: "Master finisher", rating: "4.91 · 480+ jobs", location: "Gangnam Main Atelier", photo: "hadijam-services-live-calculator-photo-uploaded-state-distinguished-senior-master-goldsmith-portrait-with-round-spectacles-and-094.jpg" },
];
const repairSlots = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30"];
const polishSlots = ["10:30", "11:30", "13:00", "14:30", "16:00", "17:30"];
const jewelryItems = ["Ring", "Necklace", "Bracelet", "Earrings", "Brooch", "Watch Bezel"];

function koreaDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (key: string) => parts.find((item) => item.type === key)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
function dateAtKoreaNoon(value: string) { return new Date(`${value}T12:00:00+09:00`).toISOString(); }
function dateTimeAtKorea(value: string, time: string) { return new Date(`${value}T${time}:00+09:00`).toISOString(); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00+09:00`)); }
function slotHasPassed(day: string, time: string) { return new Date(`${day}T${time}:00+09:00`).getTime() <= Date.now(); }
async function uploadRepairPhoto(file: File, token: string) {
  if (file.size > 25 * 1024 * 1024) throw new Error("Choose a photo smaller than 25 MB.");
  if (!/^(image\/(jpeg|png|webp|heic|heif))$/.test(file.type)) throw new Error("Choose a JPG, PNG, WEBP, or HEIC photo.");
  const body = new FormData();
  body.append("operations", JSON.stringify({ query: "mutation UploadServicePhoto($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }", variables: { file: null, target: "service-bookings" } }));
  body.append("map", JSON.stringify({ "0": ["variables.file"] }));
  body.append("0", file, file.name);
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9702/graphql", { method: "POST", headers: { authorization: `Bearer ${token}`, "apollo-require-preflight": "true" }, body });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length || typeof payload.data?.imageUploader !== "string") throw new Error(payload.errors?.[0]?.message ?? "Photo upload failed. Please try again.");
  return payload.data.imageUploader as string;
}

export default function ServiceBookingExperience({ kind }: { kind: Kind }) {
  const router = useRouter();
  const polish = kind === "ultrasonic";
  const title = polish ? "Ultrasonic Cleaning & Rhodium Polish" : "Jewelry Repair & Restoration";
  const [memberId, setMemberId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>(polish ? ["Ring"] : []);
  const [technician, setTechnician] = useState(polish ? polishMasters[0].name : repairMasters[0].name);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string; price: number } | null>(null);
  const [createBooking, bookingState] = useMutation(CREATE_SERVICE_BOOKING);
  const servicesQuery = useQuery(GET_SERVICES, { variables: { input: { page: 1, limit: 50, sort: "createdAt", direction: "DESC", search: {} } } });

  useEffect(() => {
    if (!router.isReady) return;
    const token = localStorage.getItem("accessToken");
    const id = token ? readMemberId(token) : null;
    if (!token || !id) {
      const next = encodeURIComponent(router.asPath || (polish ? "/services/ultrasonic-cleaning" : "/services/repair-restoration"));
      void router.replace(`/sign-in?mode=signin&next=${next}`);
      return;
    }
    setMemberId(id);
  }, [router.isReady, router.asPath, router, polish]);

  const profileQuery = useQuery(GET_MEMBER_PROFILE, { variables: { memberId }, skip: !memberId, fetchPolicy: "network-only" });
  const profile: Profile | undefined = profileQuery.data?.getMember;
  useEffect(() => {
    if (!profile) return;
    setCustomerName(profile.memberFullName ?? "");
    setPhone(profile.memberPhone ?? "");
    setAddress(profile.memberAddress ?? "");
  }, [profile]);

  const service: Service | undefined = useMemo(() => {
    const list: Service[] = servicesQuery.data?.getServices?.list ?? [];
    const queryId = typeof router.query.serviceId === "string" ? router.query.serviceId : "";
    return list.find((item) => item._id === queryId && item.serviceStatus === "ACTIVE" && matchesServiceKind(item, kind)) ?? list.find((item) => item.serviceStatus === "ACTIVE" && matchesServiceKind(item, kind));
  }, [servicesQuery.data, router.query.serviceId, kind]);
  const specialists = polish ? polishMasters : repairMasters;
  const slots = polish ? polishSlots : repairSlots;
  const dates = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const next = new Date(`${koreaDate(new Date())}T12:00:00+09:00`);
    next.setDate(next.getDate() + index);
    return koreaDate(next);
  }), []);
  useEffect(() => { if (!date && dates.length) setDate(dates[0]); }, [date, dates]);

  const availability = useQuery(GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS, {
    variables: { input: { serviceId: service?._id ?? "", date, technician } },
    skip: !memberId || !service?._id || !date || !technician,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const unavailable: string[] = availability.data?.getUnavailableServiceBookingSlots ?? [];
  const unitPrice = Number(service?.servicePrice) > 0 ? Number(service?.servicePrice) : (polish ? 35 : 45);
  const totalPrice = polish ? unitPrice * selectedItems.length : 45;

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    if (!service?._id) { setErrorMessage("This service is currently unavailable. Please contact our atelier."); return; }
    if (!date || !time) { setErrorMessage("Choose an available appointment date and time."); return; }
    if (!phone.trim() || !address.trim() || !customerName.trim()) { setErrorMessage("Complete your name, phone number, and delivery address."); return; }
    if (polish && selectedItems.length === 0) { setErrorMessage("Select at least one piece for treatment."); return; }
    if (!polish && !description.trim()) { setErrorMessage("Describe the repair needed for your piece."); return; }
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) { void router.push(`/sign-in?mode=signin&next=${encodeURIComponent(router.asPath)}`); return; }
      const itemPhoto = photo ? await uploadRepairPhoto(photo, token) : "";
      const result = await createBooking({ variables: { input: {
        serviceId: service._id,
        selectedTechnician: technician,
        selectedItems,
        itemDescription: polish ? "" : description.trim(),
        itemPhoto,
        customerName: customerName.trim(),
        bookingDate: dateAtKoreaNoon(date),
        bookingTime: dateTimeAtKorea(date, time),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        customerNote: polish ? description.trim() : description.trim(),
      } } });
      const booking = result.data?.createServiceBooking;
      if (!booking?.bookingReference) throw new Error("The server did not return a booking reference.");
      setReceipt({ reference: booking.bookingReference, price: booking.bookingPrice });
      await availability.refetch();
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "We could not save the booking. Please try again.");
    }
  };

  return <SiteLayout title={`${title} | HaDiJaM`}><div className={`atelier-booking ${polish ? "atelier-booking-polish" : "atelier-booking-repair"}`}>
    <div className="atelier-booking-topline"><a href="/services">Services</a><span>/</span><span>{title}</span><b>GANGNAM ATELIER · KST</b></div>
    <section className="atelier-booking-hero">
      <div className="atelier-booking-hero-copy">
        <span className="atelier-booking-eyebrow">✦ {polish ? "SERVICE 03 · EXPRESS RE-BRILLIANCE" : "ATELIER SERVICE 01 · MICRO-LASER RESTORATION"}</span>
        <h1>{polish ? <>Ultrasonic Cleaning &amp; <em>Rhodium Polish</em></> : <>Restoring Millimeter-Level Precision to Rare Family Heirlooms</>}</h1>
        <p>{polish ? "Restore mirror-bright brilliance with precision ultrasonic cleansing and a refined rhodium finish at our Gangnam atelier." : "Entrust your high-carat gold, platinum, and rare gem settings to master metallurgical restorers in our Gangnam clean-room atelier."}</p>
        <div className="atelier-booking-specs">{(polish ? [["Fixed protocol", "$35 USD"], ["Turnaround", "1–2 hours"], ["Acoustic spec", "40kHz medical"], ["Plating layer", "0.8μm triple"]] : [["Initial deposit", "$45 USD"], ["Turnaround", "24–48 hours"], ["Laser spot", "0.05 mm"], ["Assay guarantee", "Lifetime"]]).map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div>
      </div>
      <div className="atelier-booking-hero-image"><img src={polish ? "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-ultrasonic-gemstone-cleansing-tank-with-microscopic-mist-and-brilliant-p-090.jpg" : "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-close-up-precision-shot-of-laser-welding-repair-on-an-antique-intricate--088.jpg"} alt={title} /><span>● {polish ? "ULTRASONIC TANK 02 · ACTIVE" : "LIVE ARGON-CHAMBER STATUS: ONLINE"}</span></div>
    </section>

    {!polish && <section className="atelier-repair-features">{[["✧", "Laser Micro-Welding", "Precise restoration without disturbing delicate settings."], ["⌁", "Broken Chain Repair", "Fine links restored with a secure, near-invisible join."], ["◉", "Secure Claw Tightening", "Stone settings reinforced with careful pressure."], ["◇", "Gemstone Resetting", "Gemstones checked and reset with precision."]].map(([icon, titleText, text]) => <article key={titleText}><b>{icon}</b><h3>{titleText}</h3><p>{text}</p></article>)}</section>}

    <form className="atelier-booking-form" onSubmit={submitBooking}>
      <div className="atelier-booking-main">
        {polish && <section className="atelier-booking-panel"><div className="atelier-panel-heading"><span>01</span><div><h2>Select Items for Treatment</h2><p>Multiple selection permitted</p></div></div><div className="atelier-item-grid">{jewelryItems.map((item) => <label key={item} className={selectedItems.includes(item) ? "selected" : ""}><input type="checkbox" checked={selectedItems.includes(item)} onChange={() => setSelectedItems((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} /><b>◇</b><span>{item}<small>{item === "Ring" ? "Solitaire, eternity, band" : item === "Necklace" ? "Chain, pendant, choker" : item === "Watch Bezel" ? "Bezel & clasp only" : "Fine jewelry care"}</small></span></label>)}</div></section>}

        <section className="atelier-booking-panel"><div className="atelier-panel-heading"><span>{polish ? "02" : "01"}</span><div><h2>{polish ? "Select Specialist Technician" : "Select Master Craftsman"}</h2><p>{polish ? "Certified bench masters" : "Each restoration personally executed by a single certified artisan."}</p></div></div><div className="atelier-technician-grid">{specialists.map((person, index) => <button type="button" key={person.name} className={`atelier-technician ${technician === person.name ? "selected" : ""}`} onClick={() => { setTechnician(person.name); setTime(""); }}><div className="atelier-technician-avatar"><img src={`/images/stitch/services/${person.photo}`} alt="" />{index === 0 && <span>✦</span>}</div><div><small>★ {person.rating}</small><h3>{person.name}</h3><p>{person.detail}</p><div>{person.years}<span>{person.location}</span></div></div><i>{technician === person.name ? "✓" : "○"}</i></button>)}</div></section>

        <section className="atelier-booking-panel"><div className="atelier-panel-heading"><span>{polish ? "03" : "02"}</span><div><h2>{polish ? "Select Drop-off Date & Express Slot" : "Select Date & Time Slot"}</h2><p>Available appointments · Seoul time (KST)</p></div></div><div className="atelier-date-strip">{dates.map((value) => <button type="button" key={value} className={date === value ? "selected" : ""} onClick={() => { setDate(value); setTime(""); }}><small>{new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "short" }).format(new Date(`${value}T12:00:00+09:00`))}</small><b>{value.slice(-2)}</b><span>{new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "short" }).format(new Date(`${value}T12:00:00+09:00`))}</span></button>)}</div><p className="atelier-selected-date">{date ? formatDate(date) : "Choose a date"} <span>{availability.loading ? "Checking availability…" : availability.error ? "Availability could not be checked" : "Select an open time"}</span></p>{availability.error && <button type="button" className="atelier-availability-retry" onClick={() => void availability.refetch()}>Retry availability check</button>}<div className="atelier-time-grid">{slots.map((slot) => { const passed = Boolean(date && slotHasPassed(date, slot)); const reserved = unavailable.includes(slot); const disabled = reserved || passed || availability.loading || Boolean(availability.error); return <button type="button" key={slot} disabled={disabled} className={`${time === slot ? "selected" : ""} ${reserved || passed ? "unavailable" : ""}`} onClick={() => setTime(slot)}>{slot}<small>{reserved ? "Reserved" : passed ? "Passed" : "Available"}</small></button>; })}</div></section>

        <section className="atelier-booking-panel atelier-client-panel"><div className="atelier-panel-heading"><span>{polish ? "04" : "03"}</span><div><h2>{polish ? "Collector Notes & Contact" : "Client & Jewelry Information"}</h2><p>Details are saved securely with your request</p></div></div><div className="atelier-contact-grid"><label>Full legal name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required autoComplete="name" placeholder="Your full name" /></label><label>Direct phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" placeholder="+82 10-0000-0000" /></label><label className="wide">Delivery or contact address<input value={address} onChange={(event) => setAddress(event.target.value)} required autoComplete="street-address" placeholder="Gangnam-gu, Seoul" /></label><label className="wide">{polish ? "Care notes (optional)" : "Condition & desired repair"}<textarea required={!polish} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={polish ? "Tell us about gemstones or special care instructions" : "Describe the damage, loose stones, metal purity, or prior repairs…"} /></label>{!polish && <label className="atelier-photo-upload">Photographic assessment (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /><small>{photo ? photo.name : "JPG, PNG, WEBP or HEIC · up to 25 MB"}</small></label>}</div></section>
      </div>

      <aside className="atelier-booking-summary"><span className="atelier-booking-eyebrow">INTAKE DOSSIER</span><h2>Reservation Summary</h2><dl><div><dt>Protocol</dt><dd>{polish ? "Ultrasonic + Rhodium Triple Plate" : "Micro-Laser Restoration"}</dd></div><div><dt>Assigned specialist</dt><dd>{technician}</dd></div><div><dt>Intake schedule</dt><dd>{date ? formatDate(date) : "Select a date"}{time ? ` · ${time} KST` : ""}</dd></div>{polish && <div><dt>Selected pieces</dt><dd>{selectedItems.length ? selectedItems.join(", ") : "Select at least one"}</dd></div>}<div><dt>Turnaround</dt><dd>{polish ? "Same day · 1–2 hours" : "24–48 hours"}</dd></div></dl><div className="atelier-total"><span>{polish ? "Total payable" : "Required intake deposit"}<small>{polish ? `${selectedItems.length} piece${selectedItems.length === 1 ? "" : "s"} · payment due at drop-off` : "Applied toward final balance"}</small></span><strong>${totalPrice.toFixed(2)}</strong></div><p className="atelier-payment-note">Booking requests are saved to your account. No payment is charged online.</p>{errorMessage && <p className="atelier-booking-error" role="alert">{errorMessage}</p>}<button className="atelier-submit" type="submit" disabled={bookingState.loading || servicesQuery.loading || !service}>{bookingState.loading ? "Saving your booking…" : polish ? `Book Express Polish · $${totalPrice.toFixed(2)}` : "Confirm Repair Booking · $45 Deposit"}</button>{!service && !servicesQuery.loading && <p className="atelier-booking-error">This service is not currently active in the catalogue.</p>}<div className="atelier-summary-security"><span>◇ Zero-loss insured custody</span><span>✦ Digital intake record</span><span>● Gangnam Flagship Atelier</span></div></aside>
    </form>

    {polish ? <section className="atelier-standard"><span className="atelier-booking-eyebrow">SCIENTIFIC METALLURGY</span><h2>The Rhodium Resurfacing Standard</h2><div>{[["Phase 01", "Micro-Cavitation Immersion", "40kHz ultrasonic waves lift residue from intricate surfaces."], ["Phase 02", "Dialux White Rouge Buff", "A careful buff refines surface brilliance without removing detail."], ["Phase 03", "Electrolytic Rhodium Flash", "A controlled rhodium finish restores a bright protective surface."]].map(([step, heading, text]) => <article key={step}><small>{step}</small><h3>{heading}</h3><p>{text}</p></article>)}</div></section> : <section className="atelier-standard"><span className="atelier-booking-eyebrow">SECURE ATELIER PROTOCOL</span><h2>Care for Heirlooms with Precision</h2><div>{[["01", "Protected Intake", "Your piece is photographed, described, and recorded at intake."], ["02", "Master Restoration", "A selected craftsman performs the agreed repair with precision."], ["03", "Assayed Return", "The completed work is checked before secure return."]].map(([step, heading, text]) => <article key={step}><small>{step}</small><h3>{heading}</h3><p>{text}</p></article>)}</div></section>}
  </div>{receipt && <div className="atelier-confirm-overlay" role="presentation"><section className="atelier-confirmation" role="dialog" aria-modal="true" aria-labelledby="booking-confirm-title"><button type="button" className="atelier-confirm-close" aria-label="Close" onClick={() => setReceipt(null)}>×</button><span className="atelier-confirm-icon">✓</span><small>DATABASE RECORD COMMITTED · HADJAM VIP LEDGER</small><h2 id="booking-confirm-title">{polish ? "Express Booking Confirmed" : "Repair Booking Confirmed"}</h2><dl><div><dt>Booking reference</dt><dd>{receipt.reference}</dd></div><div><dt>Service</dt><dd>{title}</dd></div><div><dt>Appointment</dt><dd>{date ? formatDate(date) : ""} · {time} KST</dd></div><div><dt>Specialist</dt><dd>{technician}</dd></div><div><dt>Amount due</dt><dd>${receipt.price.toFixed(2)} · Pending</dd></div></dl><p>Your request was saved to the database and is available in My Account under Service Bookings.</p><button type="button" className="atelier-submit" onClick={() => void router.push("/my-page?tab=services")}>View My Service Bookings</button><button type="button" className="atelier-confirm-return" onClick={() => setReceipt(null)}>Return to Atelier</button></section></div>}</SiteLayout>;
}
