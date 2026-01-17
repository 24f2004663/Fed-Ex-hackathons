const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking database content...');

    const invoiceCount = await prisma.invoice.count();
    console.log(`Invoices: ${invoiceCount}`);

    const caseCount = await prisma.case.count();
    console.log(`Cases: ${caseCount}`);

    const cases = await prisma.case.findMany({
        include: { invoice: true }
    });
    console.log('Sample Cases:', JSON.stringify(cases, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
