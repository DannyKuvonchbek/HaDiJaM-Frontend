import { gql } from "@apollo/client";

export const GET_ATELIER_OWNER = gql`
  query GetAtelierOwner($input: SellersInquiry!) {
    getSellers(input: $input) {
      list {
        _id memberType memberStatus memberNick memberFullName memberImage
        memberPhone memberAddress memberDesc memberProducts memberFollowers memberLikes
        meLiked { myFavorite }
        meFollowed { myFollowing }
      }
    }
  }
`;

export const GET_ATELIER_PRODUCTS = gql`
  query GetAtelierProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
      list { _id productType productStatus productTitle productPrice productImages productDesc memberId }
      metaCounter { total }
    }
  }
`;

export const GET_ATELIER_SERVICES = gql`
  query GetAtelierServices($input: ServicesInquiry!) {
    getServices(input: $input) {
      list { _id serviceType serviceStatus serviceTitle serviceCategory servicePrice serviceDuration serviceImages serviceDesc serviceLikes meLiked { myFavorite } }
      metaCounter { total }
    }
  }
`;

export const LIKE_ATELIER_OWNER = gql`
  mutation LikeAtelierOwner($memberId: String!) {
    likeTargetMember(memberId: $memberId) { _id memberLikes meLiked { myFavorite } }
  }
`;

export const FOLLOW_ATELIER_OWNER = gql`
  mutation FollowAtelierOwner($followingId: String!) {
    subscribe(input: $followingId) { _id followingId followerId }
  }
`;

export const UNFOLLOW_ATELIER_OWNER = gql`
  mutation UnfollowAtelierOwner($followingId: String!) {
    unsubscribe(input: $followingId) { _id followingId followerId }
  }
`;

export const GET_ATELIER_SCHEDULES = gql`
  query GetAtelierSchedules($serviceId: String!) {
    getServiceSchedules(serviceId: $serviceId) { list { dayOfWeek isWorking startTime endTime breakStartTime breakEndTime } }
  }
`;

export const GET_ATELIER_REVIEWS = gql`
  query GetAtelierReviews($serviceId: String!, $input: ServiceReviewsInquiry!) {
    getServiceReviews(serviceId: $serviceId, input: $input) {
      list { _id serviceId bookingId memberId rating reviewContent reviewImages createdAt memberData { _id memberNick memberImage } }
      metaCounter { total }
    }
  }
`;

export const CREATE_ATELIER_REVIEW = gql`
  mutation CreateAtelierReview($input: ServiceReviewInput!) {
    createServiceReview(input: $input) { _id serviceId bookingId rating reviewContent reviewImages createdAt }
  }
`;

export const GET_ATELIER_CONVERSATIONS = gql`
  query GetAtelierConversations($atelier: String!) {
    getAtelierConversations(atelier: $atelier) {
      customerId customerNick customerImage lastMessage lastMessageAt unreadCount
    }
  }
`;

export const GET_ATELIER_CHAT_HISTORY = gql`
  query GetAtelierChatHistory($atelier: String!, $customerId: String!, $input: AtelierChatInquiry!) {
    getAtelierChatMessages(atelier: $atelier, customerId: $customerId, input: $input) {
      list { _id atelier senderId senderNick senderImage recipientId messageContent createdAt }
      metaCounter { total }
    }
  }
`;

export const GET_ATELIER_SOCIAL = gql`
  query GetAtelierSocial($atelier: String!) {
    getAtelierSocial(atelier: $atelier) { atelier likes followers liked followed }
  }
`;
export const SET_ATELIER_LIKE = gql`
  mutation SetAtelierLike($atelier: String!, $liked: Boolean!) {
    setAtelierLike(atelier: $atelier, liked: $liked) { atelier likes followers liked followed }
  }
`;
export const SET_ATELIER_FOLLOW = gql`
  mutation SetAtelierFollow($atelier: String!, $followed: Boolean!) {
    setAtelierFollow(atelier: $atelier, followed: $followed) { atelier likes followers liked followed }
  }
`;

export const GET_ATELIER_BUSINESS_HOURS = gql`
  query GetAtelierBusinessHours {
    getAtelierBusinessHours { timeZone daysOfWeek opensAt closesAt }
  }
`;
