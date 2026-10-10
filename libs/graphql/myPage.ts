import { gql } from "@apollo/client";

export const GET_MEMBER_PROFILE = gql`
  query GetMemberProfile($memberId: String!) {
    getMember(memberId: $memberId) {
      _id
      memberType
      sellerIntent
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
        memberData { memberFullName memberNick }
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

export const GET_MY_SALON_RESERVATIONS = gql`
  query GetMySalonReservations {
    getMySalonReservations {
      _id
      reservationReference
      reservationStatus
      suiteName
      bookingDate
      bookingTime
      guestName
      guestContact
      itemManifest
      selectedAmenities
      valetRequested
    }
  }
`;

export const GET_MY_SERVICE_BOOKINGS = gql`
  query GetMyServiceBookings($input: ServiceBookingsInquiry!) {
    getMyServiceBookings(input: $input) {
      list {
        _id
        serviceId
        serviceTitle
        bookingReference
        bookingDate
        bookingTime
        bookingStatus
        bookingPrice
        paymentStatus
        selectedTechnician
        selectedItems
        itemDescription
        itemPhoto
        customerName
        customerNote
      }
      metaCounter { total }
    }
  }
`;

export const DELETE_PAST_SALON_RESERVATION = gql`
  mutation DeletePastSalonReservation($reservationId: String!) {
    deletePastSalonReservation(reservationId: $reservationId)
  }
`;

export const RESCHEDULE_MY_SALON_RESERVATION = gql`
  mutation RescheduleMySalonReservation($input: SalonReservationRescheduleInput!) {
    rescheduleMySalonReservation(input: $input) {
      _id
      bookingDate
      bookingTime
      reservationStatus
    }
  }
`;

export const CANCEL_MY_SALON_RESERVATION = gql`
  mutation CancelMySalonReservation($reservationId: String!) {
    cancelMySalonReservation(reservationId: $reservationId) {
      _id
      reservationStatus
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

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($input: OrdinaryInquiry!) {
    getMyNotifications(input: $input) {
      list { _id notificationType notificationStatus notificationGroup notificationTitle notificationDesc productId createdAt }
      metaCounter { total }
      unreadCount
    }
  }
`;

export const MARK_MY_NOTIFICATION_READ = gql`
  mutation MarkMyNotificationRead($notificationId: String!) {
    markMyNotificationRead(notificationId: $notificationId) { _id notificationStatus }
  }
`;
