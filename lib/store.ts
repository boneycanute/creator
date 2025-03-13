import { create } from 'zustand';

// Define the types for our questions and responses
export type QuestionType = 'text' | 'multipleChoice' | 'email' | 'number' | 'date';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  options?: string[]; // For multiple choice questions
  placeholder?: string;
}

export interface FormResponse {
  questionId: string;
  answer: string | string[] | null;
}

// Define the store state
interface FormState {
  questions: Question[];
  currentQuestionIndex: number;
  responses: FormResponse[];
  
  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setResponse: (questionId: string, answer: string | string[] | null) => void;
  getCurrentResponse: () => FormResponse | undefined;
  getAllResponses: () => FormResponse[];
}

// Create the store
export const useFormStore = create<FormState>((set, get) => ({
  // Initial state
  questions: [
    {
      id: 'q1',
      text: 'What is your name?',
      type: 'text',
      required: true,
      placeholder: 'Type your full name',
    },
    {
      id: 'q2',
      text: 'How would you rate your experience with us?',
      type: 'multipleChoice',
      required: true,
      options: ['Excellent', 'Good', 'Average', 'Poor'],
    },
    {
      id: 'q3',
      text: 'What is your email address?',
      type: 'email',
      required: true,
      placeholder: 'your@email.com',
    },
    {
      id: 'q4',
      text: 'How many years of experience do you have?',
      type: 'number',
      required: false,
      placeholder: 'Enter a number',
    },
    {
      id: 'q5',
      text: 'Any additional comments or feedback?',
      type: 'text',
      required: false,
      placeholder: 'Share your thoughts...',
    },
  ],
  currentQuestionIndex: 0,
  responses: [],

  // Actions
  setCurrentQuestionIndex: (index) => 
    set((state) => ({ 
      currentQuestionIndex: Math.max(0, Math.min(index, state.questions.length - 1)) 
    })),
    
  goToNextQuestion: () => 
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
    })),
    
  goToPreviousQuestion: () => 
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
    })),
    
  setResponse: (questionId, answer) => 
    set((state) => {
      const existingResponseIndex = state.responses.findIndex(
        (response) => response.questionId === questionId
      );
      
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
    return responses.find((response) => response.questionId === currentQuestion.id);
  },
  
  getAllResponses: () => get().responses,
}));
