import { authorizedFetch } from "@/libs/auth";
import { authValue } from "@/libs/auth";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import { CREATE_SALON_RESERVATION, GET_BOOKED_SALON_TIMES } from "@/libs/graphql/services";

type Workflow = "custom" | "appraisal" | "resizing";
type Option = { title: string; detail: string; icon: string; color?: string };

const asset = "/images/stitch/services/";
const image = {
  cad: `${asset}hadijam-services-live-calculator-photo-uploaded-state-digital-3d-cad-rendered-jewelry-blueprint-alongside-an-actual-carved-jew-089.jpg`,
  craft: `${asset}hadijam-service-booking-vault-logistics-desktop-modal-close-up-shot-of-antique-uzbek-filigree-goldsmith-workstation-with-preci-085.jpg`,
  master: `${asset}hadijam-services-live-calculator-photo-uploaded-state-distinguished-senior-master-goldsmith-portrait-with-round-spectacles-and-094.jpg`,
  gemologist: `${asset}hadijam-services-live-calculator-photo-uploaded-state-licensed-gia-certified-gemologist-utilizing-an-electronic-refractometer--091.jpg`,
  lab: `${asset}hadijam-services-live-calculator-photo-uploaded-state-professional-female-gia-graduate-gemologist-in-dark-sleek-lab-coat-analy-095.jpg`,
  bench: `${asset}hadijam-services-live-calculator-photo-uploaded-state-ring-resizing-mandrel-and-gold-calibration-gauges-on-a-dark-oak-jeweler--092.jpg`,
};

const workflows: Record<Workflow, {
  slug: string; title: string; accent: string; service: string; reference: string; suiteId: string;
  fee: number; duration: string; metric: string; metricCaption: string; hero: string;
  times: string[]; stepTitle: string; intro: string; peopleTitle: string; people: Array<Option & { image: string; badge: string }>;
}> = {
  custom: {
    slug: "custom-design", title: "Custom Design &", accent: "3D Haute Atelier", service: "Bespoke 3D CAD Atelier", reference: "HDJ-CST-002", suiteId: "bespoke-custom-atelier", fee: 250, duration: "90 Minutes", metric: "4K CAD & Wax Fit", metricCaption: "3D Deliverables", hero: image.cad,
    times: ["11:00", "14:00", "16:30", "18:30"], stepTitle: "Select Consultation Format & Experience", intro: "Create an heirloom piece from a personal sketch with precision CAD and a wax prototype preview.", peopleTitle: "Select Lead Bespoke Designer & Sculptor",
    people: [
      { title: "Elena Kim", detail: "Lead Haute CAD Sculptor · 14 years experience", icon: "design_services", image: image.lab, badge: "Place Vendôme Alum" },
      { title: "Marco Bellini", detail: "Bespoke Wax Carver & Gem Setter · 19 years", icon: "architecture", image: image.master, badge: "Milan Guild Master" },
      { title: "Choi Won-Sik", detail: "Modern Architectural Jewelry · 12 years", icon: "diamond", image: image.craft, badge: "Hongik University Fellow" },
    ],
  },
  appraisal: {
    slug: "gemological-appraisal", title: "Gemological Appraisal &", accent: "Diamond Grading", service: "Certified Gemological Appraisal", reference: "HDJ-APR-042", suiteId: "gemological-appraisal-lab", fee: 80, duration: "2–4 Hours", metric: "0.001ct Raman", metricCaption: "Precision Benchmark", hero: image.gemologist,
    times: ["10:00", "11:30", "14:00", "15:30", "17:00"], stepTitle: "Select Gemstone Type & Cut Profile", intro: "Independent laboratory gemological assessment with spectrometry, color and clarity grading, and a certified replacement valuation.", peopleTitle: "Select Chief Gemologist & Appraiser",
    people: [
      { title: "Dr. David C. Vance, FGA", detail: "FGA Fellow · Diamond spectroscopy & origin · 24 years", icon: "science", image: image.gemologist, badge: "Senior Fellow" },
      { title: "Master Song Hye-Rim", detail: "Seoul & Geneva Lab Accredited · 16 years", icon: "biotech", image: image.lab, badge: "Origin Specialist" },
      { title: "Julien Delacroix", detail: "Place Vendôme Provenance · 19 years", icon: "workspace_premium", image: image.master, badge: "Paris & Seoul Guild" },
    ],
  },
  resizing: {
    slug: "ring-resizing", title: "Precision Ring Resizing &", accent: "Tension Calibration", service: "Ring Resizing & Metal Refining", reference: "HDJ-RSZ-058", suiteId: "ring-resizing-bench", fee: 40, duration: "24 Hours", metric: "Laser Fusion (0.05mm)", metricCaption: "Joint Method", hero: image.bench,
    times: ["10:30", "12:00", "14:30", "16:30", "18:00"], stepTitle: "Select Ring Band Architecture & Metal", intro: "Resize your ring with seamless laser joining while protecting pavé tension, archival hallmarks, and structural geometry.", peopleTitle: "Select Master Goldsmith",
    people: [
      { title: "Master Kim Do-Hwan", detail: "22 years bench-craft · Platinum & pavé tension specialist", icon: "precision_manufacturing", image: image.master, badge: "Flagship Chief" },
      { title: "Master Bena Vane", detail: "15 years · Historical restoration & antique resizing", icon: "history_edu", image: image.craft, badge: "Antique Specialist" },
      { title: "Express Bench Station", detail: "Immediate queue priority · 24-hour intake", icon: "bolt", image: image.bench, badge: "Fastest Intake" },
    ],
  },
};

