import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
      list {
        _id
        productType
        productStatus
        productTitle
        productPrice
        productViews
        productLikes
        productComments
        productImages
        productDesc
        memberId
        createdAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($productId: String!) {
    getProduct(productId: $productId) {
      _id
      productType
      productStatus
      productTitle
      productPrice
      productViews
      productLikes
      productComments
      productImages
      productDesc
      productBarter
      memberId
      createdAt
    }
  }
`;

export const LIKE_PRODUCT = gql`
  mutation LikeProduct($productId: String!) {
    likeTargetProduct(productId: $productId) {
      _id
      productLikes
    }
  }
`;
