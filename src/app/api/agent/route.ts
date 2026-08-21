import { NextResponse } from "next/server";
import { z } from "zod";
import { askPharmaAgent } from "@/lib/ai";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
    .min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversation payload" }, { status: 400 });
  }

  const messages = parsed.data.messages;
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const stockHits = lastUser
    ? await prisma.medicine.findMany({
        where: { OR: [{ name: { contains: lastUser.content.split(/\s+/)[0] } }] },
        take: 5,
        select: { name: true, stockQty: true, batchNo: true, unitPrice: true },
      })
    : [];

  const withStock = stockHits.length
    ? [
        ...messages.slice(0, -1),
        {
          role: "user" as const,
          content: `${lastUser?.content ?? ""}\n\nOur current stock context: ${stockHits
            .map((hit) => `${hit.name} qty ${hit.stockQty} batch ${hit.batchNo}`)
            .join("; ")}`,
        },
      ]
    : messages;

  const reply = await askPharmaAgent(withStock);
  return NextResponse.json(reply);
}
