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
        meLiked {
          myFavorite
        }
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
      bookingReference
      bookingPrice
      paymentStatus
    }
  }
`;

export const GET_UNAVAILABLE_SERVICE_BOOKING_SLOTS = gql`
  query GetUnavailableServiceBookingSlots($input: ServiceBookingAvailabilityInput!) {
    getUnavailableServiceBookingSlots(input: $input)
  }
`;

export const CREATE_SALON_RESERVATION = gql`
  mutation CreateSalonReservation($input: SalonReservationInput!) {
    createSalonReservation(input: $input) {
      _id
      reservationStatus
      reservationReference
    }
  }
`;

export const GET_BOOKED_SALON_TIMES = gql`
  query GetBookedSalonTimes($suiteId: String!, $from: DateTime!, $to: DateTime!) {
    getBookedSalonTimes(suiteId: $suiteId, from: $from, to: $to)
  }
`;

export const LIKE_SERVICE = gql`
  mutation LikeService($serviceId: String!) {
    likeTargetService(serviceId: $serviceId) {
      _id
      serviceLikes
      meLiked {
        myFavorite
      }
    }
  }
`;
