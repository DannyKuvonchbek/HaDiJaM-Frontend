import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADMIN_APPLICATIONS,
  REVIEW_APPLICATION,
  fetchSellerDocument,
} from "@/libs/graphql/sellerApproval";
export default function SellerApplications() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [notice, setNotice] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; title: string } | null>(null);
  const [preview, setPreview] = useState<{ url: string; mime: string } | null>(null);
  const [documentError, setDocumentError] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setPreview(null);
    setDocumentError("");
    if (!selectedDocument) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    const previousFocus = window.document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    void fetchSellerDocument(selectedDocument.id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview({ url: objectUrl, mime: blob.type });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setDocumentError(error instanceof Error ? error.message : "Document unavailable.");
      });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedDocument(null);
    };
    window.addEventListener("keydown", escape);
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.removeEventListener("keydown", escape);
      previousFocus?.focus();
    };
  }, [selectedDocument]);
  const { data, error, loading, refetch } = useQuery(ADMIN_APPLICATIONS, {
    variables: { input: { page, limit: 20, ...(status ? { status } : {}) } },
    fetchPolicy: "network-only",
    pollInterval: 15000,
  });
  const [review, { loading: reviewing }] = useMutation(REVIEW_APPLICATION);
  const records = data?.getSellerApplicationsByAdmin;
  const decide = async (application: any, decision: string) => {
    const reason =
      decision === "REJECTED"
        ? window.prompt(
            "Explain why the application requires changes (at least 5 characters):",
          )
        : undefined;
    if (decision === "REJECTED" && (!reason || reason.trim().length < 5))
      return;
    if (
      !window.confirm(
        `${decision === "APPROVED" ? "Approve" : "Reject"} ${application.memberNick ?? application.businessName}?`,
      )
    )
      return;
    setNotice("");
    try {
      await review({
        variables: {
          input: {
            applicationId: application._id,
            revision: application.revision,
            decision,
            ...(reason ? { reason: reason.trim() } : {}),
          },
        },
      });
      setNotice(
        decision === "APPROVED"
          ? "Seller approved. Their account inbox has been notified."
          : "Application rejected. The applicant can update and resubmit.",
      );
      await refetch();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Review could not be saved.");
    }
  };
  return (
    <section className="admin-console-panel" style={{ marginBottom: 24 }}>
      <div className="admin-console-toolbar">
        <h2>
          Seller Applications{" "}
          <small>({records?.pendingCount ?? 0} pending)</small>
        </h2>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All applications</option>
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error.message}</p>}
      {loading && !data && <p>Loading applications…</p>}
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Business</th>
              <th>Documents</th>
              <th>Status</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {records?.list.map((a: any) => (
              <tr key={a._id}>
                <td>
                  {a.memberNick}
                  <small className="admin-subtext">{a.memberPhone}</small>
                </td>
                <td>
                  {a.businessName}
                  <small className="admin-subtext">{a.businessAddress}</small>
                </td>
                <td>
                  <div className="admin-actions">
                    <button disabled={!a.idDocumentId} onClick={() => setSelectedDocument({ id: a.idDocumentId, title: `${a.memberNick} — ID document` })}>
                      View ID document
                    </button>
                    <button disabled={!a.businessDocumentId} onClick={() => setSelectedDocument({ id: a.businessDocumentId, title: `${a.memberNick} — Business document` })}>
                      View business document
                    </button>
                  </div>
                </td>
                <td>
                  {a.status}
                  <small className="admin-subtext">{a.rejectionReason}</small>
                </td>
                <td>
                  {a.status === "PENDING" && (
                    <div className="admin-actions">
                      <button
                        disabled={reviewing}
                        onClick={() => void decide(a, "APPROVED")}
                      >
                        Activate seller
                      </button>
                      <button
                        className="danger"
                        disabled={reviewing}
                        onClick={() => void decide(a, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records && records.list.length === 0 && <p>No applications found.</p>}
      </div>
      {selectedDocument && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(0,0,0,.8)", padding: "3vh 3vw", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <section role="dialog" aria-modal="true" aria-labelledby="seller-document-title" style={{ background: "#191917", border: "1px solid #48443b", borderRadius: 12, padding: 20, width: "min(1100px, 100%)", maxHeight: "94vh", overflow: "auto" }}>
            <div className="admin-console-toolbar">
              <h2 id="seller-document-title">{selectedDocument.title}</h2>
              <div className="admin-actions">
                {preview && <a href={preview.url} download={`seller-document.${preview.mime === "application/pdf" ? "pdf" : preview.mime === "image/png" ? "png" : "jpg"}`}>Download</a>}
                <button ref={closeButton} onClick={() => setSelectedDocument(null)}>Close</button>
              </div>
            </div>
            {documentError ? <p role="alert">{documentError}</p> : !preview ? <p role="status">Loading document…</p> : preview.mime === "application/pdf" ? (
              <iframe src={preview.url} title={selectedDocument.title} style={{ width: "100%", height: "72vh", border: 0, background: "white" }} />
            ) : (
              <img src={preview.url} alt={selectedDocument.title} style={{ display: "block", maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", margin: "0 auto" }} />
            )}
          </section>
        </div>
      )}
      <footer className="admin-pagination">
        <span>{records?.total ?? 0} applications</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * 20 >= (records?.total ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}
