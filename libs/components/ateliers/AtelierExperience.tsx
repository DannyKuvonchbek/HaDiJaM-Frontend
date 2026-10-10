import { authValue } from "@/libs/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import AtelierChatPanel from "@/libs/components/ateliers/AtelierChatPanel";
import { getAtelier } from "@/libs/data/ateliers";
import { GET_ATELIER_OWNER, GET_ATELIER_PRODUCTS, GET_ATELIER_SERVICES, GET_ATELIER_SOCIAL, SET_ATELIER_LIKE, SET_ATELIER_FOLLOW, GET_ATELIER_SCHEDULES, GET_ATELIER_REVIEWS, CREATE_ATELIER_REVIEW } from "@/libs/graphql/ateliers";
import { CREATE_SERVICE_BOOKING, GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS } from "@/libs/graphql/services";
import { GET_MY_SERVICE_BOOKINGS, GET_MEMBER_PROFILE } from "@/libs/graphql/myPage";
import { readMemberId } from "@/libs/utils/account";
import { uploadGraphqlFiles } from "@/libs/utils/uploadGraphqlFiles";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:2002";
const asset = (value?: string) => !value ? "/images/stitch/services/hadijam-services-live-calculator-photo-uploaded-state-licensed-gia-certified-gemologist-utilizing-an-electronic-refractometer--091.jpg" : /^(https?:|data:|\/)/.test(value) ? value : `${apiBase}/${value}`;
const kstToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dateTimeAtKst = (date: string, time: string) => new Date(`${date}T${time}:00+09:00`).toISOString();
const weekdayAtKst = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "long" }).format(new Date(`${date}T12:00:00+09:00`));

function AtelierReviewFeed({ service, bookings, isSignedIn }: { service: any; bookings: any[]; isSignedIn: boolean }) {
  const { data, loading, error, refetch } = useQuery(GET_ATELIER_REVIEWS, { variables: { serviceId: service._id, input: { page: 1, limit: 8, direction: "DESC" } }, skip: !service?._id, fetchPolicy: "network-only" });
  const [createReview, { loading: submitting }] = useMutation(CREATE_ATELIER_REVIEW);
  const eligible = bookings.filter((booking) => booking.serviceId === service._id && booking.bookingStatus === "COMPLETED");
  const [bookingId, setBookingId] = useState(eligible[0]?._id ?? "");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  useEffect(() => { if (!bookingId && eligible[0]) setBookingId(eligible[0]._id); }, [bookingId, eligible]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setFailure(""); setMessage("");
    try {
      const reviewImages = photo ? await uploadGraphqlFiles([photo], "reviews") : [];
      await createReview({ variables: { input: { serviceId: service._id, bookingId, rating, reviewContent: content.trim(), reviewImages } } });
      setMessage("Your verified review has been recorded."); setContent(""); setPhoto(null); await refetch();
    } catch (cause) { setFailure(cause instanceof Error ? cause.message : "The review could not be submitted."); }
  };
  const reviews = data?.getServiceReviews?.list ?? [];
  return <div className="atelier-review-column">
    {loading && <p className="atelier-state">Loading verified reviews…</p>}
    {error && <p className="atelier-state error">Reviews could not be loaded.</p>}
    {!loading && !reviews.length && <p className="atelier-state">Verified client reviews will appear here after completed appointments.</p>}
    {reviews.map((review: any) => <article className="atelier-review-card" key={review._id}>
      <div className="atelier-review-head"><span className="atelier-avatar">{review.memberData?.memberImage ? <img src={asset(review.memberData.memberImage)} alt="" /> : (review.memberData?.memberNick?.[0] ?? "C")}</span><div><b>{review.memberData?.memberNick ?? "Verified collector"}</b><small>Verified completed appointment · {new Date(review.createdAt).toLocaleDateString("en-US", { timeZone: "Asia/Seoul", month: "long", day: "numeric", year: "numeric" })}</small></div><strong>★ {review.rating}.0</strong></div>
      <p>{review.reviewContent}</p>{review.reviewImages?.map((image: string) => <img className="atelier-review-image" key={image} src={asset(image)} alt="Client submitted item" />)}
    </article>)}
    {isSignedIn && <form className="atelier-review-form" onSubmit={submit}>
      <h3>Share a verified client review</h3>
      {eligible.length ? <>
        <label>Completed appointment<select required value={bookingId} onChange={(event) => setBookingId(event.target.value)}>{eligible.map((booking) => <option key={booking._id} value={booking._id}>{booking.bookingReference || service.serviceTitle} · {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "short", day: "numeric", year: "numeric" }).format(new Date(booking.bookingDate))}</option>)}</select></label>
        <label>Rating <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label>
        <label>Your experience<textarea required minLength={8} maxLength={1200} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Describe your experience with the atelier." /></label>
        <label className="atelier-file-field">Attach a piece photo (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /></label>
        <button className="atelier-button gold" type="submit" disabled={submitting || !bookingId}>{submitting ? "Submitting…" : "Post verified review"}</button>
      </> : <p className="atelier-muted">A completed appointment with this service is required before posting a review.</p>}
      {failure && <p className="atelier-form-error" role="alert">{failure}</p>}{message && <p className="atelier-form-success" role="status">{message}</p>}
    </form>}
    {!isSignedIn && <p className="atelier-muted">Sign in and complete an appointment to post a verified review.</p>}
  </div>;
}

