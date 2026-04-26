export interface BlogPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface BlogMutationPayload {
  id?: number;
  title: string;
  body: string;
  userId?: number;
}

export interface BlogApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
