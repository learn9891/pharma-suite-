import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  genericName: z.string().min(2).optional(),
  manufacturer: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  batchNo: z.string().min(1).optional(),
  unitPrice: z.coerce.number().positive().optional(),
  gstRate: z.coerce.number().min(0).max(28).optional(),
  stockQty: z.coerce.number().int().min(0).optional(),
  reorderLevel: z.coerce.number().int().min(0).optional(),
  expiryDate: z.string().min(4).optional(),
  rxRequired: z.coerce.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { expiryDate, ...rest } = parsed.data;
  const medicine = await prisma.medicine.update({
    where: { id: params.id },
    data: { ...rest, ...(expiryDate ? { expiryDate: new Date(expiryDate) } : {}) },
  });
  return NextResponse.json(medicine);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.medicine.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
