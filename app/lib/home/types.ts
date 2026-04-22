export interface HomeTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface HomeMutationPayload {
  id?: number;
  title: string;
  completed?: boolean;
  userId?: number;
}

export interface HomeApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}
