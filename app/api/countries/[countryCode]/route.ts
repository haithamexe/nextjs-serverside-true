import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { countryCodeSchema } from "../../../_lib/countries/schemas";
import { getCountry } from "../../../_lib/countries/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> },
) {
  try {
    const { countryCode } = await params;
    const parsed = countryCodeSchema.safeParse({ countryCode });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid country code" },
        { status: 400 },
      );
    }

    const data = await getCountry(parsed.data.countryCode);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const status = message.toLowerCase().includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> },
) {
  try {
    const { countryCode } = await params;
    const parsed = countryCodeSchema.safeParse({ countryCode });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid country code" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: `Deleted country ${parsed.data.countryCode}` },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
