import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      _id
      memberNick
      memberType
      accessToken
    }
  }
`;

export const SIGNUP = gql`
  mutation Signup($input: MemberInput!) {
    signup(input: $input) {
      _id
      memberNick
      memberType
      accessToken
    }
  }
`;
