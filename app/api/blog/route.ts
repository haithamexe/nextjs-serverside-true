import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { blogMutationPayloadSchema } from "../../_lib/blog/schemas";
import { createBlogPost, getBlogPosts } from "../../_lib/blog/service";

export async function GET() {
  try {
    const data = await getBlogPosts();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = blogMutationPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid request body" },
        { status: 422 },
      );
    }

    const data = await createBlogPost(parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
