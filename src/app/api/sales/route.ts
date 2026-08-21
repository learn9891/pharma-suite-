import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  doctorName: z.string().optional(),
  paymentMode: z.enum(["CASH", "UPI", "CARD"]).default("CASH"),
  discount: z.coerce.number().min(0).default(0),
  items: z
    .array(z.object({ medicineId: z.string().min(1), quantity: z.coerce.number().int().positive() }))
    .min(1),
});

export async function GET() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: true },
  });
  return NextResponse.json(sales);
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Customer name and at least one item are required" }, { status: 400 });
  }
  const body = parsed.data;

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const medicines = await tx.medicine.findMany({
        where: { id: { in: body.items.map((item) => item.medicineId) } },
      });

      let subtotal = 0;
      let gstAmount = 0;
      const itemRows = body.items.map((item) => {
        const medicine = medicines.find((candidate) => candidate.id === item.medicineId);
        if (!medicine) throw new Error("Medicine not found");
        if (medicine.stockQty < item.quantity) {
          throw new Error(`Only ${medicine.stockQty} unit(s) of ${medicine.name} left in stock`);
        }
        const lineNet = medicine.unitPrice * item.quantity;
        const lineGst = (lineNet * medicine.gstRate) / 100;
        subtotal += lineNet;
        gstAmount += lineGst;
        return {
          medicineId: medicine.id,
          name: medicine.name,
          batchNo: medicine.batchNo,
          quantity: item.quantity,
          unitPrice: medicine.unitPrice,
          gstRate: medicine.gstRate,
          lineTotal: Number((lineNet + lineGst).toFixed(2)),
        };
      });

      const discount = Math.min(body.discount, subtotal);
      const total = Number((subtotal - discount + gstAmount).toFixed(2));
      const count = await tx.sale.count();
      const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      for (const item of itemRows) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      return tx.sale.create({
        data: {
          invoiceNo,
          customerName: body.customerName,
          customerPhone: body.customerPhone || null,
          doctorName: body.doctorName || null,
          paymentMode: body.paymentMode,
          subtotal: Number(subtotal.toFixed(2)),
          gstAmount: Number(gstAmount.toFixed(2)),
          discount: Number(discount.toFixed(2)),
          total,
          items: { create: itemRows },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the invoice";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
