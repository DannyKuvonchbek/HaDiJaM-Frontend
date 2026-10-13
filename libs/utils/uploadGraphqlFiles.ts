import { authorizedFetch } from "@/libs/auth";
import { authValue } from "@/libs/auth";
export async function uploadGraphqlFiles(files: File[], target = "atelier") {
  if (!files.length) return [] as string[];
  const token = authValue("accessToken");
  if (!token) throw new Error("Sign in to upload an attachment.");
  const form = new FormData();
  form.append("operations", JSON.stringify({ query: "mutation UploadAtelierFiles($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }", variables: { files: files.map(() => null), target } }));
  form.append("map", JSON.stringify(Object.fromEntries(files.map((_, index) => [String(index), [`variables.files.${index}`]]))));
  files.forEach((file, index) => form.append(String(index), file, file.name));
  const response = await authorizedFetch(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1997/graphql", { method: "POST", headers: { authorization: `Bearer ${token}`, "apollo-require-preflight": "true" }, body: form });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length || !Array.isArray(payload.data?.imagesUploader)) throw new Error(payload.errors?.[0]?.message ?? "Attachment upload failed.");
  return payload.data.imagesUploader as string[];
}
