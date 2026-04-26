import Link from "next/link";

import { getBlogPostsFromApi } from "../../../_lib/blog/server-api";

export default async function BlogContent() {
  const posts = await getBlogPostsFromApi();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <Link
              href={`/blog/${post.id}`}
              className="text-lg font-semibold capitalize text-blue-600 hover:underline"
            >
              {post.title}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {post.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
