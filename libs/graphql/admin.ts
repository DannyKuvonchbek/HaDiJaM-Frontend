import { gql } from "@apollo/client";

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
  query GetAllProductsByAdmin($input: ProductsInquiry!) {
    getAllProductsByAdmin(input: $input) {
      list { _id productType productStatus productTitle productPrice productImages productDesc memberId createdAt memberData { _id memberNick memberPhone memberType memberStatus } }
      metaCounter { total }
    }
  }
`;

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
  query GetAllMembersByAdmin($input: MembersInquiry!) {
    getAllMembersByAdmin(input: $input) {
      list { _id memberType memberStatus memberPhone memberNick memberFullName memberImage memberProducts createdAt }
      metaCounter { total }
    }
  }
`;

export const UPDATE_PRODUCT_BY_ADMIN = gql`
  mutation UpdateProductByAdmin($input: ProductUpdate!) {
    updateProductByAdmin(input: $input) { _id productStatus productTitle }
  }
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
  mutation RemoveProductByAdmin($productId: String!) {
    removeProductByAdmin(productId: $productId) { _id }
  }
`;

export const UPDATE_MEMBER_BY_ADMIN = gql`
  mutation UpdateMembersByAdmin($input: MemberUpdate!) {
    updateMembersByAdmin(input: $input) { _id memberStatus memberType }
  }
`;

export const SEND_PRODUCT_REVIEW_MESSAGE = gql`
  mutation SendProductReviewMessage($input: AdminProductReviewMessageInput!) {
    sendProductReviewMessage(input: $input) { _id notificationTitle notificationDesc createdAt }
  }
`;
