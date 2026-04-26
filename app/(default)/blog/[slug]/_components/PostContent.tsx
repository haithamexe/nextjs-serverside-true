import Link from "next/link";
import { notFound } from "next/navigation";

import { getBlogPostFromApi } from "../../../_lib/blog/server-api";

export default async function PostContent({ slug }: { slug: string }) {
  const id = Number(slug);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  let post;
  try {
    post = await getBlogPostFromApi(id);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/blog"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        &larr; Back to Blog
      </Link>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Post #{post.id} &middot; User {post.userId}
      </p>
      <h1 className="mb-4 text-3xl font-bold capitalize leading-tight">
        {post.title}
      </h1>
      <p className="text-base leading-relaxed text-gray-700">{post.body}</p>
    </article>
  );
}
