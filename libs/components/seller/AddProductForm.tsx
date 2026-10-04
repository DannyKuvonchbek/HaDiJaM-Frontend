import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/router";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import {
  CREATE_PRODUCT,
  GET_SELLER_PRODUCTS,
  uploadProductImages,
} from "@/libs/graphql/sellerProducts";

type JewelryType =
  | "ring"
  | "necklace"
  | "bracelet"
  | "chain"
  | "watch"
  | "brooch"
  | "earring";
type Photo = { file: File; preview: string };
const categories: Array<{ value: JewelryType; label: string; icon: string }> = [
  { value: "ring", label: "Rings", icon: "diamond" },
  { value: "necklace", label: "Necklaces", icon: "all_inclusive" },
  { value: "bracelet", label: "Bracelets", icon: "radio_button_checked" },
  { value: "chain", label: "Chains", icon: "link" },
  { value: "watch", label: "Watches", icon: "watch" },
  { value: "brooch", label: "Brooches", icon: "shutter_speed" },
  { value: "earring", label: "Earrings", icon: "ear" },
];

export default function AddProductForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photosRef = useRef<Photo[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState<JewelryType>("ring");
  const [barter, setBarter] = useState(false);
  const [privateViewing, setPrivateViewing] = useState(false);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT);
  const {
    data: sellerProductsData,
    loading: sellerProductsLoading,
    error: sellerProductsError,
    refetch: refetchSellerProducts,
  } = useQuery(GET_SELLER_PRODUCTS, {
    variables: {
      input: {
        page: 1,
        limit: 24,
        sort: "createdAt",
        direction: "DESC",
        search: {},
      },
    },
    skip: !authorized,
    fetchPolicy: "network-only",
  });
  const sellerProducts = sellerProductsData?.getSellerProducts?.list ?? [];

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("memberType");
    if (!token) {
      void router.replace("/sign-in?mode=signin&next=%2Fseller%2Fadd-product");
      return;
    }
    if (role !== "SELLER") {
      void router.replace("/my-page?message=seller-only");
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () =>
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview)),
    [],
  );

  const addFiles = (incoming: FileList | File[]) => {
    setFailure("");
    const selected = Array.from(incoming);
    const valid = selected.filter(
      (file) => file.type.startsWith("image/") && file.size <= 15 * 1024 * 1024,
    );
    if (valid.length !== selected.length)
      setFailure("Choose image files smaller than 15 MB each.");
    const available = 8 - photos.length;
    if (valid.length > available)
      setFailure("A product can have up to 8 photos.");
    setPhotos((current) => [
      ...current,
      ...valid
        .slice(0, available)
        .map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const onFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    const removed = photos[index];
    if (removed) URL.revokeObjectURL(removed.preview);
    setPhotos((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const clearForm = () => {
    if (!window.confirm("Clear all product details and selected photos?"))
      return;
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setBarter(false);
    setPrivateViewing(false);
    setCategory("ring");
    setFailure("");
    setNotice("");
    formRef.current?.reset();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure("");
    setNotice("");
    if (!photos.length) {
      setFailure("Add at least one clear product photo before publishing.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      void router.push("/sign-in?mode=signin&next=%2Fseller%2Fadd-product");
      return;
    }
    setUploading(true);
    try {
      setNotice("Uploading studio photos…");
      const imagePaths = await uploadProductImages(
        photos.map(({ file }) => file),
        token,
      );
      const details = [
        String(form.get("description") ?? "").trim(),
        "",
        "Jewelry details",
        `Gold purity: ${String(form.get("purity") ?? "")}`,
        `Metal weight: ${String(form.get("weight") ?? "")} g`,
        `Primary gemstone: ${String(form.get("gemstone") ?? "") || "Not specified"}`,
        `Gem weight and clarity: ${String(form.get("gemMetrics") ?? "") || "Not specified"}`,
        String(form.get("certificate") ?? "").trim()
          ? `Assay certificate: ${String(form.get("certificate")).trim()}`
          : "",
        privateViewing
          ? "Private atelier viewing is available by appointment."
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      const result = await createProduct({
        variables: {
          input: {
            productType: category,
            productTitle: String(form.get("title") ?? "").trim(),
            productPrice: Number(form.get("price")),
            productImages: imagePaths,
            productDesc: details,
            productBarter: barter,
          },
        },
      });
      const created = result.data?.createProduct;
      if (!created?._id)
        throw new Error("The product was not confirmed by the server.");
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
      setPhotos([]);
      setNotice(
        `“${created.productTitle}” is now published. Refreshing your seller inventory…`,
      );
      void refetchSellerProducts().catch((refreshError) => {
        setFailure(
          refreshError instanceof Error
            ? `Product was saved, but inventory could not refresh: ${refreshError.message}`
            : "Product was saved, but inventory could not refresh.",
        );
      });
      formRef.current?.reset();
      setBarter(false);
      setPrivateViewing(false);
    } catch (error) {
      setNotice("");
      setFailure(
        error instanceof Error
          ? error.message
          : "We could not publish this product. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!authorized) return null;

  return (
    <section className="seller-console">
      <aside className="seller-sidebar">
        <div className="seller-brand">
          <img src="/images/stitch/brand/diamond-mark.png" alt="" />
          <span>
            <b>HaDiJaM</b>
            <small>HAUTE JOAILLERIE</small>
          </span>
        </div>
        <div className="seller-vault-status">
          <i /> VAULT SECURED · NODE 01
        </div>
        <nav aria-label="Seller console">
          <Link href="/my-page">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="seller-nav-label">Dashboard</span>
          </Link>
          <Link href="/my-page">
            <span className="material-symbols-outlined">diamond</span>
            <span className="seller-nav-label">Products / Inventory</span>
          </Link>
          <Link
            className="active"
            href="/seller/add-product"
            aria-current="page"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="seller-nav-label">Add New Product</span>
          </Link>
          <button
            className="seller-nav-disabled"
            type="button"
            title="This seller console section is not available yet"
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="seller-nav-label">Orders &amp; Payments</span>
          </button>
          <button
            className="seller-nav-disabled"
            type="button"
            title="This seller console section is not available yet"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="seller-nav-label">Artisans / Members</span>
          </button>
          <button
            className="seller-nav-disabled"
            type="button"
            title="This seller console section is not available yet"
          >
            <span className="material-symbols-outlined">verified</span>
            <span className="seller-nav-label">Assay Certification</span>
          </button>
          <button
            className="seller-nav-disabled"
            type="button"
            title="This seller console section is not available yet"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="seller-nav-label">Settings</span>
          </button>
        </nav>
        <div className="seller-sidebar-member">
          <span className="material-symbols-outlined">workspace_premium</span>
          <div>
            <b>Master Jeweler</b>
            <small>Verified atelier account</small>
          </div>
        </div>
      </aside>

      <div className="seller-workspace">
        <header className="seller-topbar">
          <Link href="/my-page" className="seller-back">
            <ArrowBackRoundedIcon /> My Page
          </Link>
          <span>
            <i /> Verified Atelier Commerce
          </span>
          <Link href="/" className="seller-store-link">
            View marketplace ↗
          </Link>
        </header>
        <form ref={formRef} className="seller-product-form" onSubmit={submit}>
          <div className="seller-title-row">
            <div>
              <div className="seller-breadcrumb">
                SELLER CONSOLE <span>›</span> VAULT INVENTORY <span>›</span>{" "}
                <b>NEW MASTERPIECE</b>
              </div>
              <h1>
                Add <em>Masterpiece</em>
              </h1>
              <p>
                Introduce an exceptional handcrafted piece to the HaDiJaM salon.
              </p>
            </div>
            <button
              className="seller-draft-button"
              type="button"
              onClick={clearForm}
              disabled={loading || uploading}
            >
              Clear form
            </button>
          </div>
          <div className="seller-product-columns">
            <div className="seller-product-main">
              <section className="seller-panel">
                <div className="seller-panel-heading">
                  <span>01</span>
                  <div>
                    <h2>Basic Information</h2>
                    <p>Asosiy ma’lumotlar &amp; identifikatsiya</p>
                  </div>
                  <code>productTitle</code>
                </div>
                <label className="seller-field">
                  <span>
                    Masterpiece title <b>*</b>
                  </span>
                  <input
                    name="title"
                    required
                    minLength={3}
                    maxLength={100}
                    placeholder="e.g. Colombian Emerald & 18K Yellow Gold Ring"
                  />
                  <small>
                    The title appears on your listing and its product details.
                  </small>
                </label>
                <fieldset className="seller-category-field">
                  <legend>
                    Jewelry classification <b>*</b>
                    <small> GEMS &amp; METALLURGY TAXONOMY</small>
                  </legend>
                  <div className="seller-category-options">
                    {categories.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        className={category === item.value ? "selected" : ""}
                        onClick={() => setCategory(item.value)}
                      >
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                        <b>{item.label}</b>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="seller-field">
                  <span>
                    Provenance &amp; description{" "}
                    <small>Markdown supported</small>
                  </span>
                  <textarea
                    name="description"
                    rows={6}
                    maxLength={1500}
                    placeholder="Share the inspiration, craftsmanship, materials and provenance of this piece…"
                  />
                </label>
              </section>

              <section className="seller-panel">
                <div className="seller-panel-heading">
                  <span>02</span>
                  <div>
                    <h2>Gemological &amp; Precious Metal Specs</h2>
                    <p>Metrologiya, og‘irlik va asillik darajasi</p>
                  </div>
                  <code>Metallurgical Engine</code>
                </div>
                <div className="seller-form-grid">
                  <label className="seller-field">
                    <span>Gold purity / karat</span>
                    <select
                      name="purity"
                      defaultValue="18K Pure Gold (750 hallmark)"
                    >
                      <option>24K Investment Gold (999.9)</option>
                      <option>22K Gold (916)</option>
                      <option>18K Pure Gold (750 hallmark)</option>
                      <option>14K Gold (585)</option>
                      <option>Platinum (Pt 950)</option>
                      <option>Other / specify in description</option>
                    </select>
                    <small>Verified against state assay standards.</small>
                  </label>
                  <label className="seller-field">
                    <span>Metal weight</span>
                    <div className="seller-input-suffix">
                      <input
                        name="weight"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <span>GRAMS (g)</span>
                    </div>
                    <small>Enter the measured weight in grams.</small>
                  </label>
                  <label className="seller-field">
                    <span>Primary gemstone</span>
                    <select name="gemstone" defaultValue="">
                      <option value="">Select a gemstone</option>
                      <option>Colombian Emerald</option>
                      <option>Natural Diamond</option>
                      <option>Ceylon Sapphire</option>
                      <option>Burmese Ruby</option>
                      <option>Pearl</option>
                      <option>No gemstone / gold only</option>
                      <option>Other (describe below)</option>
                    </select>
                  </label>
                  <label className="seller-field">
                    <span>Gem weight &amp; clarity</span>
                    <input
                      name="gemMetrics"
                      placeholder="e.g. 2.45 ct · VVS1 · Color D"
                    />
                    <small>
                      Use your GIA / Gübelin grading where available.
                    </small>
                  </label>
                </div>
                <div className="seller-toggles">
                  <button
                    type="button"
                    className={barter ? "enabled" : ""}
                    onClick={() => setBarter(!barter)}
                  >
                    <span className="material-symbols-outlined">
                      currency_exchange
                    </span>
                    <span>
                      <b>Allow barter</b>
                      <small>Accept an equivalent precious-metal offer.</small>
                    </span>
                    <i />
                  </button>
                  <button
                    type="button"
                    className={privateViewing ? "enabled" : ""}
                    onClick={() => setPrivateViewing(!privateViewing)}
                  >
                    <span className="material-symbols-outlined">diamond</span>
                    <span>
                      <b>Private presentation</b>
                      <small>Offer a salon viewing by appointment.</small>
                    </span>
                    <i />
                  </button>
                </div>
              </section>

              <section className="seller-panel">
                <div className="seller-panel-heading">
                  <span>03</span>
                  <div>
                    <h2>High-Resolution Gallery</h2>
                    <p>Product images &amp; macro details</p>
                  </div>
                  <code>Up to 8 images · 15 MB each</code>
                </div>
                <div
                  className="seller-dropzone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    addFiles(event.dataTransfer.files);
                  }}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={onFilesSelected}
                  />
                  <span className="seller-upload-icon">
                    <CloudUploadOutlinedIcon />
                  </span>
                  <b>Drag &amp; drop studio photography</b>
                  <p>
                    Add detailed product photos in JPEG, PNG or WebP format.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                  >
                    <AddPhotoAlternateOutlinedIcon /> Browse local files
                  </button>
                  <small>
                    First photo becomes the cover · {photos.length} / 8 added
                  </small>
                </div>
                {photos.length > 0 && (
                  <div className="seller-photo-grid">
                    {photos.map((photo, index) => (
                      <div
                        className="seller-photo"
                        key={`${photo.file.name}-${index}`}
                      >
                        <img
                          src={photo.preview}
                          alt={`Product photo ${index + 1}`}
                        />
                        <span>
                          {index === 0 ? "MAIN COVER" : `PHOTO 0${index + 1}`}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove photo ${index + 1}`}
                          onClick={() => removePhoto(index)}
                        >
                          <DeleteOutlineRoundedIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="seller-product-aside">
              <section className="seller-panel seller-price-panel">
                <div className="seller-panel-heading seller-aside-heading">
                  <PaymentsOutlinedIcon />
                  <div>
                    <h2>Payment &amp; Valuation</h2>
                    <p>Product price in UZS</p>
                  </div>
                </div>
                <label className="seller-field">
                  <span>
                    Boutique listing price <b>*</b>
                  </span>
                  <div className="seller-price-input">
                    <span>UZS</span>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="0"
                    />
                  </div>
                  <small>The listed amount is saved in Uzbek so‘m.</small>
                </label>
                <div className="seller-payment-note">
                  <VerifiedOutlinedIcon />
                  <p>
                    <b>Secure checkout</b>
                    <span>
                      Payment terms are confirmed with the buyer after an order.
                    </span>
                  </p>
                </div>
              </section>
              <section className="seller-panel">
                <div className="seller-panel-heading seller-aside-heading">
                  <VerifiedOutlinedIcon />
                  <div>
                    <h2>Assay &amp; hallmark</h2>
                    <p>State inspection details</p>
                  </div>
                </div>
                <label className="seller-field">
                  <span>Assay certificate reference</span>
                  <input
                    name="certificate"
                    placeholder="e.g. UZ-GIA-2026-12345"
                  />
                  <small>
                    Add a reference to your certification in the product
                    details.
                  </small>
                </label>
                <div className="seller-assay-note">
                  <CheckCircleOutlineRoundedIcon />
                  <span>
                    Accurate material details help collectors purchase with
                    confidence.
                  </span>
                </div>
              </section>
              <section className="seller-panel seller-publish-panel">
                <div className="seller-panel-heading seller-aside-heading">
                  <DiamondOutlinedIcon />
                  <div>
                    <h2>Publishing status</h2>
                    <p>Marketplace visibility</p>
                  </div>
                </div>
                <div className="seller-active-status">
                  <i /> ACTIVE LISTING
                </div>
                <p>
                  After publishing, your product will appear in the public
                  marketplace catalog.
                </p>
                <div className="seller-security-line">
                  <VerifiedOutlinedIcon /> Member-verified seller account
                </div>
              </section>
            </aside>
          </div>

          <div className="seller-submit-bar">
            <div>
              <i />
              <b>
                {loading || uploading
                  ? "Uploading & registering your product…"
                  : "Ready to publish"}
              </b>
              <small>
                Product photos and details will be saved to your seller account.
              </small>
            </div>
            <div className="seller-submit-actions">
              <Link href="/my-page">Cancel</Link>
              <button
                type="submit"
                className="button button-gold"
                disabled={loading || uploading}
              >
                {loading || uploading ? "Publishing…" : "Publish product"}{" "}
                <span>↗</span>
              </button>
            </div>
          </div>
          {failure && (
            <p className="seller-feedback error" role="alert">
              {failure}
            </p>
          )}
          {notice && (
            <p className="seller-feedback success" role="status">
              {notice}
            </p>
          )}
          <section
            className="seller-panel seller-inventory-panel"
            aria-labelledby="seller-inventory-title"
          >
            <div className="seller-panel-heading">
              <span>04</span>
              <div>
                <h2 id="seller-inventory-title">Your live inventory</h2>
                <p>Products loaded directly from your seller account.</p>
              </div>
              <code>{sellerProducts.length} products</code>
            </div>
            {sellerProductsLoading ? (
              <p role="status">Loading your products…</p>
            ) : sellerProductsError ? (
              <p className="seller-feedback error" role="alert">
                {sellerProductsError.message}
              </p>
            ) : sellerProducts.length ? (
              <div className="seller-inventory-grid">
                {sellerProducts.map((product: any) => (
                  <article className="seller-inventory-card" key={product._id}>
                    {product.productImages?.[0] ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702"}/${product.productImages[0]}`}
                        alt={product.productTitle}
                      />
                    ) : (
                      <span className="material-symbols-outlined">diamond</span>
                    )}
                    <div>
                      <b>{product.productTitle}</b>
                      <span>
                        {product.productType} · {product.productStatus}
                      </span>
                      <strong>
                        {Number(product.productPrice).toLocaleString()} UZS
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>
                Your backend inventory is empty. Publish a product above to see
                it here.
              </p>
            )}
          </section>
        </form>
      </div>
    </section>
  );
}
