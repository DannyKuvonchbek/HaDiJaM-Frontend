import PrivateMediaLink from "@/libs/auth/PrivateMediaLink";
import { useQuery } from "@apollo/client";
import { GET_MY_SERVICE_BOOKINGS } from "@/libs/graphql/myPage";

type ServiceBooking = {
  _id: string; serviceId: string; serviceTitle?: string; bookingReference?: string; bookingDate: string; bookingTime: string;
  bookingStatus: string; bookingPrice: number; paymentStatus: string; selectedTechnician: string;
  selectedItems: string[]; itemDescription?: string; itemPhoto?: string; customerName: string; customerNote?: string;
};
const dateLabel = (value: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...options, timeZone: "Asia/Seoul" }).format(new Date(value));

export default function ServiceBookingsPanel() {
  const { data, loading, error } = useQuery(GET_MY_SERVICE_BOOKINGS, { variables: { input: { page: 1, limit: 50 } }, fetchPolicy: "network-only" });
  const bookings: ServiceBooking[] = data?.getMyServiceBookings?.list ?? [];
  return <section className="service-bookings-panel">
    <div className="service-bookings-heading"><div><span>ATELIER LEDGER · KST</span><h2>Service Bookings</h2></div><b>{bookings.length} {bookings.length === 1 ? "booking" : "bookings"}</b></div>
    {loading && <p className="service-bookings-state">Loading your service bookings…</p>}
    {error && <p className="service-bookings-state error">We could not load your bookings. Please refresh the page.</p>}
    {!loading && !error && bookings.length === 0 && <p className="service-bookings-state">No atelier bookings yet. Book a service to see its confirmation here.</p>}
    <div className="service-bookings-list">{bookings.map((booking) => <article className="service-booking-receipt" key={booking._id}>
      <div className="service-booking-receipt-heading"><div><span>DATABASE RECORD · {booking.bookingReference ?? booking._id}</span><h3>{booking.serviceTitle || "Atelier Appointment"}</h3></div><b className={`service-booking-status ${booking.bookingStatus.toLowerCase()}`}>{booking.bookingStatus}</b></div>
      <dl><div><dt>Date</dt><dd>{dateLabel(booking.bookingDate, { month: "long", day: "numeric", year: "numeric" })}</dd></div><div><dt>Appointment</dt><dd>{dateLabel(booking.bookingTime, { hour: "2-digit", minute: "2-digit", hour12: false })} KST</dd></div><div><dt>Specialist</dt><dd>{booking.selectedTechnician}</dd></div>{booking.selectedItems?.length > 0 && <div><dt>Pieces</dt><dd>{booking.selectedItems.join(", ")}</dd></div>}{booking.itemDescription && <div><dt>Care notes</dt><dd>{booking.itemDescription}</dd></div>}<div><dt>Amount due</dt><dd>${Number(booking.bookingPrice).toFixed(2)} · {booking.paymentStatus}</dd></div></dl>
      {booking.itemPhoto && <PrivateMediaLink className="service-booking-photo" path={booking.itemPhoto}>View uploaded item photo ↗</PrivateMediaLink>}
      <p>Saved to your account · booking changes are handled by the atelier.</p>
    </article>)}</div>
  </section>;
}
