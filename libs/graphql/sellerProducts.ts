import { authorizedFetch } from "@/libs/auth";
import { gql } from "@apollo/client";

export const GET_SELLER_PRODUCTS = gql`
  query GetSellerProducts($input: SellerProductsInquiry!) {
    getSellerProducts(input: $input) {
      list {
        _id
        productTitle
        productType
        productStatus
        productPrice
        productImages
        productDesc
        productBarter
        createdAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      _id
      productTitle
      productType
      productStatus
    }
  }
`;

/** Sends GraphQL multipart requests using the multipart request spec used by graphql-upload. */
export async function uploadProductImages(
  files: File[],
  accessToken: string,
): Promise<string[]> {
  const operations = {
    query:
      "mutation UploadProductImages($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }",
    operationName: "UploadProductImages",
    variables: { files: files.map(() => null), target: "products" },
  };
  const map = Object.fromEntries(
    files.map((_, index) => [String(index), [`variables.files.${index}`]]),
  );
  const body = new FormData();
  body.append("operations", JSON.stringify(operations));
  body.append("map", JSON.stringify(map));
  files.forEach((file, index) => body.append(String(index), file, file.name));

  const response = await authorizedFetch(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9702/graphql",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "apollo-require-preflight": "true",
      },
      body,
    },
  );
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(
      payload.errors?.[0]?.message ?? "Photo upload failed. Please try again.",
    );
  }
  const paths = payload.data?.imagesUploader;
  if (!Array.isArray(paths) || paths.length !== files.length)
    throw new Error("The server did not return all uploaded photos.");
  return paths as string[];
}