const metals: Option[] = [
  { title: "18K Yellow", detail: "750 Aurum", icon: "circle", color: "#f2ca50" },
  { title: "18K Rose", detail: "Warm Alloy", icon: "circle", color: "#e8a38a" },
  { title: "18K White", detail: "Rhodium Coat", icon: "circle", color: "#e5e5e5" },
  { title: "24K Pure", detail: "999.9 Fine", icon: "circle", color: "#ffd700" },
  { title: "950 Platinum", detail: "Dense Noble", icon: "circle", color: "#cfd8dc" },
];
const stones: Option[] = [
  { title: "Natural Diamonds", detail: "D–F Color · VVS+ GIA", icon: "diamond", color: "#f2ca50" },
  { title: "Pigeon Blood Ruby", detail: "Burmese Unheated", icon: "lens", color: "#ff6b6b" },
  { title: "Ceylon Sapphire", detail: "Royal Velvet Blue", icon: "lens", color: "#5c9dff" },
  { title: "Colombian Emerald", detail: "Muzo Deep Green", icon: "lens", color: "#4ade80" },
  { title: "Client’s Heirloom Stones", detail: "Remount existing stones", icon: "recycling", color: "#f2ca50" },
];
const bandTypes: Option[] = [
  { title: "Solitaire Plain Band", detail: "Classic high-polish or brushed shank · seamless reflow", icon: "lens" },
  { title: "Pavé / Eternity Band", detail: "Half or ¾ eternity stones · microscope prong inspection", icon: "diamond" },
  { title: "Signet & Heavy Solid", detail: "Family crest, intaglio, historic seal · hallmark shield", icon: "shield" },
  { title: "Multi-Metal / Tension Band", detail: "Platinum, gold or titanium · localized laser fusion", icon: "blur_circular" },
];
const appraisalGems: Option[] = [
  { title: "Diamond & Moissanite", detail: "Round brilliant, emerald, cushion, oval, pear", icon: "diamond" },
  { title: "Precious Colored Gems", detail: "Ruby, Kashmir / Ceylon sapphire, Muzo emerald", icon: "auto_awesome" },
  { title: "Pearls & Rare Organics", detail: "South Sea, Tahitian, Basra pearl, amber, coral", icon: "water_drop" },
  { title: "Antique Cut / Rough Mineral", detail: "Old European, mine cut, uncut rough specimen", icon: "landslide" },
];
const cuts = ["Round Brilliant", "Emerald Cut", "Oval Modified", "Cushion Antique", "Marquise / Pear", "Other / Unmounted"];
const dateFor = (offset: number) => {
  const value = new Date(Date.now() + offset * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
};
const dateText = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00+09:00`));
const dateHeading = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "short", month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00+09:00`));

