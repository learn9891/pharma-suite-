import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const inMonths = (months: number) => new Date(Date.now() + months * 30 * 86_400_000);

const MEDICINES = [
  { name: "Dolo 650", genericName: "paracetamol", manufacturer: "Micro Labs", category: "Tablet", batchNo: "DL2411", unitPrice: 2.4, gstRate: 12, stockQty: 480, reorderLevel: 100, expiryDate: inMonths(18), rxRequired: false },
  { name: "Brufen 400", genericName: "ibuprofen", manufacturer: "Abbott", category: "Tablet", batchNo: "BR8802", unitPrice: 3.1, gstRate: 12, stockQty: 150, reorderLevel: 60, expiryDate: inMonths(14), rxRequired: false },
  { name: "Voveran 50", genericName: "diclofenac", manufacturer: "Novartis", category: "Tablet", batchNo: "VV1290", unitPrice: 4.5, gstRate: 12, stockQty: 40, reorderLevel: 50, expiryDate: inMonths(2), rxRequired: true },
  { name: "Mox 500", genericName: "amoxicillin", manufacturer: "Sun Pharma", category: "Capsule", batchNo: "MX4410", unitPrice: 8.2, gstRate: 12, stockQty: 200, reorderLevel: 80, expiryDate: inMonths(11), rxRequired: true },
  { name: "Azithral 500", genericName: "azithromycin", manufacturer: "Alembic", category: "Tablet", batchNo: "AZ7781", unitPrice: 26.5, gstRate: 12, stockQty: 60, reorderLevel: 30, expiryDate: inMonths(9), rxRequired: true },
  { name: "Pantop 40", genericName: "pantoprazole", manufacturer: "Aristo", category: "Tablet", batchNo: "PT3345", unitPrice: 6.9, gstRate: 12, stockQty: 320, reorderLevel: 90, expiryDate: inMonths(20), rxRequired: false },
  { name: "Omez 20", genericName: "omeprazole", manufacturer: "Dr Reddys", category: "Capsule", batchNo: "OM5521", unitPrice: 5.4, gstRate: 12, stockQty: 24, reorderLevel: 40, expiryDate: inMonths(3), rxRequired: false },
  { name: "Glycomet 500", genericName: "metformin", manufacturer: "USV", category: "Tablet", batchNo: "GM9012", unitPrice: 3.8, gstRate: 12, stockQty: 400, reorderLevel: 120, expiryDate: inMonths(16), rxRequired: true },
  { name: "Amaryl 2", genericName: "glimepiride", manufacturer: "Sanofi", category: "Tablet", batchNo: "AM2210", unitPrice: 9.6, gstRate: 12, stockQty: 90, reorderLevel: 40, expiryDate: inMonths(13), rxRequired: true },
  { name: "Amlopres 5", genericName: "amlodipine", manufacturer: "Cipla", category: "Tablet", batchNo: "AP6634", unitPrice: 3.2, gstRate: 12, stockQty: 260, reorderLevel: 80, expiryDate: inMonths(22), rxRequired: true },
  { name: "Telma 40", genericName: "telmisartan", manufacturer: "Glenmark", category: "Tablet", batchNo: "TM1187", unitPrice: 7.4, gstRate: 12, stockQty: 180, reorderLevel: 70, expiryDate: inMonths(19), rxRequired: true },
  { name: "Atorva 10", genericName: "atorvastatin", manufacturer: "Zydus", category: "Tablet", batchNo: "AT4529", unitPrice: 6.1, gstRate: 12, stockQty: 210, reorderLevel: 70, expiryDate: inMonths(17), rxRequired: true },
  { name: "Cetzine 10", genericName: "cetirizine", manufacturer: "GSK", category: "Tablet", batchNo: "CZ3390", unitPrice: 2.1, gstRate: 12, stockQty: 500, reorderLevel: 120, expiryDate: inMonths(21), rxRequired: false },
  { name: "Montair LC", genericName: "montelukast", manufacturer: "Cipla", category: "Tablet", batchNo: "MT8845", unitPrice: 14.2, gstRate: 12, stockQty: 70, reorderLevel: 40, expiryDate: inMonths(10), rxRequired: true },
  { name: "Ecosprin 75", genericName: "aspirin", manufacturer: "USV", category: "Tablet", batchNo: "EC7712", unitPrice: 1.4, gstRate: 12, stockQty: 380, reorderLevel: 100, expiryDate: inMonths(15), rxRequired: false },
  { name: "Clopilet 75", genericName: "clopidogrel", manufacturer: "Sun Pharma", category: "Tablet", batchNo: "CP2266", unitPrice: 11.8, gstRate: 12, stockQty: 45, reorderLevel: 30, expiryDate: inMonths(12), rxRequired: true },
  { name: "Warf 5", genericName: "warfarin", manufacturer: "Cipla", category: "Tablet", batchNo: "WF5501", unitPrice: 5.9, gstRate: 12, stockQty: 30, reorderLevel: 25, expiryDate: inMonths(8), rxRequired: true },
  { name: "Thyronorm 50", genericName: "levothyroxine", manufacturer: "Abbott", category: "Tablet", batchNo: "TN9934", unitPrice: 2.9, gstRate: 5, stockQty: 240, reorderLevel: 80, expiryDate: inMonths(14), rxRequired: true },
  { name: "Ultracet", genericName: "tramadol", manufacturer: "Janssen", category: "Tablet", batchNo: "UC1123", unitPrice: 12.4, gstRate: 12, stockQty: 55, reorderLevel: 30, expiryDate: inMonths(7), rxRequired: true },
  { name: "Serlift 50", genericName: "sertraline", manufacturer: "Torrent", category: "Tablet", batchNo: "SL4477", unitPrice: 10.3, gstRate: 12, stockQty: 65, reorderLevel: 30, expiryDate: inMonths(16), rxRequired: true },
];

async function main() {
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicine.deleteMany();

  for (const medicine of MEDICINES) {
    await prisma.medicine.create({ data: medicine });
  }

  console.log(`Seeded ${MEDICINES.length} medicines`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
