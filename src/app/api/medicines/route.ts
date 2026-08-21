import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const medicineSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().min(2),
  manufacturer: z.string().min(2),
  category: z.string().min(2),
  batchNo: z.string().min(1),
  hsnCode: z.string().default("3004"),
  unitPrice: z.coerce.number().positive(),
  gstRate: z.coerce.number().min(0).max(28),
  stockQty: z.coerce.number().int().min(0),
  reorderLevel: z.coerce.number().int().min(0),
  expiryDate: z.string().min(4),
  rxRequired: z.coerce.boolean().default(false),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const medicines = await prisma.medicine.findMany({
    where: query
      ? { OR: [{ name: { contains: query } }, { genericName: { contains: query } }] }
      : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(medicines);
}

export async function POST(request: Request) {
  const parsed = medicineSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { expiryDate, ...rest } = parsed.data;
  const medicine = await prisma.medicine.create({
    data: { ...rest, expiryDate: new Date(expiryDate) },
  });
  return NextResponse.json(medicine, { status: 201 });
}
