import { NextResponse } from "next/server";

import { getCountries } from "../../_lib/countries/service";

export async function GET() {
  try {
    const data = await getCountries();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
