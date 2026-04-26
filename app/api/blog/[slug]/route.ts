import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { blogMutationPayloadSchema } from "../../../_lib/blog/schemas";
import {
  deleteBlogPost,
  getBlogPost,
  updateBlogPost,
} from "../../../_lib/blog/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const id = Number(slug);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const data = await getBlogPost(id);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message.toLowerCase().includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const id = Number(slug);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const body: unknown = await request.json();
    const parsed = blogMutationPayloadSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid request body" },
        { status: 422 },
      );
    }

    const data = await updateBlogPost(parsed.data);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const id = Number(slug);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    await deleteBlogPost(id);
    return NextResponse.json(
      { message: `Deleted post ${slug}` },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
