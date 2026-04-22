import { NextRequest, NextResponse } from "next/server";
import { testValue } from "../../lib/environments";
import {
  createHomePost,
  deleteHomePost,
  getHomeTodos,
  updateHomePost,
} from "../../lib/home/service";
import type { HomeMutationPayload } from "../../lib/home/types";

interface ErrorWithMessage {
  message: string;
}

function getErrorMessage(error: unknown): string {
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

export async function GET() {
  try {
    console.log(
      "Test Value from environment variables in GET /api/home:",
      testValue,
    );

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
    const data = (await request.json()) as HomeMutationPayload;

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
    const postData = (await request.json()) as HomeMutationPayload;

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
    const data = (await request.json()) as Pick<HomeMutationPayload, "id">;

    await deleteHomePost(data.id);

    return NextResponse.json(
      { message: "DELETE request successful" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
