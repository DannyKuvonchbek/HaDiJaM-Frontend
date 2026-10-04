import { gql } from "@apollo/client";

export const GET_SERVICES = gql`
  query GetServices($input: ServicesInquiry!) {
    getServices(input: $input) {
      list {
        _id
        serviceType
        serviceStatus
        serviceTitle
        serviceCategory
        servicePrice
        serviceDuration
        serviceImages
        serviceDesc
        serviceLikes
      }
      metaCounter {
        total
      }
    }
  }
`;

export const CREATE_SERVICE_BOOKING = gql`
  mutation CreateServiceBooking($input: ServiceBookingInput!) {
    createServiceBooking(input: $input) {
      _id
      bookingStatus
    }
  }
`;