async function uploadReferences(files: File[], token: string): Promise<string[]> {
  if (!files.length) return [];
  const operations = { query: "mutation UploadAtelierReferences($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }", operationName: "UploadAtelierReferences", variables: { files: files.map(() => null), target: "atelier" } };
  const map = Object.fromEntries(files.map((_, index) => [String(index), [`variables.files.${index}`]]));
  const body = new FormData();
  body.append("operations", JSON.stringify(operations));
  body.append("map", JSON.stringify(map));
  files.forEach((file, index) => body.append(String(index), file, file.name));
  const response = await authorizedFetch(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9702/graphql", { method: "POST", headers: { authorization: `Bearer ${token}`, "apollo-require-preflight": "true" }, body });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.[0]?.message ?? "Reference upload failed.");
  return payload.data?.imagesUploader ?? [];
}

function StepHeading({ number, title, detail }: { number: string; title: string; detail?: string }) {
  return <div className="workflow-step-heading"><span>{number}</span><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div></div>;
}

export default function ServiceBookingWorkflow({ kind }: { kind: Workflow }) {
  const spec = workflows[kind];
  const router = useRouter();
  const [createReservation, { loading: submitting }] = useMutation(CREATE_SALON_RESERVATION);
  const [modality, setModality] = useState("In-Person Gangnam VIP Suite");
  const [metal, setMetal] = useState("18K White");
  const [stone, setStone] = useState("Natural Diamonds");
  const [cut, setCut] = useState("Round Brilliant");
  const [gemType, setGemType] = useState("Diamond & Moissanite");
  const [band, setBand] = useState("Solitaire Plain Band");
  const [currentSize, setCurrentSize] = useState("6.5");
  const [targetSize, setTargetSize] = useState("7.5");
  const [designer, setDesigner] = useState(spec.people[0].title);
  const [selectedDate, setSelectedDate] = useState(dateFor(1));
  const [selectedTime, setSelectedTime] = useState(spec.times[1]);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [certificate, setCertificate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const suiteId = kind === "custom" && modality.startsWith("Global") ? `${spec.suiteId}-virtual` : spec.suiteId;
  const bookingFrom = new Date(`${dateFor(0)}T00:00:00+09:00`).toISOString();
  const bookingTo = new Date(`${dateFor(8)}T00:00:00+09:00`).toISOString();
  const { data: bookedData, loading: bookedLoading, error: bookedError } = useQuery(GET_BOOKED_SALON_TIMES, {
    variables: { suiteId, from: bookingFrom, to: bookingTo }, fetchPolicy: "network-only",
  });
  const bookedTimes: string[] = bookedData?.getBookedSalonTimes ?? [];
  const slots = useMemo(() => Array.from({ length: 5 }, (_, index) => dateFor(index)), []);
  const sizeDifference = Number(targetSize) - Number(currentSize);
  const ringFee = spec.fee + (Math.abs(sizeDifference) > 1 ? 20 : 0) + (band.includes("Pavé") ? 15 : 0);
  const payable = kind === "resizing" ? ringFee : spec.fee;
  const appointmentDate = new Date(`${selectedDate}T${selectedTime}:00+09:00`);
  const slotBooked = bookedTimes.some((value) => new Date(value).getTime() === appointmentDate.getTime());
  const activePerson = spec.people.find((person) => person.title === designer) ?? spec.people[0];

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const allowed = selected.every((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (!allowed) { setErrorMessage("Upload JPG, PNG, or WebP reference images."); return; }
    if (selected.reduce((sum, file) => sum + file.size, 0) > 25 * 1024 * 1024) { setErrorMessage("Reference images must total 25 MB or less."); return; }
    setFiles(selected);
    setErrorMessage("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setConfirmation("");
    if (appointmentDate.getTime() <= Date.now()) { setErrorMessage("Choose a future date and time."); return; }
    if (slotBooked) { setErrorMessage("That appointment time was just reserved. Please choose another slot."); return; }
    const token = authValue("accessToken");
    if (!token) {
      await router.push(`/sign-in?mode=signin&next=%2Fservices%2F${spec.slug}`);
      return;
    }
    const data = new FormData(event.currentTarget);
    const guestName = String(data.get("guestName") ?? "").trim();
    const guestContact = String(data.get("guestContact") ?? "").trim();
    try {
      const uploadedReferences = await uploadReferences(files, token);
      const choices = kind === "custom"
        ? [`Consultation: ${modality}`, `Base alloy: ${metal}`, `Primary gemstone: ${stone}`, `Lead designer: ${designer}`]
        : kind === "appraisal"
          ? [`Gemstone: ${gemType}`, `Cut profile: ${cut}`, `Appraiser: ${designer}`]
          : [`Ring architecture: ${band}`, `Metal: ${metal}`, `Current ring size: US ${currentSize}`, `Target ring size: US ${targetSize}`, `Goldsmith: ${designer}`];
      const manifest = JSON.stringify({ workflow: spec.service, notes: notes.trim(), certificateNumber: certificate.trim() || undefined, referenceFiles: uploadedReferences, quotedDepositUsd: payable, paymentStatus: "AWAITING_CONCIERGE_CONFIRMATION" });
      const result = await createReservation({ variables: { input: {
        suiteId,
        suiteName: kind === "custom" && modality.startsWith("Global") ? "Global 4K CAD Live Screen-Share" : kind === "appraisal" ? "Gemological Assay Laboratory" : kind === "resizing" ? "Ring Resizing Bench" : "Gangnam VIP Suite #02",
        bookingDate: new Date(`${selectedDate}T12:00:00+09:00`).toISOString(),
        bookingTime: appointmentDate.toISOString(),
        guestName, guestContact, itemManifest: manifest, selectedAmenities: choices, valetRequested: false,
      } } });
      const saved = result.data?.createSalonReservation;
      if (!saved?.reservationReference) throw new Error("The server did not confirm this appointment.");
      setConfirmation(saved.reservationReference);
      setFiles([]);
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "We could not save your appointment. Please try again.");
    }
  };

  return <SiteLayout title={`${spec.service} | HaDiJaM`}>
    <main className={`service-workflow service-workflow-${kind}`}>
      <div className="workflow-shell">
        <div className="workflow-breadcrumb"><div><Link href="/services">Services</Link><span>/</span><span>{kind === "resizing" ? "Bench Craft & Sizing" : kind === "appraisal" ? "Laboratory & Gemology" : "Bespoke Atelier"}</span><span>/</span><b>Service {kind === "custom" ? "02" : kind === "appraisal" ? "04" : "05"}</b></div><span className="workflow-ref">● REF: {spec.reference} · APPOINTMENT</span></div>
        <div className="workflow-hero">
          <div><span className="workflow-kicker">✦ ATELIER SERVICE {kind === "custom" ? "02" : kind === "appraisal" ? "04" : "05"} · {kind === "custom" ? "BESPOKE 3D CAD & WAX PROTOTYPE" : kind === "appraisal" ? "GIA / IGI ACCREDITED GEMOLOGY" : "BENCH RESIZING WITHOUT DISRUPTION"}</span>
            <h1>{spec.title} <em>{spec.accent}</em></h1><p>{spec.intro}</p>
          </div>
          <div className="workflow-bench"><img src={spec.hero} alt="HaDiJaM atelier workbench"/><span><small>LIVE BENCH STATUS</small><strong>{kind === "appraisal" ? "Assay Laboratory Active" : kind === "resizing" ? "Laser Bench #05 Ready" : "Atelier Bay #4 Active"}</strong><small>Gangnam Private Salon</small></span></div>
        </div>
        <div className="workflow-metrics"><div><i>payments</i><span><small>{kind === "resizing" ? "STARTING FEE" : kind === "appraisal" ? "FIXED APPRAISAL FEE" : "STARTING DEPOSIT"}</small><b>${spec.fee} <small>USD</small></b></span></div><div><i>hourglass_top</i><span><small>TURNAROUND</small><b>{spec.duration}</b></span></div><div><i>{kind === "appraisal" ? "science" : "precision_manufacturing"}</i><span><small>{spec.metricCaption.toUpperCase()}</small><b>{spec.metric}</b></span></div><div><i>verified_user</i><span><small>GUARANTEE</small><b>{kind === "appraisal" ? "GIA / IGI Compliant" : "Lifetime Guarantee"}</b></span></div></div>

        {kind === "resizing" && <section className="workflow-protocol"><div className="workflow-protocol-head"><div><small>BENCH VERIFICATION PROTOCOL</small><h2>Zero-Stress Metallurgy Standard</h2></div><span>♙ Accredited Seoul Atelier #09</span></div><div className="workflow-protocol-grid">{["Digital Micro-Caliper Sizing|Laser optical indexing accurately pinpoints inner shank circumference within 0.05 EU/US ring units to avoid over-expansion.", "Thermal Heat-Sink Shielding|Thermoconductive gel maintains pavé diamond temperatures strictly below 40°C while Nd:YAG laser welds at 1,064nm.", "Matching Alloy Inlay / Reflow|Exact matching grain alloy is spliced via micro-filler wire, eliminating seam discoloration under loupe inspection."].map((text, index) => <article key={text}><b>0{index + 1} · {text.split("|")[0]}</b><p>{text.split("|")[1]}</p></article>)}</div></section>}

        <form className="workflow-grid" onSubmit={submit}>
          <div className="workflow-steps">
            {kind === "custom" && <section className="workflow-section"><StepHeading number="01" title={spec.stepTitle}/><div className="workflow-choice-grid">{[
              ["In-Person Gangnam VIP Suite", "Flagship Exclusive", "Private salon with gemstone tray, gold testing, and hands-on wax prototype fitting.", "storefront"],
              ["Global 4K CAD Live Screen-Share", "Global Digital Vault", "Live high-fidelity 3D design session with wax prototype courier arrangements.", "videocam"],
            ].map(([value, eyebrow, body, icon]) => <button type="button" key={value} onClick={() => setModality(value)} className={`workflow-choice ${modality === value ? "is-selected" : ""}`}><i>{icon}</i><small>{eyebrow}</small><strong>{value}</strong><p>{body}</p></button>)}</div></section>}

            {kind === "custom" && <section className="workflow-section"><StepHeading number="02" title="Precious Metal Foundation & Gemstone Palette"/><label className="workflow-label">Base Metal Casting Medium</label><div className="workflow-metal-grid">{metals.map((item) => <button type="button" key={item.title} className={metal === item.title ? "is-selected" : ""} onClick={() => setMetal(item.title)}><i style={{ background: item.color }}/><b>{item.title}</b><small>{item.detail}</small></button>)}</div><label className="workflow-label">Primary Centerstone Preference</label><div className="workflow-stone-grid">{stones.map((item) => <button type="button" key={item.title} className={stone === item.title ? "is-selected" : ""} onClick={() => setStone(item.title)}><i style={{ color: item.color }}>{item.icon}</i><span><b>{item.title}</b><small>{item.detail}</small></span></button>)}</div></section>}

            {kind === "appraisal" && <section className="workflow-section"><StepHeading number="01" title="Select Gemstone Type & Cut Profile" detail="Choose the laboratory protocol suited to your piece."/><label className="workflow-label">Gemstone category</label><div className="workflow-stone-grid appraisal-gems">{appraisalGems.map((item) => <button type="button" key={item.title} className={gemType === item.title ? "is-selected" : ""} onClick={() => setGemType(item.title)}><i>{item.icon}</i><span><b>{item.title}</b><small>{item.detail}</small></span></button>)}</div><label className="workflow-label">Cut / Geometry Facet</label><div className="workflow-chips">{cuts.map((item) => <button type="button" key={item} className={cut === item ? "is-selected" : ""} onClick={() => setCut(item)}>{item}</button>)}</div></section>}

            {kind === "resizing" && <section className="workflow-section"><StepHeading number="01" title="Select Ring Band Architecture & Metal" detail="Identify your ring geometry for accurate sizing and alloy matching."/><div className="workflow-choice-grid">{bandTypes.map((item) => <button type="button" key={item.title} className={`workflow-choice ${band === item.title ? "is-selected" : ""}`} onClick={() => setBand(item.title)}><i>{item.icon}</i><strong>{item.title}</strong><p>{item.detail}</p></button>)}</div><label className="workflow-label">Matching metal</label><div className="workflow-chips">{metals.map((item) => <button type="button" key={item.title} className={metal === item.title ? "is-selected" : ""} onClick={() => setMetal(item.title)}>{item.title}</button>)}</div></section>}

            {kind === "resizing" && <section className="workflow-section"><StepHeading number="02" title="Sizing Configuration" detail="Specify current fit and desired size. Final fit is verified at intake."/><div className="workflow-size-grid"><label>Current ring size<select value={currentSize} onChange={(event) => setCurrentSize(event.target.value)}>{Array.from({ length: 13 }, (_, index) => 5 + index * .5).map((size) => <option value={size.toFixed(1)} key={size}>US {size.toFixed(1)}</option>)}</select></label><label>Target ring size<select value={targetSize} onChange={(event) => setTargetSize(event.target.value)}>{Array.from({ length: 13 }, (_, index) => 5 + index * .5).map((size) => <option value={size.toFixed(1)} key={size}>US {size.toFixed(1)}</option>)}</select></label></div><div className="workflow-size-result"><i>straighten</i><span><b>{sizeDifference === 0 ? "Sizing verification / no size change" : `${sizeDifference > 0 ? "+" : "−"}${Math.abs(sizeDifference).toFixed(1)} US size ${sizeDifference > 0 ? "expansion" : "reduction"}`}</b><small>Method: alloy-matched seamless laser fusion</small></span><strong>NO SHANK THINNING</strong></div></section>}

            <section className="workflow-section"><StepHeading number={kind === "custom" ? "03" : kind === "appraisal" ? "02" : "03"} title={spec.peopleTitle}/><div className="workflow-people">{spec.people.map((person) => <button type="button" key={person.title} className={`workflow-person ${designer === person.title ? "is-selected" : ""}`} onClick={() => setDesigner(person.title)}><img src={person.image} alt=""/><span><b>{person.title}</b><small className="workflow-person-badge">{person.badge}</small><small>{person.detail}</small></span><i>{designer === person.title ? "check_circle" : "radio_button_unchecked"}</i></button>)}</div></section>

          <section className="workflow-section"><StepHeading number={kind === "custom" ? "04" : kind === "appraisal" ? "03" : "04"} title={kind === "custom" ? "Schedule Atelier Date & VIP Time Slot" : kind === "appraisal" ? "Salon Drop-Off Schedule & Intake Details" : "Drop-Off / Armored Intake Slot"} detail="All appointment times are shown in Seoul local time (KST)."/><label className="workflow-label">{kind === "resizing" ? "Intake date" : "Preferred date"}</label><div className="workflow-date-grid">{slots.map((date, index) => <button type="button" key={date} disabled={date < dateFor(0)} onClick={() => setSelectedDate(date)} className={selectedDate === date ? "is-selected" : ""}><small>{index === 0 ? "TODAY" : index === 1 ? "AVAILABLE" : "SLOTS"}</small><b>{dateHeading(date)}</b><small>{index === 0 ? "Today" : `${index + 2} slots · KST`}</small></button>)}</div><label className="workflow-label">Available time</label><div className="workflow-time-grid">{spec.times.map((time) => { const candidate = new Date(`${selectedDate}T${time}:00+09:00`); const taken = bookedTimes.some((value) => new Date(value).getTime() === candidate.getTime()); return <button key={time} type="button" disabled={taken || candidate.getTime() <= Date.now()} onClick={() => setSelectedTime(time)} className={selectedTime === time ? "is-selected" : ""}>{time}{taken && <small>Reserved</small>}</button>; })}</div>
              {bookedLoading && <p className="workflow-slot-message">Checking appointment availability…</p>}{bookedError && <p className="workflow-slot-message is-error" role="status">Live availability is temporarily unavailable. The server will verify the slot when you submit.</p>}
              {kind === "appraisal" && <div className="workflow-input-grid"><label>Existing certificate / inscription number (optional)<input value={certificate} onChange={(event) => setCertificate(event.target.value)} placeholder="e.g. GIA 248910283 or unknown"/></label><label>Item / stone description<input placeholder="Loose stone, mounted ring, etc." value={notes} onChange={(event) => setNotes(event.target.value)}/></label></div>}
              {kind !== "appraisal" && <label className="workflow-label">{kind === "custom" ? "Atelier vision / specific requests" : "Engineering & special reservation notes"}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder={kind === "custom" ? "Describe your design vision, heirloom details, or special requests…" : "Describe the ring, known alloy, hallmark or sizing concerns…"}/></label>}
              <label className="workflow-label">{kind === "custom" ? "Sketch or reference photos (optional)" : kind === "appraisal" ? "Piece photos for appraisal (optional)" : "Ring condition photos (optional)"}<span className="workflow-upload"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles}/><i>cloud_upload</i><b>{files.length ? `${files.length} image(s) selected` : "Choose JPG, PNG, or WebP images"}</b><small>Up to 25 MB total. Files are stored with your appointment record.</small></span></label>
              <div className="workflow-input-grid workflow-guest-fields"><label>Full name *<input name="guestName" autoComplete="name" required placeholder="Your full name"/></label><label>Email or phone number *<input name="guestContact" autoComplete="email" required placeholder="you@example.com or +82…"/></label></div>
            </section>
          </div>

          <aside className="workflow-ledger"><div className="workflow-ledger-card"><div className="workflow-ledger-title"><span><small>{kind === "resizing" ? "SALON VAULT INTAKE" : kind === "appraisal" ? "APPRAISAL DOSSIER" : "COMMISSION LEDGER"}</small><h2>{kind === "resizing" ? "Reservation Ledger" : kind === "appraisal" ? "Assay Order" : "Bespoke Dossier"}</h2></span><b>ACTIVE</b></div><dl>
            <div><dt>Atelier Service</dt><dd>{spec.service}</dd></div><div><dt>Lead Specialist</dt><dd>{activePerson.title}</dd></div>
            {kind === "custom" && <><div><dt>Session Modality</dt><dd>{modality}</dd></div><div><dt>Base Casting Alloy</dt><dd>{metal}</dd></div><div><dt>Primary Gemstone</dt><dd>{stone}</dd></div></>}
            {kind === "appraisal" && <><div><dt>Gemstone Type</dt><dd>{gemType}</dd></div><div><dt>Cut / Geometry</dt><dd>{cut}</dd></div><div><dt>Certification</dt><dd>GIA / IGI compliant</dd></div></>}
            {kind === "resizing" && <><div><dt>Band Architecture</dt><dd>{band}</dd></div><div><dt>Size Adjustment</dt><dd>US {currentSize} → US {targetSize}</dd></div><div><dt>Matching Metal</dt><dd>{metal}</dd></div></>}
            <div><dt>Scheduled Intake</dt><dd>{dateText(selectedDate)} · {selectedTime} KST</dd></div><div><dt>Turnaround</dt><dd>{spec.duration}</dd></div></dl>
            <div className="workflow-total"><span>{kind === "resizing" ? "Estimated intake" : kind === "appraisal" ? "Total appraisal fee" : "Retainer deposit"}<b>${payable}.00 USD</b></span><small>{kind === "custom" ? "Deposit amount confirmed by concierge; no payment is collected on this page." : kind === "resizing" ? "Final quote confirmed after physical ring inspection." : "Includes grading report; payable after concierge confirms the item."}</small></div>
            {errorMessage && <p className="workflow-error" role="alert">{errorMessage}</p>}
            {confirmation ? <div className="workflow-success" role="status"><i>verified</i><b>Appointment request saved</b><span>Reference: {confirmation}. Your details are now in your account and our concierge will contact you to confirm the appointment and fee.</span><Link href="/my-page?tab=salon">View your Salon Reservations →</Link></div> : <button type="submit" className="workflow-submit" disabled={submitting || slotBooked || bookedLoading}><i>lock</i>{submitting ? "SAVING APPOINTMENT…" : bookedLoading ? "CHECKING AVAILABILITY…" : `REQUEST APPOINTMENT · $${payable}.00`}</button>}
            <ul className="workflow-trust"><li>Verified specialist and insured intake</li><li>Appointment saved to your HaDiJaM account</li><li>Payment is arranged after concierge confirmation</li></ul>
          </div><div className="workflow-contact"><span>Private Client Liaison</span><a href="tel:+8225487720">+82 (0)2 548 7720</a><a href="mailto:concierge@hadijam.uz">Contact concierge</a></div></aside>
        </form>

        {kind === "custom" && <section className="workflow-lower"><div><small>RIGOROUS GUILD PROTOCOL</small><h2>The 4-Stage Haute Creation Journey</h2></div><div className="workflow-journey">{["Conceptual Sketch & Stone Sourcing", "Precision 3D CAD & Digital Simulation", "High-Definition Wax Print & Physical Fitting", "Lost-Wax Casting & Hand-Setting"].map((title, index) => <article key={title}><b>0{index + 1}</b><img src={[image.craft, image.cad, image.bench, image.master][index]} alt=""/><h3>{title}</h3></article>)}</div></section>}
        {kind === "appraisal" && <section className="workflow-lower"><div><small>UNCOMPROMISING METALLURGY & OPTIC SCIENCE</small><h2>The Triple-Assay Gemological Standard</h2></div><div className="workflow-journey">{["Spectrometry & Raman Analysis", "Critical Refractive Indexing", "GIA Master Set Colorimetry"].map((title, index) => <article key={title}><b>0{index + 1}</b><h3>{title}</h3><p>Independent gemstone verification with calibrated laboratory equipment and a documented grading record.</p></article>)}</div></section>}
        {kind === "resizing" && <section className="workflow-lower"><div><small>METROLOGICAL PRECISION</small><h2>Frequently Examined Protocols</h2></div><div className="workflow-journey">{["Will resizing weaken diamond settings?", "What about antique inscriptions?", "Full bimetal band sizing?"].map((title) => <article key={title}><b>✦</b><h3>{title}</h3><p>Our bench team assesses every piece individually and confirms a careful, insured resizing method before work begins.</p></article>)}</div></section>}
      </div>
    </main>
  </SiteLayout>;
}
