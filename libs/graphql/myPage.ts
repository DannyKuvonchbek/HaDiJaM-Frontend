import { gql } from "@apollo/client";

export const GET_MEMBER_PROFILE = gql`
  query GetMemberProfile($memberId: String!) {
    getMember(memberId: $memberId) {
      _id
      memberType
      memberStatus
      memberPhone
      memberNick
      memberFullName
      memberImage
      memberAddress
      memberDesc
      memberProducts
      memberFollowers
      memberFollowings
      memberPoints
      memberRank
      createdAt
    }
  }
`;

export const UPDATE_MEMBER_PROFILE = gql`
  mutation UpdateMemberProfile($input: MemberUpdate!) {
    updateMember(input: $input) {
      _id
      memberType
      memberPhone
      memberNick
      memberFullName
      memberImage
      memberAddress
      memberDesc
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($input: OrdersInquiry!) {
    getMyOrders(input: $input) {
      list {
        _id
        orderStatus
        orderPrice
        deliveryAddress
        deliveryPhone
        paymentMethod
        paymentStatus
        createdAt
        items {
          _id
          productId
          productTitle
          productType
          productImages
          unitPrice
          quantity
          itemPrice
          itemStatus
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_MY_FAVORITES = gql`
  query GetMyFavorites($input: OrdinaryInquiry!) {
    getFavorites(input: $input) {
      list {
        _id
        productType
        productStatus
        productTitle
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
