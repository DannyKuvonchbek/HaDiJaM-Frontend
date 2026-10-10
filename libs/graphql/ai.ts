import { gql } from '@apollo/client';

export const SEND_AI_CONCIERGE_MESSAGE = gql`
  mutation SendAIConciergeMessage($input: AIConciergeMessageInput!) {
    sendAIConciergeMessage(input: $input) {
      answer conversationId
      recommendedProducts { _id productTitle productType productPrice productImages }
      action { label href }
    }
  }
`;

export const GET_MY_AI_CONVERSATIONS = gql`
  query GetMyAIConversations {
    getMyAIConversations { _id conversationTitle lastMessageAt }
  }
`;

export const GET_MY_AI_CONVERSATION_MESSAGES = gql`
  query GetMyAIConversationMessages($conversationId: String!) {
    getMyAIConversationMessages(conversationId: $conversationId) { _id role content locale createdAt action { label href } }
  }
`;

export const GET_AI_PRODUCT_REVIEW = gql`
  query GetAIProductReview($productId: String!) {
    getAIProductReview(productId: $productId) {
      _id productId riskLevel findings analysisSummary sellerMessageDraft provider model updatedAt
    }
  }
`;

export const ANALYZE_PRODUCT_WITH_AI = gql`
  mutation AnalyzeProductWithAI($input: AIProductReviewInput!) {
    analyzeProductWithAI(input: $input) {
      _id productId riskLevel findings analysisSummary sellerMessageDraft provider model updatedAt
    }
  }
`;
