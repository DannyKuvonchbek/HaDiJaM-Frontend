import { FormEvent, useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  MY_APPLICATION,
  SUBMIT_APPLICATION,
  uploadSellerDocument,
  loadSellerDocuments,
  readSellerDraft,
  saveSellerDraft,
  clearSellerDraft,
  type SellerDocument,
} from "@/libs/graphql/sellerApproval";
export default function SellerApplicationPanel({
  memberType,
  sellerIntent,
  onApproved,
}: {
  memberType: string;
  sellerIntent?: boolean;
  onApproved: () => void;
}) {
  const { data, loading, error, refetch } = useQuery(MY_APPLICATION, {
    skip: !sellerIntent || memberType !== "USER",
    fetchPolicy: "network-only",
    pollInterval: 1000,
    onCompleted: (result) => {
      if (
        result.getMySellerApplication?.status === "APPROVED" &&
        memberType !== "SELLER"
      )
        onApproved();
    },
  });
  const [submit] = useMutation(SUBMIT_APPLICATION);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const application = data?.getMySellerApplication;
  const [documents, setDocuments] = useState<SellerDocument[]>([]);
  const [idDocumentId, setIdDocumentId] = useState("");
  const [businessDocumentId, setBusinessDocumentId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    if (!sellerIntent || memberType !== "USER") return;
    const draft = readSellerDraft();
    if (draft) {
      setBusinessName(draft.businessName);
      setBusinessAddress(draft.businessAddress);
      setIdDocumentId(draft.idDocumentId ?? "");
      setBusinessDocumentId(draft.businessDocumentId ?? "");
    }
    setDraftLoaded(true);
    void loadSellerDocuments()
      .then(setDocuments)
      .catch((e) => setNotice(e.message));
  }, [memberType, sellerIntent]);
  useEffect(() => {
    if (application?.status === "REJECTED") {
      setBusinessName(application.businessName);
      setBusinessAddress(application.businessAddress);
    }
  }, [
    application?.status,
    application?.businessName,
    application?.businessAddress,
  ]);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setNotice("");
    try {
      const draft = {
        businessName: String(form.get("businessName")).trim(),
        businessAddress: String(form.get("businessAddress")).trim(),
        idDocumentId,
        businessDocumentId,
      };
      saveSellerDraft(draft);
      const idFile = form.get("idDocument") as File;
      const businessFile = form.get("businessDocument") as File;
      if (idFile?.size) {
        draft.idDocumentId = await uploadSellerDocument(idFile);
        setIdDocumentId(draft.idDocumentId);
        saveSellerDraft(draft);
      }
      if (businessFile?.size) {
        draft.businessDocumentId = await uploadSellerDocument(businessFile);
        setBusinessDocumentId(draft.businessDocumentId);
        saveSellerDraft(draft);
      }
      await submit({ variables: { input: {...draft, idDocumentId: draft.idDocumentId || null, businessDocumentId: draft.businessDocumentId || null} } });
      clearSellerDraft();
      await refetch();
      setNotice(
        "Please wait. Your seller application is being reviewed by our administrator. We will notify you as soon as a decision is made.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Your application could not be submitted. Please try again from this account.",
      );
    } finally {
      setBusy(false);
    }
  };
  // Submitted applications report their status through account notifications.
  // Keep this panel only for completing or correcting an application.
  if (
    !sellerIntent ||
    memberType !== "USER" ||
    application?.status === "APPROVED"
  )
    return null;
  return (
    <section className="account-messages-panel" style={{ marginBottom: 24 }}>
      <header>
        <div>
          <span className="account-panel-eyebrow">SELLER VERIFICATION</span>
          <h2>
            {application?.status === "PENDING"
              ? "Seller application under review"
              : application
              ? `Application: ${application.status.toLowerCase()}`
              : "Become a verified seller"}
          </h2>
        </div>
      </header>
      {loading && !data && <p>Loading application…</p>}
      {error && <p role="alert">{error.message}</p>}
      {application?.status === "REJECTED" && (
        <p role="alert">
          Your application requires changes: {application.rejectionReason}.
          Update your documents below to apply again.
        </p>
      )}
      {application?.status === "PENDING" && (
        <p role="status">
          Your seller application is being processed. Your account will be activated automatically after a short review. We will notify you in Messages.
        </p>
      )}
      {memberType === "USER" &&
        !loading &&
        !error &&
        (!application || application.status === "REJECTED") && (
          <form className="auth-form" onSubmit={send}>
            <label>
              Business name
              <input
                name="businessName"
                minLength={2}
                maxLength={150}
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                required
              />
            </label>
            <label>
              Business address
              <input
                name="businessAddress"
                minLength={5}
                maxLength={500}
                value={businessAddress}
                onChange={(event) => setBusinessAddress(event.target.value)}
                required
              />
            </label>
            {documents.length > 0 && (
              <>
                <p>
                  Your previous uploads are available. Select the ID and
                  business documents below or upload replacements.
                </p>
                <label>
                  Previously uploaded ID document
                  <select
                    value={idDocumentId}
                    onChange={(event) => setIdDocumentId(event.target.value)}
                  >
                    <option value="">Upload a new ID document</option>
                    {documents.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.filename} ·{" "}
                        {new Date(doc.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Previously uploaded business document
                  <select
                    value={businessDocumentId}
                    onChange={(event) =>
                      setBusinessDocumentId(event.target.value)
                    }
                  >
                    <option value="">Upload a new business document</option>
                    {documents.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.filename} ·{" "}
                        {new Date(doc.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label>
              ID document (optional · PDF, JPG or PNG, up to 10 MB)
              <input
                name="idDocument"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
              />
            </label>
            <label>
              Business registration document (optional · PDF, JPG or PNG, up to 10 MB)
              <input
                name="businessDocument"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
              />
            </label>
            <p>
              Your documents are private and accessible only to you and
              authorized administrators.
            </p>
            <button
              className="button button-gold"
              disabled={busy || !draftLoaded}
            >
              {busy ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
