import { deleteHomePost } from "../api-layer";

export function useHomeDelete(): {
  deletePost: (countryCode: string) => Promise<void>;
} {
  async function deletePost(countryCode: string) {
    await deleteHomePost(countryCode);
  }

  return { deletePost };
}
