import { deleteHomePost } from "../client-api";

export function useHomeDelete(): {
  deletePost: (countryCode: string) => Promise<void>;
} {
  async function deletePost(countryCode: string) {
    await deleteHomePost(countryCode);
  }

  return { deletePost };
}
