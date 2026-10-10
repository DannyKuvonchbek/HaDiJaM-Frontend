import { authorizedFetch } from "@/libs/auth";
import { authValue } from "@/libs/auth";
import { gql } from "@apollo/client";
const applicationFields = gql`
  fragment SellerApplicationFields on SellerApplication {
    _id
    memberId
    businessName
    businessAddress
    idDocumentId
    businessDocumentId
    status
    revision
    rejectionReason
    reviewedAt
    createdAt
    memberNick
    memberPhone
  }
`;
export const MY_APPLICATION = gql`
  query MySellerApplication {
    getMySellerApplication {
      ...SellerApplicationFields
    }
  }
  ${applicationFields}
`;
export const SUBMIT_APPLICATION = gql`
  mutation SubmitSellerApplication($input: SellerApplicationInput!) {
    submitSellerApplication(input: $input) {
      ...SellerApplicationFields
    }
  }
  ${applicationFields}
`;
export const ADMIN_APPLICATIONS = gql`
  query AdminSellerApplications($input: AdminPageInput!) {
    getSellerApplicationsByAdmin(input: $input) {
      list {
        ...SellerApplicationFields
      }
      total
      pendingCount
    }
  }
  ${applicationFields}
`;
export const REVIEW_APPLICATION = gql`
  mutation ReviewSellerApplication($input: SellerReviewInput!) {
    reviewSellerApplication(input: $input) {
      ...SellerApplicationFields
    }
  }
  ${applicationFields}
`;
export const ADMIN_RECORDS = gql`
  query AdminRecords($domain: String!, $input: AdminPageInput!) {
    getAdminRecords(domain: $domain, input: $input) {
      list {
        _id
        data
      }
      total
    }
  }
`;
export const UPDATE_RECORD = gql`
  mutation UpdateAdminRecord($input: AdminRecordUpdate!) {
    updateAdminRecord(input: $input) {
      _id
      data
    }
  }
`;
export const REQUEUE_SMS = gql`
  mutation RequeueSms($jobId: String!) {
    requeueSmsByAdmin(jobId: $jobId)
  }
`;
const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702").replace(
    /\/$/,
    "",
  );
export async function uploadSellerDocument(file: File): Promise<string> {
  if (
    !["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Choose a PDF, JPG or PNG document up to 10 MB.");
  const token = authValue("accessToken");
  if (!token) throw new Error("Please sign in again.");
  const body = new FormData();
  body.append("file", file);
  const response = await authorizedFetch(`${apiBase()}/seller-documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "Document upload failed.",
    );
  return result.documentId;
}
export async function fetchSellerDocument(id: string, signal?: AbortSignal) {
  const response = await authorizedFetch(
    `${apiBase()}/seller-documents/${encodeURIComponent(id)}`,
    {
      signal,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${authValue("accessToken") ?? ""}`,
      },
    },
  );
  if (!response.ok) throw new Error("Document could not be opened.");
  const blob = await response.blob();
  if (!["application/pdf", "image/png", "image/jpeg"].includes(blob.type))
    throw new Error("Unsupported document format.");
  return blob;
}

export type SellerDraft = {
  businessName: string;
  businessAddress: string;
  idDocumentId?: string;
  businessDocumentId?: string;
};
export type SellerDocument = {
  _id: string;
  filename: string;
  mime: string;
  createdAt: string;
};
const draftKey = () =>
  `seller-application-draft:${authValue("memberNick") ?? ""}`;
export function readSellerDraft(): SellerDraft | null {
  try {
    return JSON.parse(sessionStorage.getItem(draftKey()) || "null");
  } catch {
    return null;
  }
}
export function saveSellerDraft(draft: SellerDraft) {
  sessionStorage.setItem(draftKey(), JSON.stringify(draft));
}
export function clearSellerDraft() {
  sessionStorage.removeItem(draftKey());
}
export async function loadSellerDocuments(): Promise<SellerDocument[]> {
  const response = await authorizedFetch(`${apiBase()}/seller-documents`, {
    headers: {
      Authorization: `Bearer ${authValue("accessToken") ?? ""}`,
    },
  });
  if (!response.ok)
    throw new Error("Could not load your previously uploaded documents.");
  return response.json();
}
