import { create } from "zustand";

// Define the types for our questions and responses
export type AgentQuestionType =
  | "text"
  | "paragraph"
  | "multipleChoice"
  | "keyboardMultipleChoice"
  | "colorSelection"
  | "fileUpload"
  | "static"
  | "loading";

export interface AgentQuestion {
  id: string;
  text: string;
  type: AgentQuestionType;
  required?: boolean;
  options?: string[]; // For multiple choice questions
  descriptions?: string[]; // For descriptions of options
  placeholder?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  conditionalNext?: {
    // If the answer matches a key, go to the specified question ID
    [key: string]: string;
  };
}

export interface keyboardMultipleChoice {
  id: string;
  text: string;
  type: keyboardMultipleChoice;
  required?: boolean;
  options?: string[]; // For multiple choice questions
  placeholder?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  conditionalNext?: {
    // If the answer matches a key, go to the specified question ID
    [key: string]: string;
  };
}

export interface AgentFormResponse {
  questionId: string;
  answer: string | string[] | null;
}

export interface AgentFormState {
  questions: AgentQuestion[];
  currentQuestionIndex: number;
  responses: AgentFormResponse[];
  agentName: string;

  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setResponse: (questionId: string, answer: string | string[] | null) => void;
  getCurrentResponse: () => AgentFormResponse | undefined;
  getAllResponses: () => AgentFormResponse[];
  setAgentName: (name: string) => void;
  getAgentName: () => string;
  resetStore: () => void; // New function to reset the store
}

