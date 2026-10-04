import Head from "next/head";
import AddProductForm from "@/libs/components/seller/AddProductForm";

export default function AddSellerProductPage() {
  return (
    <>
      <Head>
        <title>Add a masterpiece | HaDiJaM Seller Vault</title>
        <meta
          name="description"
          content="List a certified jewelry piece in the HaDiJaM marketplace."
        />
      </Head>
      <AddProductForm />
    </>
  );
}
