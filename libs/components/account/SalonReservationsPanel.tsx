import PrivateMediaLink from "@/libs/auth/PrivateMediaLink";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { CANCEL_MY_SALON_RESERVATION, DELETE_PAST_SALON_RESERVATION, GET_MY_SALON_RESERVATIONS, RESCHEDULE_MY_SALON_RESERVATION } from "@/libs/graphql/myPage";

type SalonReservation = {
  _id: string;
  reservationReference: string;
  reservationStatus: string;
  suiteName: string;
  bookingDate: string;
  bookingTime: string;
  guestName: string;
  guestContact: string;
  itemManifest?: string;
  selectedAmenities: string[];
  valetRequested: boolean;
};

type ReservationManifest = {
  workflow?: string;
  notes?: string;
  certificateNumber?: string;
  referenceFiles?: string[];
  quotedDepositUsd?: number;
  paymentStatus?: string;
};

function parseManifest(value?: string): ReservationManifest | null {
  if (!value?.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as ReservationManifest : null;
  } catch {
    return null;
  }
}

function dateLabel(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "Asia/Seoul" }).format(new Date(value));
}

function koreaDateInput(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function koreaTimeInput(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(value));
}

function currentKoreaDate() {
  return koreaDateInput(new Date().toISOString());
}

export default function SalonReservationsPanel() {
  const { data, loading, error, refetch } = useQuery(GET_MY_SALON_RESERVATIONS, {
    fetchPolicy: "network-only",
  });
  const [deleteReservation, { loading: deleting }] = useMutation(DELETE_PAST_SALON_RESERVATION);
  const [rescheduleReservation, { loading: rescheduling }] = useMutation(RESCHEDULE_MY_SALON_RESERVATION);
  const [cancelReservation, { loading: cancelling }] = useMutation(CANCEL_MY_SALON_RESERVATION);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const reservations: SalonReservation[] = data?.getMySalonReservations ?? [];

  const removePastReservation = async (reservation: SalonReservation) => {
    const isPast = new Date(reservation.bookingTime).getTime() < Date.now();
    if (!isPast && reservation.reservationStatus !== "CANCELLED") return;
    if (!window.confirm(`Delete reservation ${reservation.reservationReference}?`)) return;
    setDeletingId(reservation._id);
    setActionError("");
    setActionMessage("");
    try {
      const result = await deleteReservation({ variables: { reservationId: reservation._id } });
      if (!result.data?.deletePastSalonReservation) throw new Error("The reservation was not deleted.");
      await refetch();
      setActionMessage("The reservation was deleted.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "We could not delete this reservation.");
    } finally {
      setDeletingId("");
    }
  };

  const beginReschedule = (reservation: SalonReservation) => {
    setEditingId(reservation._id);
    setEditDate(koreaDateInput(reservation.bookingDate));
    setEditTime(koreaTimeInput(reservation.bookingTime));
    setActionError("");
    setActionMessage("");
  };

  const saveReschedule = async (reservation: SalonReservation) => {
    if (!editDate || !editTime) return;
    const bookingDate = new Date(`${editDate}T12:00:00+09:00`);
    const bookingTime = new Date(`${editDate}T${editTime}:00+09:00`);
    if (Number.isNaN(bookingDate.getTime()) || bookingTime.getTime() <= Date.now()) {
      setActionError("Choose a future date and time.");
      return;
    }
    setActionError("");
    setActionMessage("");
    try {
      await rescheduleReservation({
        variables: {
          input: {
            reservationId: reservation._id,
            bookingDate: bookingDate.toISOString(),
            bookingTime: bookingTime.toISOString(),
          },
        },
      });
      await refetch();
      setEditingId("");
      setActionMessage("Your reservation date and time were updated.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "We could not update your reservation.");
    }
  };

  const cancelUpcomingReservation = async (reservation: SalonReservation) => {
    if (!window.confirm(`Cancel reservation ${reservation.reservationReference}?`)) return;
    setActionError("");
    setActionMessage("");
    try {
      const result = await cancelReservation({ variables: { reservationId: reservation._id } });
      if (!result.data?.cancelMySalonReservation) throw new Error("The reservation was not cancelled.");
      await refetch();
      setEditingId("");
      setActionMessage("Your reservation was cancelled. You can now delete it from your list.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "We could not cancel this reservation.");
    }
  };

  return (
    <section className="salon-reservations-panel" aria-labelledby="salon-reservations-title">
      <div className="salon-reservations-heading">
        <div>
          <span>GANGNAM FLAGSHIP SALON</span>
          <h2 id="salon-reservations-title">Salon Reservations</h2>
        </div>
        {!loading && !error && <b>{reservations.length} {reservations.length === 1 ? "booking" : "bookings"}</b>}
      </div>
      {loading ? <p className="salon-reservations-state">Loading your reservations…</p> : null}
      {error ? <p className="salon-reservations-state error">We could not load your reservations. Please refresh and try again.</p> : null}
      {actionError && <p className="salon-reservations-state error" role="alert">{actionError}</p>}
      {actionMessage && <p className="salon-reservations-state success" role="status">{actionMessage}</p>}
      {!loading && !error && reservations.length === 0 ? (
        <p className="salon-reservations-state">You have no salon reservations yet. Confirm a private suite visit to see its receipt here.</p>
      ) : null}
      <div className="salon-reservation-list">
        {reservations.map((reservation) => {
          const manifest = parseManifest(reservation.itemManifest);
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1997";
          return <article className="salon-reservation-receipt" key={reservation._id}>
            <div className="salon-reservation-receipt-heading">
              <div><span>DATABASE RECORD · VIP LEDGER</span><h3>{manifest?.workflow ?? "VIP Reservation"}</h3></div>
              <b className={`reservation-status ${reservation.reservationStatus.toLowerCase()}`}>{reservation.reservationStatus}</b>
            </div>
            <dl>
              <div><dt>Booking Reference</dt><dd>{reservation.reservationReference}</dd></div>
              <div><dt>Allocated Suite</dt><dd>{reservation.suiteName}</dd></div>
              <div><dt>Date</dt><dd>{dateLabel(reservation.bookingDate, { month: "long", day: "numeric", year: "numeric" })}</dd></div>
              <div><dt>Time Block</dt><dd>{dateLabel(reservation.bookingTime, { hour: "2-digit", minute: "2-digit", hour12: false })} KST</dd></div>
              <div><dt>Guest</dt><dd>{reservation.guestName} · {reservation.guestContact}</dd></div>
              <div><dt>Selected Amenities</dt><dd>{reservation.selectedAmenities?.length ? reservation.selectedAmenities.join(", ") : "None selected"}{reservation.valetRequested ? " · Private valet" : ""}</dd></div>
              {manifest?.workflow && <div><dt>Service</dt><dd>{manifest.workflow}</dd></div>}
              {manifest?.quotedDepositUsd !== undefined && <div><dt>Estimated fee / deposit</dt><dd>${Number(manifest.quotedDepositUsd).toFixed(2)} USD · {manifest.paymentStatus === "AWAITING_CONCIERGE_CONFIRMATION" ? "Awaiting confirmation" : manifest.paymentStatus}</dd></div>}
              {manifest?.certificateNumber && <div><dt>Certificate number</dt><dd>{manifest.certificateNumber}</dd></div>}
              {manifest?.notes && <div><dt>Client notes</dt><dd>{manifest.notes}</dd></div>}
              {!manifest && <div><dt>Intake details</dt><dd>{reservation.itemManifest?.trim() || "No item details provided"}</dd></div>}
            </dl>
            {!!manifest?.referenceFiles?.length && <div className="salon-reservation-attachments"><b>Reference images</b>{manifest.referenceFiles.map((path) => <PrivateMediaLink path={path} key={path}>{path.split("/").pop()} ↗</PrivateMediaLink>)}</div>}
            {editingId === reservation._id && <div className="salon-reservation-edit">
              <label>New date<input type="date" min={currentKoreaDate()} value={editDate} onChange={(event) => setEditDate(event.target.value)} /></label>
              <label>New time<input type="time" value={editTime} onChange={(event) => setEditTime(event.target.value)} /></label>
              <div className="salon-reservation-edit-actions">
                <button type="button" className="salon-reservation-save" disabled={rescheduling} onClick={() => void saveReschedule(reservation)}>{rescheduling ? "Saving…" : "Save changes"}</button>
                <button type="button" className="salon-reservation-edit-cancel" disabled={rescheduling} onClick={() => setEditingId("")}>Keep current booking</button>
              </div>
            </div>}
            <div className="salon-reservation-actions">
              <p className="salon-reservation-saved">Saved to your account · {dateLabel(reservation.bookingDate, { month: "short", day: "numeric", year: "numeric" })}</p>
              <div className="salon-reservation-buttons">
                {new Date(reservation.bookingTime).getTime() > Date.now() && reservation.reservationStatus !== "CANCELLED" && <>
                  <button type="button" className="salon-reservation-reschedule" disabled={rescheduling || cancelling} onClick={() => editingId === reservation._id ? setEditingId("") : beginReschedule(reservation)}><EditCalendarOutlinedIcon />{editingId === reservation._id ? "Close editor" : "Change date & time"}</button>
                  <button type="button" className="salon-reservation-cancel" disabled={cancelling || rescheduling} onClick={() => void cancelUpcomingReservation(reservation)}><EventBusyOutlinedIcon />{cancelling ? "Cancelling…" : "Cancel reservation"}</button>
                </>}
                {(new Date(reservation.bookingTime).getTime() < Date.now() || reservation.reservationStatus === "CANCELLED") && <button type="button" className="salon-reservation-delete" disabled={deleting} onClick={() => void removePastReservation(reservation)}><DeleteOutlineRoundedIcon />{deletingId === reservation._id ? "Deleting…" : "Delete reservation"}</button>}
              </div>
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}
