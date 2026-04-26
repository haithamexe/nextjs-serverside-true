import BlogContent from "./_components/BlogContent";

export default async function BlogPage() {
  return (
    <div className="p-5">
      <h1 className="mb-4 text-2xl font-bold">Blog</h1>
      <BlogContent />
    </div>
  );
}