// Create the store
export const useAgentFormStore = create<AgentFormState>((set, get) => ({
  // Initial state with all questions for the AI agent creation flow
  questions: [
    // Section 1: Welcome
    {
      id: "welcome",
      text: "",
      type: "static",
      required: false,
    },
    // Section 2: Agent Name
    {
      id: "agentName",
      text: "What's the name of your AI agent?",
      type: "text",
      required: true,
      placeholder: "E.g., AssistBot, MarketingGPT, CodeHelper...",
      validation: {
        required: true,
        maxLength: 30,
      },
    },
    // Section 3: Agent Purpose
    {
      id: "agentPurpose",
      text: "Great! What would you like [agentName] to specifically do?",
      type: "paragraph",
      required: true,
      placeholder:
        "E.g., Help me analyze marketing data, assist with coding problems, generate creative content...",
      validation: {
        required: true,
        minLength: 10,
      },
    },
    // Section 4: Target Users
    {
      id: "targetUsers",
      text: "Who will be using [agentName]?",
      type: "paragraph",
      required: true,
      placeholder:
        "E.g., Self, Marketing professionals, software developers, content writers, students...",
      validation: {
        required: true,
      },
    },
    // Section 5: System Prompt Style
    {
      id: "promptStyle",
      text: "Select a conversational style for [agentName]:",
      type: "keyboardMultipleChoice",
      required: true,
      options: [
        "Professional & Formal",
        "Friendly & Casual",
        "Technical & Precise",
        "Creative & Inspiring",
        "Concise & Direct",
      ],
      options_descriptions: [
        "Maintains a business-like tone with proper language and formality",
        "Conversational and approachable, using casual language and friendly expressions",
        "Focuses on accuracy and detail with domain-specific terminology",
        "Uses expressive language with metaphors and imaginative descriptions",
        "Provides straightforward answers without unnecessary elaboration",
      ],
    },
    // Section 6: Agent Customization - User Message Color
    {
      id: "userMessageColor",
      text: "Customize the appearance of your conversation with [agentName]:",
      type: "colorSelection",
      required: true,
      options: [
        "#1a1a1a", // Dark black
        "#333333", // Medium black
        "#4d4d4d", // Light black
        "#666666", // Dark gray
        "#808080", // Medium gray
        "#999999", // Light gray
      ],
    },
    // Section 7: Agent Customization - AI Message Color
    {
      id: "aiMessageColor",
      text: "Now select the color for [agentName]'s messages:",
      type: "colorSelection",
      required: true,
      options: [
        "#1a1a1a", // Dark black
        "#333333", // Medium black
        "#4d4d4d", // Light black
        "#666666", // Dark gray
        "#808080", // Medium gray
        "#999999", // Light gray
      ],
    },
    // Section 8: Pricing Plan
    {
      id: "pricingPlan",
      text: "Select a pricing plan for [agentName]:",
      type: "multipleChoice",
      required: true,
      options: ["Free Tier", "Standard", "Professional", "Enterprise"],
      descriptions: [
        "Basic capabilities, 100 messages/month",
        "$9.99/month, Enhanced capabilities, 1,000 messages/month",
        "$19.99/month, Advanced capabilities, unlimited messages",
        "Custom pricing, Full capabilities, dedicated support",
      ],
    },
    // Section 9: Knowledge Base
    {
      id: "knowledgeBase",
      text: "Would you like to enhance [agentName] with custom knowledge?",
      type: "multipleChoice",
      required: true,
      options: [
        "No, use standard knowledge only",
        "Yes, upload documents for specialized knowledge",
      ],
      conditionalNext: {
        "No, use standard knowledge only": "creationProcess",
        "Yes, upload documents for specialized knowledge": "fileUpload",
      },
    },
    // Section 9b: File Upload (conditional)
    {
      id: "fileUpload",
      text: "Upload documents to enhance [agentName]'s knowledge base:",
      type: "fileUpload",
      required: false,
      placeholder: "Upload PDF, DOCX, or TXT files",
    },
    // Section 10: Creation Process
    {
      id: "creationProcess",
      text: "Creating your AI agent...",
      type: "loading",
      required: false,
    },
    // Section 11: Completion
    {
      id: "completion",
      text: "[agentName] is ready!",
      type: "static",
      required: false,
    },
  ],
  currentQuestionIndex: 0,
  responses: [],
  agentName: "",

  // Actions
  setCurrentQuestionIndex: (index) =>
    set((state) => ({
      currentQuestionIndex: Math.max(
        0,
        Math.min(index, state.questions.length - 1)
      ),
    })),

  goToNextQuestion: () =>
    set((state) => {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const currentResponse = state.responses.find(
        (response) => response.questionId === currentQuestion.id
      );

      // Check for conditional navigation
      if (currentQuestion.conditionalNext && currentResponse) {
        const answer = currentResponse.answer as string;
        const nextQuestionId = currentQuestion.conditionalNext[answer];

        if (nextQuestionId) {
          const nextIndex = state.questions.findIndex(
            (q) => q.id === nextQuestionId
          );
          if (nextIndex !== -1) {
            return { currentQuestionIndex: nextIndex };
          }
        }
      }

      // Default to next question
      return {
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.questions.length - 1
        ),
      };
    }),

  goToPreviousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
    })),

  setResponse: (questionId, answer) =>
    set((state) => {
      const existingResponseIndex = state.responses.findIndex(
        (response) => response.questionId === questionId
      );

      // If this is the agent name question, update the agent name
      if (questionId === "agentName" && typeof answer === "string") {
        state.agentName = answer;
      }

      if (existingResponseIndex !== -1) {
        // Update existing response
        const updatedResponses = [...state.responses];
        updatedResponses[existingResponseIndex] = { questionId, answer };
        return { responses: updatedResponses };
      } else {
        // Add new response
        return { responses: [...state.responses, { questionId, answer }] };
      }
    }),

  getCurrentResponse: () => {
    const { questions, currentQuestionIndex, responses } = get();
    const currentQuestion = questions[currentQuestionIndex];
    return responses.find(
      (response) => response.questionId === currentQuestion.id
    );
  },

  getAllResponses: () => get().responses,

  setAgentName: (name) => set({ agentName: name }),

  getAgentName: () => get().agentName,

  // Reset the store to its initial state
  resetStore: () =>
    set({
      currentQuestionIndex: 0,
      responses: [],
      agentName: "",
    }),
}));
