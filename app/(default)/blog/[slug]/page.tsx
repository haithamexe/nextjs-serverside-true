import PostContent from "./_components/PostContent";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PostContent slug={slug} />;
}
