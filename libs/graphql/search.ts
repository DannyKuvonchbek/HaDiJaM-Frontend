import { gql } from "@apollo/client";

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
      list {
        _id productType productTitle productPrice productImages productDesc
      }
      metaCounter { total }
    }
  }
`;

export const SEARCH_SERVICES = gql`
  query SearchServices($input: ServicesInquiry!) {
    getServices(input: $input) {
      list { _id serviceTitle serviceCategory servicePrice serviceImages serviceDesc memberId }
      metaCounter { total }
    }
  }
`;

export const SEARCH_ATELIERS = gql`
  query SearchAteliers($input: SellersInquiry!) {
    getSellers(input: $input) {
      list { _id memberNick memberFullName memberImage memberProducts memberDesc }
      metaCounter { total }
    }
  }
`;
