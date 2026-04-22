import { NextRequest, NextResponse } from "next/server";
import { testValue } from "../../lib/environments";
import {
  createHomePost,
  deleteHomePost,
  getHomeTodos,
  updateHomePost,
} from "../../lib/home/service";
import {
  homeDeletePayloadSchema,
  homeMutationPayloadSchema,
  proxyGuardHeadersSchema,
} from "../../lib/home/schemas";

interface ErrorWithMessage {
  message: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ErrorWithMessage).message === "string"
  ) {
    return (error as ErrorWithMessage).message;
  }

  return "Internal Server Error";
}

function assertProxyGuard(request: NextRequest) {
  const parsedHeaders = proxyGuardHeadersSchema.safeParse({
    "x-home-authenticated": request.headers.get("x-home-authenticated"),
    "x-home-session-id": request.headers.get("x-home-session-id"),
    "x-home-request-id": request.headers.get("x-home-request-id"),
  });

  if (!parsedHeaders.success) {
    throw new Error("Missing or invalid proxy guard headers");
  }

  return parsedHeaders.data;
}

export async function GET(request: NextRequest) {
  try {
    const requestContext = assertProxyGuard(request);

    console.log(
      "Test Value from environment variables in GET /api/home:",
      testValue,
    );
    console.log("Home proxy request id:", requestContext["x-home-request-id"]);

    const data = await getHomeTodos();

    return NextResponse.json(
      { message: "GET request successful", data },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error handling GET request on /api/home:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    assertProxyGuard(request);

    const payload = await request.json();
    const data = homeMutationPayloadSchema.parse(payload);

    const createdPost = await createHomePost(data);

    console.log("POST response:", createdPost);

    return NextResponse.json(
      { message: "POST request successful", data: createdPost },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error handling POST request on /api/home:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    assertProxyGuard(request);

    const payload = await request.json();
    const postData = homeMutationPayloadSchema.parse(payload);

    const updatedPost = await updateHomePost(postData);

    return NextResponse.json(
      { message: "PUT request successful", data: updatedPost },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertProxyGuard(request);

    const payload = await request.json();
    const data = homeDeletePayloadSchema.parse(payload);

    await deleteHomePost(data.countryCode);

    return NextResponse.json(
      { message: "DELETE request successful", data },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
