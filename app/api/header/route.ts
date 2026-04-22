import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Handle GET request

    // auto cache

    const data = fetch("https://jsonplaceholder.typicode.com/todos/2", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    if (!data) {
      throw new Error("Failed to fetch data");
    }

    return NextResponse.json(
      { message: "GET request successful", data },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error handling GET request on /api/header:", error);

    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(data: any) {
  try {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/posts/" + data?.id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to POST data: ${res.status} ${res.statusText}`);
    }

    console.log("POST response with no await or consumption:", res);
    console.log("POST response:", await res.json());

    return NextResponse.json(
      { message: "POST request successful" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error handling POST request on /api/header:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(postData: any) {
  try {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/posts/" + postData?.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to PUT data: ${res.status} ${res.statusText}`);
    }

    return NextResponse.json(
      { message: "PUT request successful" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(data: any) {
  try {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/posts/" + data?.id,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to DELETE data: ${res.status} ${res.statusText}`);
    }

    return NextResponse.json(
      { message: "DELETE request successful" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
