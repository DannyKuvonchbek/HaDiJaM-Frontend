import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADMIN_RECORDS,
  UPDATE_RECORD,
  REQUEUE_SMS,
} from "@/libs/graphql/sellerApproval";
type Configuration = {
  label: string;
  status?: string;
  states?: string[];
  fields: string[];
};
const domains: Record<string, Configuration> = {
  services: {
    label: "Services",
    status: "serviceStatus",
    states: ["DRAFT", "ACTIVE", "INACTIVE", "DELETE"],
    fields: [
      "serviceTitle",
      "serviceCategory",
      "serviceType",
      "servicePrice",
      "serviceDuration",
      "serviceDesc",
    ],
  },
  orders: {
    label: "Orders",
    fields: ["deliveryAddress", "deliveryPhone", "paymentStatus"],
  },
  orderItems: {
    label: "Order items",
    status: "itemStatus",
    states: [
      "REQUESTED",
      "CONFIRMED",
      "REJECTED",
      "PREPARING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
    ],
    fields: [],
  },
  bookings: {
    label: "Service bookings",
    status: "bookingStatus",
    states: ["REQUESTED", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"],
    fields: ["customerNote"],
  },
  salon: {
    label: "Salon reservations",
    status: "reservationStatus",
    states: ["REQUESTED", "CONFIRMED", "CANCELLED"],
    fields: [],
  },
  requests: {
    label: "Service requests",
    status: "requestStatus",
    states: [
      "NEW",
      "REVIEWING",
      "QUOTED",
      "ACCEPTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ],
    fields: ["estimatedPrice", "finalPrice", "customerNote"],
  },
  deliveries: {
    label: "Deliveries",
    status: "deliveryStatus",
    states: ["NEW", "PREPARING", "SENT", "RECEIVED", "RETURNED", "CANCELLED"],
    fields: ["trackingNumber", "courierName", "deliveryNote"],
  },
  reviews: {
    label: "Service reviews",
    status: "moderationStatus",
    states: ["VISIBLE", "HIDDEN"],
    fields: [],
  },
  articles: {
    label: "Community articles",
    status: "articleStatus",
    states: ["ACTIVE", "DELETE"],
    fields: ["articleTitle", "articleContent"],
  },
  comments: {
    label: "Comments",
    status: "commentStatus",
    states: ["ACTIVE", "DELETE"],
    fields: [],
  },
  sms: { label: "SMS delivery", fields: [] },
  audits: { label: "Admin audit history", fields: [] },
};
const label = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
export default function AdminOperations() {
  const [domain, setDomain] = useState("services");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [changes, setChanges] = useState<Record<string, any>>({});
  const config = domains[domain];
  const { data, loading, error, refetch } = useQuery(ADMIN_RECORDS, {
    variables: { domain, input: { page, limit: 20 } },
    fetchPolicy: "network-only",
    pollInterval: domain === "sms" ? 15000 : 0,
  });
  const [update, { loading: saving }] = useMutation(UPDATE_RECORD);
  const [requeue] = useMutation(REQUEUE_SMS);
  const result = data?.getAdminRecords;
  const rows = (result?.list ?? []).map((r: any) => JSON.parse(r.data));
  const save = async () => {
    if (!Object.keys(changes).length) return;
    try {
      await update({
        variables: {
          input: { domain, id: editing._id, changes: JSON.stringify(changes) },
        },
      });
      setEditing(null);
      setChanges({});
      setNotice("Changes saved and recorded in the admin audit.");
      await refetch();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Changes could not be saved.");
    }
  };
  const retry = async (id: string) => {
    if (
      !window.confirm(
        "Queue this SMS for delivery? The gateway must be configured and enabled.",
      )
    )
      return;
    try {
      await requeue({ variables: { jobId: id } });
      await refetch();
      setNotice("SMS queued for delivery.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "SMS could not be queued.");
    }
  };
  return (
    <section className="admin-console-panel" style={{ marginBottom: 24 }}>
      <div className="admin-console-toolbar">
        <h2>Operations</h2>
        <select
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value);
            setPage(1);
            setEditing(null);
            setChanges({});
            setNotice("");
          }}
        >
          {Object.entries(domains).map(([key, c]) => (
            <option key={key} value={key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error.message}</p>}
      {loading && !data && <p>Loading records…</p>}
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>{config.label}</th>
              <th>Status</th>
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r._id}>
                <td>
                  {r.serviceTitle ||
                    r.requestTitle ||
                    r.articleTitle ||
                    r.customerName ||
                    r.guestName ||
                    r.action ||
                    r.phone ||
                    `Record ${String(r._id).slice(-8)}`}
                  <small className="admin-subtext">
                    {r.createdAt && new Date(r.createdAt).toLocaleString()}
                  </small>
                </td>
                <td>
                  {r[config.status ?? "status"] ||
                    r.orderStatus ||
                    r.outcome ||
                    (domain === "reviews" ? "VISIBLE" : "—")}
                </td>
                <td>
                  <details>
                    <summary>View details</summary>
                    <dl>
                      {Object.entries(r)
                        .filter(
                          ([k, v]) =>
                            !["_id", "__v", "memberPassword"].includes(k) &&
                            v !== null &&
                            typeof v !== "object",
                        )
                        .map(([k, v]) => (
                          <div key={k}>
                            <dt>{label(k)}</dt>
                            <dd
                              style={{
                                whiteSpace: "pre-wrap",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {String(v)}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </details>
                </td>
                <td>
                  {!["sms", "audits"].includes(domain) && (
                    <button
                      onClick={() => {
                        setEditing(r);
                        setChanges({});
                        setNotice("");
                      }}
                    >
                      Manage
                    </button>
                  )}
                  {domain === "sms" &&
                    ["DISABLED", "FAILED"].includes(r.status) && (
                      <button onClick={() => void retry(r._id)}>
                        Queue SMS
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result && !rows.length && <p>No records found.</p>}
      </div>
      <footer className="admin-pagination">
        <span>{result?.total ?? 0} records</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * 20 >= (result?.total ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </footer>
      {editing && (
        <div className="admin-message-backdrop">
          <section
            className="admin-message-dialog"
            style={{ maxHeight: "85vh", overflowY: "auto" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="operation-edit-title"
          >
            <button
              className="admin-message-close"
              onClick={() => setEditing(null)}
            >
              ×
            </button>
            <h2 id="operation-edit-title">
              Manage {config.label.toLowerCase()}
            </h2>
            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              {config.status && (
                <label>
                  Status
                  <select
                    value={
                      changes[config.status] ??
                      editing[config.status] ??
                      (domain === "reviews" ? "VISIBLE" : "")
                    }
                    onChange={(e) =>
                      setChanges((c) => ({
                        ...c,
                        [config.status!]: e.target.value,
                      }))
                    }
                  >
                    {config.states?.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}
              {config.fields.map((field) => (
                <label key={field}>
                  {label(field)}
                  {field === "paymentStatus" ? (
                    <select
                      value={changes[field] ?? editing[field] ?? "PENDING"}
                      onChange={(e) =>
                        setChanges((c) => ({ ...c, [field]: e.target.value }))
                      }
                    >
                      {[
                        "PENDING",
                        "PAID",
                        "FAILED",
                        "REFUND_PENDING",
                        "REFUNDED",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={/Price$/.test(field) ? "number" : "text"}
                      min={/Price$/.test(field) ? 0 : undefined}
                      step={/Price$/.test(field) ? "0.01" : undefined}
                      value={changes[field] ?? editing[field] ?? ""}
                      onChange={(e) =>
                        setChanges((c) => ({
                          ...c,
                          [field]: /Price$/.test(field)
                            ? Number(e.target.value)
                            : e.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              ))}
              <p>Status changes must follow the record’s allowed workflow.</p>
              {notice && <p role="alert">{notice}</p>}
              <button disabled={saving || !Object.keys(changes).length}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
