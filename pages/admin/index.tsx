import { authValue } from "@/libs/auth";
import SellerApplications from '@/libs/components/admin/SellerApplications';
import AdminOperations from '@/libs/components/admin/AdminOperations';
import AdminAIReviewAction from '@/libs/components/admin/ai-review/AdminAIReviewAction';
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import { GET_MEMBER_PROFILE } from "@/libs/graphql/myPage";
import { GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_PRODUCTS_BY_ADMIN, REMOVE_PRODUCT_BY_ADMIN, SEND_PRODUCT_REVIEW_MESSAGE, UPDATE_MEMBER_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from "@/libs/graphql/admin";
import { readMemberId } from "@/libs/utils/account";

const PAGE_SIZE = 20;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702";
const imageSrc = (path?: string) => path ? (/^(https?:)?\/\//.test(path) ? path : `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`) : "";

export default function AdminPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState("");
  const [tab, setTab] = useState<"products" | "members">("products");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [messageProduct, setMessageProduct] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  useEffect(() => { const token = authValue("accessToken") ?? ""; const id = token ? readMemberId(token) : ""; if (!id) void router.replace("/sign-in"); else setMemberId(id); }, [router]);
  const { data: profileData, loading: profileLoading, error: profileError } = useQuery(GET_MEMBER_PROFILE, { variables: { memberId }, skip: !memberId, fetchPolicy: "network-only" });
  const profile = profileData?.getMember;
  useEffect(() => { if (memberId && !profileLoading && (profileError || !profile || profile.memberType !== "ADMIN")) void router.replace("/"); }, [memberId, profile, profileError, profileLoading, router]);
  const input = useMemo(() => ({ page, limit: PAGE_SIZE, sort: "createdAt", direction: "DESC", search: { ...(filter !== "ALL" ? { [tab === "products" ? "productStatus" : "memberStatus"]: filter } : {}), ...(search.trim() ? { text: search.trim() } : {}) } }), [filter, page, search, tab]);
  const productsQuery = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, { variables: { input }, skip: !profile || profile.memberType !== "ADMIN" || tab !== "products", fetchPolicy: "network-only", notifyOnNetworkStatusChange: true });
  const membersQuery = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { variables: { input }, skip: !profile || profile.memberType !== "ADMIN" || tab !== "members", fetchPolicy: "network-only", notifyOnNetworkStatusChange: true });
  const sellerDirectoryQuery = useQuery(GET_ALL_MEMBERS_BY_ADMIN, { variables: { input: { page: 1, limit: 1000, sort: "createdAt", direction: "DESC", search: { memberType: "SELLER" } } }, skip: !profile || profile.memberType !== "ADMIN" || tab !== "products", fetchPolicy: "network-only" });
  const [updateProduct] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
  const [removeProduct] = useMutation(REMOVE_PRODUCT_BY_ADMIN);
  const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);
  const [sendReviewMessage, { loading: sendingMessage }] = useMutation(SEND_PRODUCT_REVIEW_MESSAGE);
  const sellers = sellerDirectoryQuery.data?.getAllMembersByAdmin?.list ?? [];
  const products = (productsQuery.data?.getAllProductsByAdmin?.list ?? []).map((product: any) => ({ ...product, memberData: sellers.find((seller: any) => seller._id === product.memberId) }));
  const members = membersQuery.data?.getAllMembersByAdmin?.list ?? [];
  const activeQuery = tab === "products" ? productsQuery : membersQuery;
  const total = Number((tab === "products" ? productsQuery.data?.getAllProductsByAdmin : membersQuery.data?.getAllMembersByAdmin)?.metaCounter?.[0]?.total ?? 0);
  useEffect(() => { setPage(1); }, [tab, filter, search]);

  const setProductStatus = async (product: any, status: "ACTIVE" | "BLOCK" | "DELETE") => {
    if (!window.confirm(status === "BLOCK" ? `Block “${product.productTitle}” from the marketplace?` : status === "DELETE" ? `Mark “${product.productTitle}” for deletion? It will be hidden and can be restored until permanently deleted.` : `Restore “${product.productTitle}” to the marketplace?`)) return;
    try { await updateProduct({ variables: { input: { _id: product._id, productStatus: status } } }); setNotice(status === "BLOCK" ? "Product listing blocked." : status === "DELETE" ? "Product listing soft-deleted." : "Product listing restored."); await productsQuery.refetch(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not update the product."); }
  };
  const deletePermanently = async (product: any) => {
    if (product.productStatus !== "DELETE" || !window.confirm(`Permanently delete “${product.productTitle}”? This cannot be undone.`)) return;
    try { await removeProduct({ variables: { productId: product._id } }); setNotice("Product permanently deleted."); await productsQuery.refetch(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not delete the product."); }
  };
  const setMemberStatus = async (member: any, status: "ACTIVE" | "BLOCK" | "DELETE") => {
    if (!window.confirm(`${status === "BLOCK" ? "Block" : status === "DELETE" ? "Soft-delete" : "Reactivate"} ${member.memberNick}?`)) return;
    try { await updateMember({ variables: { input: { _id: member._id, memberStatus: status } } }); setNotice(`${member.memberNick} is now ${status.toLowerCase()}.`); await membersQuery.refetch(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not update this member."); }
  };
  const prepareMessage = (product: any) => { setMessageProduct(product); setMessageText(`Hello ${product.memberData?.memberNick ?? "Seller"},\n\nWe reviewed your product “${product.productTitle}” and need you to verify its authenticity. Please provide supporting proof within 48 hours. Until the review is complete, the listing may remain hidden from the marketplace.\n\nHaDiJaM Admin Team`); };
  const prepareAIDraft = (product: any, draft: string) => { setMessageProduct(product); setMessageText(draft); };
  const sendSellerMessage = async () => { if (!messageProduct || messageText.trim().length < 10) { setNotice("Please enter a message with at least 10 characters."); return; } try { await sendReviewMessage({ variables: { input: { productId: messageProduct._id, message: messageText.trim() } } }); setNotice(`Message saved to ${messageProduct.memberData?.memberNick ?? "the seller"}’s account inbox.`); setMessageProduct(null); } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save the seller message."); } };

  if (!memberId || profileLoading || !profile || profile.memberType !== "ADMIN") return <SiteLayout title="Admin Console | HaDiJaM"><main className="admin-console-loading">Checking administrator access…</main></SiteLayout>;
  return <SiteLayout title="Admin Console | HaDiJaM"><main className="admin-console section-shell">
    <header className="admin-console-header"><div><span className="admin-console-kicker">HaDiJaM · SYSTEM CONTROL</span><h1>Admin Console</h1><p>Manage members, review seller listings, and protect marketplace quality.</p></div><div className="admin-console-identity"><span className="material-symbols-outlined">admin_panel_settings</span><span>{profile.memberNick}<small>Administrator</small></span></div></header>
    {notice && <div className="admin-console-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")}>×</button></div>}
    <SellerApplications />
    <AdminOperations />
    <section className="admin-console-panel"><div className="admin-console-toolbar"><div className="admin-console-tabs"><button className={tab === "products" ? "active" : ""} onClick={() => { setTab("products"); setFilter("ALL"); }}>Products</button><button className={tab === "members" ? "active" : ""} onClick={() => { setTab("members"); setFilter("ALL"); }}>Members</button></div><label className="admin-search"><span className="material-symbols-outlined">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "products" ? "Search product title" : "Search member name or phone"} /></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All statuses</option>{(tab === "products" ? ["ACTIVE", "BLOCK", "DELETE", "SOLD"] : ["ACTIVE", "BLOCK", "DELETE"]).map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
      {(activeQuery.error || (tab === "products" && sellerDirectoryQuery.error)) && <p className="admin-console-state error">{activeQuery.error?.message ?? sellerDirectoryQuery.error?.message}</p>}{(activeQuery.loading || (tab === "products" && sellerDirectoryQuery.loading)) && <p className="admin-console-state">Loading records…</p>}
      {!(activeQuery.loading || (tab === "products" && sellerDirectoryQuery.loading)) && tab === "products" && <div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Seller</th><th>Price</th><th>Status</th><th>Review actions</th></tr></thead><tbody>{products.map((product: any) => <tr key={product._id}><td><div className="admin-product-cell">{product.productImages?.[0] && <img src={imageSrc(product.productImages[0])} alt="" />}<span><strong>{product.productTitle}</strong><small>{product.productType} · {new Date(product.createdAt).toLocaleDateString()}</small></span></div></td><td>{product.memberData?.memberNick ?? "Seller"}<small className="admin-subtext">{product.memberData?.memberPhone}</small></td><td>${Number(product.productPrice).toLocaleString("en-US")}</td><td><span className={`admin-status ${String(product.productStatus).toLowerCase()}`}>{product.productStatus}</span></td><td><div className="admin-actions">{product.productStatus === "ACTIVE" ? <><button onClick={() => void setProductStatus(product, "BLOCK")}>Block listing</button><button className="danger" onClick={() => void setProductStatus(product, "DELETE")}>Soft-delete</button></> : product.productStatus === "BLOCK" ? <><button className="restore" onClick={() => void setProductStatus(product, "ACTIVE")}>Activate</button><button className="danger" onClick={() => void setProductStatus(product, "DELETE")}>Soft-delete</button></> : product.productStatus === "DELETE" ? <><button className="restore" onClick={() => void setProductStatus(product, "ACTIVE")}>Restore</button><button className="danger" onClick={() => void deletePermanently(product)}>Delete forever</button></> : <span>Sold</span>}<button className="quiet" onClick={() => prepareMessage(product)}>Message seller</button><AdminAIReviewAction productId={product._id} productTitle={product.productTitle} onUseDraft={(draft) => prepareAIDraft(product, draft)} /></div></td></tr>)}</tbody></table>{products.length === 0 && <p className="admin-console-state">No products found.</p>}</div>}
      {!activeQuery.loading && tab === "members" && <div className="admin-table-wrap"><table><thead><tr><th>Member</th><th>Role</th><th>Phone</th><th>Products</th><th>Status</th><th>Action</th></tr></thead><tbody>{members.map((member: any) => <tr key={member._id}><td><div className="admin-member-cell">{member.memberImage ? <img src={imageSrc(member.memberImage)} alt="" /> : <span>{member.memberNick?.[0]?.toUpperCase()}</span>}<strong>{member.memberNick}<small>{member.memberFullName}</small></strong></div></td><td>{member.memberType}</td><td>{member.memberPhone}</td><td>{member.memberProducts}</td><td><span className={`admin-status ${String(member.memberStatus).toLowerCase()}`}>{member.memberStatus}</span></td><td>{member.memberType === "ADMIN" ? <span>Protected admin</span> : <div className="admin-actions">{member.memberStatus === "ACTIVE" ? <><button className="danger" onClick={() => void setMemberStatus(member, "BLOCK")}>Block</button><button className="danger" onClick={() => void setMemberStatus(member, "DELETE")}>Delete</button></> : member.memberStatus === "BLOCK" ? <><button className="restore" onClick={() => void setMemberStatus(member, "ACTIVE")}>Activate</button><button className="danger" onClick={() => void setMemberStatus(member, "DELETE")}>Delete</button></> : <button className="restore" onClick={() => void setMemberStatus(member, "ACTIVE")}>Restore</button>}</div>}</td></tr>)}</tbody></table>{members.length === 0 && <p className="admin-console-state">No members found.</p>}</div>}
      <footer className="admin-pagination"><span>{total.toLocaleString()} records</span><div><button disabled={page <= 1 || activeQuery.loading} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><button disabled={page >= Math.ceil(total / PAGE_SIZE) || activeQuery.loading} onClick={() => setPage((current) => current + 1)}>Next</button></div></footer>
    </section>
    {messageProduct && <div className="admin-message-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMessageProduct(null); }}><section className="admin-message-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-message-title"><button className="admin-message-close" onClick={() => setMessageProduct(null)} aria-label="Close">×</button><span className="admin-console-kicker">SELLER REVIEW</span><h2 id="admin-message-title">Message {messageProduct.memberData?.memberNick ?? "seller"}</h2><p>About: {messageProduct.productTitle}</p><textarea rows={8} value={messageText} onChange={(event) => setMessageText(event.target.value)} /><small>This message will be saved to the seller’s Messages inbox in My Page.</small><button className="admin-send-message" disabled={sendingMessage} onClick={() => void sendSellerMessage()}>{sendingMessage ? "Saving message…" : "Send account message"}</button></section></div>}
  </main></SiteLayout>;
}
