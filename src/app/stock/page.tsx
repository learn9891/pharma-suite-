import { prisma } from "@/lib/db";
import StockManager from "@/components/StockManager";

export const dynamic = "force-dynamic";

export default async function StockPage({ searchParams }: { searchParams: { filter?: string } }) {
  const medicines = await prisma.medicine.findMany({ orderBy: { name: "asc" } });
  return (
    <StockManager
      initialMedicines={medicines.map((medicine) => ({
        ...medicine,
        expiryDate: medicine.expiryDate.toISOString(),
        createdAt: medicine.createdAt.toISOString(),
        updatedAt: medicine.updatedAt.toISOString(),
      }))}
      initialFilter={searchParams.filter === "low" || searchParams.filter === "expiring" ? searchParams.filter : "all"}
    />
  );
}
