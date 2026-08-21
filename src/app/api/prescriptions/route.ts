import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parsePrescription } from "@/lib/prescription";

const bodySchema = z.object({
  patientName: z.string().min(1),
  doctorName: z.string().optional(),
  text: z.string().min(5),
});

export async function GET() {
  const prescriptions = await prisma.prescription.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(prescriptions);
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Patient name and prescription text are required" }, { status: 400 });
  }

  const analysis = parsePrescription(parsed.data.text);
  const inventory = await prisma.medicine.findMany({
    select: { id: true, name: true, genericName: true, stockQty: true, unitPrice: true, batchNo: true },
  });

  const lines = analysis.lines.map((line) => {
    const needle = (line.generic ?? line.drugName).toLowerCase();
    const match = inventory.find(
      (item) =>
        item.genericName.toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle),
    );
    return {
      ...line,
      inventory: match
        ? {
            id: match.id,
            name: match.name,
            batchNo: match.batchNo,
            stockQty: match.stockQty,
            unitPrice: match.unitPrice,
            sufficient: line.quantity ? match.stockQty >= line.quantity : match.stockQty > 0,
          }
        : null,
    };
  });

  const result = { ...analysis, lines };

  const saved = await prisma.prescription.create({
    data: {
      patientName: parsed.data.patientName,
      doctorName: parsed.data.doctorName || null,
      rawText: parsed.data.text,
      analysis: JSON.stringify(result),
    },
  });

  return NextResponse.json({ id: saved.id, ...result }, { status: 201 });
}
