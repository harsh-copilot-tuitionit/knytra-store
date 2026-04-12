import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  const codEnabled = process.env.ENABLE_COD === "true";
  const codMaxOrder = parseInt(process.env.ENABLE_COD_MAX_ORDER ?? "0", 10) || 0;

  return Response.json({
    codEnabled,
    codMaxOrder: codMaxOrder > 0 ? codMaxOrder : null,
  });
}