export default function AtelierExperience({ slug }: { slug: string }) {
  const atelier = getAtelier(slug);
  const router = useRouter();
  const [memberId, setMemberId] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(kstToday());
  const [bookingTime, setBookingTime] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const { data: ownerData, loading: ownerLoading, error: ownerError } = useQuery(GET_ATELIER_OWNER, { variables: { input: { page: 1, limit: 10, search: { text: "DANNY" } } }, fetchPolicy: "network-only" });
  const owner = ownerData?.getSellers?.list?.find((candidate: any) => candidate.memberNick?.toLowerCase() === "danny");
  const { data: profileData } = useQuery(GET_MEMBER_PROFILE, { variables: { memberId }, skip: !memberId, fetchPolicy: "network-only" });
  const member = profileData?.getMember;
  const servicesQuery = useQuery(GET_ATELIER_SERVICES, { variables: { input: { page: 1, limit: 60, sort: "createdAt", direction: "DESC", search: { memberId: owner?._id } } }, skip: !owner?._id, fetchPolicy: "network-only" });
  const productQuery = useQuery(GET_ATELIER_PRODUCTS, { variables: { input: { page: 1, limit: 8, sort: "createdAt", direction: "DESC", search: { memberId: owner?._id } } }, skip: !owner?._id, fetchPolicy: "network-only" });
  const services = useMemo(() => (servicesQuery.data?.getServices?.list ?? []).filter((service: any) => atelier?.services.some((definition) => definition.category === service.serviceCategory)), [servicesQuery.data, atelier]);
  const products = productQuery.data?.getProducts?.list ?? [];
  const { data: bookingData } = useQuery(GET_MY_SERVICE_BOOKINGS, { variables: { input: { page: 1, limit: 100 } }, skip: !memberId, fetchPolicy: "network-only" });
  const bookings = bookingData?.getMyServiceBookings?.list ?? [];
  const scheduleQuery = useQuery(GET_ATELIER_SCHEDULES, { variables: { serviceId: booking?.service?._id ?? "" }, skip: !booking?.service?._id, fetchPolicy: "network-only" });
  const { data: unavailableData, loading: slotsLoading } = useQuery(GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS, { variables: { input: { serviceId: booking?.service?._id ?? "", date: bookingDate, technician: booking?.definition?.technician ?? "" } }, skip: !booking?.service?._id || !bookingDate || !booking?.definition?.technician });
  const [createServiceBooking, { loading: bookingLoading }] = useMutation(CREATE_SERVICE_BOOKING);
  const [socialError, setSocialError] = useState("");
  const socialQuery = useQuery(GET_ATELIER_SOCIAL, { variables: { atelier: slug }, skip: !atelier, fetchPolicy: "network-only" });
  const [setLike, { loading: liking }] = useMutation(SET_ATELIER_LIKE);
  const [setFollow, { loading: followingAction }] = useMutation(SET_ATELIER_FOLLOW);
  const unavailable = unavailableData?.getUnavailableServiceBookingSlots ?? [];
  const scheduleDays = scheduleQuery.data?.getServiceSchedules?.list ?? [];
  const dateIsScheduled = scheduleDays.some((schedule: any) => schedule.isWorking && schedule.dayOfWeek.toLowerCase() === weekdayAtKst(bookingDate).toLowerCase());

  useEffect(() => {
    if (!router.isReady) return;
    const token = authValue("accessToken");
    if (token) setMemberId(readMemberId(token) ?? "");
  }, [router.isReady]);
  const applySocial = (social: any) => {
    setLiked(social.liked); setFollowed(social.followed);
    setLikeCount(social.likes); setFollowCount(social.followers);
  };
  useEffect(() => {
    if (socialQuery.data?.getAtelierSocial) applySocial(socialQuery.data.getAtelierSocial);
  }, [socialQuery.data]);
  useEffect(() => { setPhone(member?.memberPhone ?? ""); setAddress(member?.memberAddress ?? ""); }, [member]);

  if (!atelier) return <SiteLayout title="Atelier not found | HaDiJaM"><main className="atelier-page"><section className="atelier-shell"><h1>Atelier not found</h1><Link href="/services">Return to services</Link></section></main></SiteLayout>;
  const signedIn = Boolean(memberId);
  const requireLogin = async () => { if (signedIn) return true; await router.push(`/sign-in?mode=signin&next=${encodeURIComponent(router.asPath)}`); return false; };
  const toggleLike = async () => {
    if (liking || !(await requireLogin())) return;
    setSocialError("");
    try {
      const result = await setLike({ variables: { atelier: slug, liked: !liked } });
      if (!result.data?.setAtelierLike) throw new Error("Like could not be saved.");
      applySocial(result.data.setAtelierLike);
    } catch (error) { setSocialError(error instanceof Error ? error.message : "Like could not be saved."); }
  };
  const toggleFollow = async () => {
    if (followingAction || !(await requireLogin())) return;
    setSocialError("");
    try {
      const result = await setFollow({ variables: { atelier: slug, followed: !followed } });
      if (!result.data?.setAtelierFollow) throw new Error("Follow could not be saved.");
      applySocial(result.data.setAtelierFollow);
    } catch (error) { setSocialError(error instanceof Error ? error.message : "Follow could not be saved."); }
  };
  const openBooking = async (service: any) => { if (!(await requireLogin())) return; const definition = atelier.services.find((entry) => entry.category === service.serviceCategory); if (!definition) return; setBooking({ service, definition }); setBookingError(""); setReceipt(""); setBookingDate(kstToday()); setBookingTime(""); };
  const submitBooking = async (event: FormEvent) => {
    event.preventDefault(); if (!booking?.service?._id || !bookingTime) return;
    setBookingError("");
    try {
      const result = await createServiceBooking({ variables: { input: { serviceId: booking.service._id, selectedTechnician: booking.definition.technician, bookingDate: dateTimeAtKst(bookingDate, "00:00"), bookingTime: dateTimeAtKst(bookingDate, bookingTime), customerName: member?.memberFullName || member?.memberNick || "HaDiJaM Client", customerPhone: phone.trim(), customerAddress: address.trim(), customerNote: note.trim() } } });
      const created = result.data?.createServiceBooking; if (!created?.bookingReference) throw new Error("The server did not confirm the appointment."); setReceipt(created.bookingReference); setBooking(null); await router.push(`/my-page?tab=services&booking=${encodeURIComponent(created.bookingReference)}`);
    } catch (cause) { setBookingError(cause instanceof Error ? cause.message : "We could not reserve this appointment. Refresh availability and try again."); }
  };

  return <SiteLayout title={`${atelier.name} | HaDiJaM`}><main className={`atelier-page atelier-${atelier.slug}`}>
    <div className="atelier-shell">
      <nav className="atelier-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/services">Services</Link><span>/</span><b>{atelier.name}</b></nav>
      <section className="atelier-hero">
        <div className="atelier-hero-photo"><img src={atelier.heroImage} alt={`${atelier.name} atelier`} /><span className="atelier-live-tag">● VERIFIED ATELIER</span></div>
        <div className="atelier-hero-copy"><span className="atelier-eyebrow">{atelier.specialty}</span><h1>{atelier.heroTitle}</h1><p>{atelier.heroText}</p><div className="atelier-tag-list">{atelier.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="atelier-master"><img src={atelier.portrait} alt={atelier.master} /><div><small>MASTER SPECIALIST</small><b>{atelier.master}</b><span>{atelier.location}</span></div><span className="atelier-verified">✓ VERIFIED</span></div><div className="atelier-hero-actions"><button className={`atelier-button ${liked ? "liked" : "ghost"}`} type="button" onClick={() => void toggleLike()} disabled={socialQuery.loading || liking || followingAction}>♥ {liked ? "Liked" : "Like Atelier"} <b>{likeCount.toLocaleString()}</b></button><button className="atelier-button ghost" type="button" onClick={() => void toggleFollow()} disabled={socialQuery.loading || liking || followingAction}>{followed ? "Following" : "Follow Atelier"} <b>{followCount.toLocaleString()}</b></button><a className="atelier-button gold" href="#atelier-chat">1:1 Private Chat</a></div></div>
      </section>
      {(ownerLoading || ownerError || !owner) && <p className={`atelier-state ${ownerError ? "error" : ""}`} role="status">{ownerLoading ? "Loading the atelier profile…" : ownerError ? "The atelier profile could not be loaded." : "The linked seller account is not available."}</p>}
      {(socialError || socialQuery.error) && <p className="atelier-state error" role="alert">{socialError || socialQuery.error?.message}</p>}
      <div className="atelier-trust-row"><div><b>{likeCount}</b><span>Verified reactions</span></div><div><b>{followCount}</b><span>Patron followers</span></div><div><b>{productQuery.data?.getProducts?.metaCounter?.[0]?.total ?? products.length}</b><span>Live catalog pieces</span></div><div><b>09:00–20:00</b><span>Private chat · KST weekdays</span></div></div>

      <div className="atelier-main-grid">
        <div className="atelier-primary-column">
          <section className="atelier-section atelier-services-section"><div className="atelier-section-heading"><div><span className="atelier-eyebrow">BOOK A VERIFIED SERVICE</span><h2>Atelier Services</h2><p>Choose a service to view availability and reserve an appointment.</p></div><span className="atelier-count">{services.length} ACTIVE SERVICES</span></div>
            {servicesQuery.loading && <p className="atelier-state">Loading active services…</p>}{servicesQuery.error && <p className="atelier-state error">Service information could not be loaded.</p>}
            {!servicesQuery.loading && !services.length && <p className="atelier-state">Booking services are being prepared. Please check back shortly.</p>}
            <div className="atelier-service-grid">{services.map((service: any) => <article className="atelier-service-card" key={service._id}><img src={asset(service.serviceImages?.[0])} alt={service.serviceTitle} /><div><span className="atelier-eyebrow">{service.serviceDuration}</span><h3>{service.serviceTitle}</h3><p>{service.serviceDesc}</p><div className="atelier-service-bottom"><b>${Number(service.servicePrice).toLocaleString()} USD</b><button className="atelier-button gold" type="button" onClick={() => void openBooking(service)}>Book Service →</button></div></div></article>)}</div>
          </section>
          <section className="atelier-section"><div className="atelier-section-heading"><div><span className="atelier-eyebrow">LIVE DATABASE CATALOG</span><h2>{atelier.portfolioTitle}</h2><p>Current pieces listed by the connected HaDiJaM seller.</p></div><Link href={`/catalog?sellerId=${owner?._id ?? ""}`}>View all pieces →</Link></div>
            {productQuery.loading && <p className="atelier-state">Loading catalog…</p>}{productQuery.error && <p className="atelier-state error">Catalog could not be loaded.</p>}{!productQuery.loading && !products.length && <p className="atelier-state">There are no active pieces in this seller catalog yet.</p>}
            <div className="atelier-product-grid">{products.map((product: any) => <Link className="atelier-product-card" href={`/product/${product._id}`} key={product._id}><div><img src={asset(product.productImages?.[0])} alt={product.productTitle} /></div><section><span>HaDiJaM verified catalog</span><h3>{product.productTitle}</h3><p>{product.productDesc}</p><b>${Number(product.productPrice).toLocaleString()} <i>View piece ↗</i></b></section></Link>)}</div>
          </section>
          <section className="atelier-section atelier-reviews-section"><div className="atelier-section-heading"><div><span className="atelier-eyebrow">COMPLETED APPOINTMENTS ONLY</span><h2>{atelier.reviewTitle}</h2><p>Reviews are attached to completed service bookings.</p></div></div>
            {!memberId && <p className="atelier-muted">Sign in to view your eligible appointments and submit verified feedback.</p>}
            {services.map((service: any) => <AtelierReviewFeed key={service._id} service={service} bookings={bookings} isSignedIn={signedIn} />)}
          </section>
        </div>
        <aside className="atelier-side-column"><div id="atelier-chat"><AtelierChatPanel atelier={atelier} memberId={memberId} ownerId={owner?._id} /></div><section className="atelier-location-card"><span className="atelier-eyebrow">SEOUL PRIVATE ATELIER</span><h3>{atelier.name}</h3><p>{atelier.address}</p><p className="atelier-hours">{atelier.hours}</p><button type="button" className="atelier-button gold" onClick={() => services[0] && void openBooking(services[0])}>Reserve an appointment →</button><Link href="/contact">Contact concierge</Link></section></aside>
      </div>
    </div>
    {booking && <div className="atelier-modal-backdrop" role="presentation" onClick={() => setBooking(null)}><form className="atelier-booking-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} onSubmit={submitBooking}><button type="button" className="atelier-modal-close" onClick={() => setBooking(null)} aria-label="Close">×</button><span className="atelier-eyebrow">SECURE ATELIER INTAKE · KST</span><h2>{booking.service.serviceTitle}</h2><p>${Number(booking.service.servicePrice).toFixed(2)} USD · {booking.service.serviceDuration} · {booking.definition.technician}</p><label>Preferred date<input type="date" required min={kstToday()} value={bookingDate} onChange={(event) => { setBookingDate(event.target.value); setBookingTime(""); }} /></label>{!scheduleQuery.loading && scheduleDays.length > 0 && !dateIsScheduled && <p className="atelier-form-error">This atelier is closed on the selected day. Please choose another date.</p>}<label>Available appointment time<select required value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} disabled={slotsLoading || scheduleQuery.loading || !dateIsScheduled}><option value="">{slotsLoading || scheduleQuery.loading ? "Checking availability…" : !dateIsScheduled ? "Choose an open date first" : "Choose a time"}</option>{booking.definition.bookingSlots.filter((slot: string) => !unavailable.includes(slot)).map((slot: string) => <option key={slot} value={slot}>{slot} KST</option>)}</select></label>{!slotsLoading && dateIsScheduled && booking.definition.bookingSlots.every((slot: string) => unavailable.includes(slot)) && <p className="atelier-form-error">All listed times are reserved for this date. Choose another date.</p>}<label>Contact phone<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your phone number" /></label><label>Address<input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="City and neighborhood" /></label><label>Appointment notes<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tell the atelier what you would like to discuss." /></label>{bookingError && <p className="atelier-form-error" role="alert">{bookingError}</p>}<button className="atelier-button gold full" type="submit" disabled={bookingLoading || !bookingTime || !dateIsScheduled}>{bookingLoading ? "Saving appointment…" : "Confirm appointment"}</button><small>Appointment requests are saved to your account. Payment is not collected here.</small></form></div>}
  </main></SiteLayout>;
}
