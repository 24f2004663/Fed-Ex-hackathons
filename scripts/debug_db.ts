import prisma from '../src/lib/db';

async function check() {
    const count = await prisma.agency.count();
    console.log(`Agency Count: ${count}`);
    const agencies = await prisma.agency.findMany();
    console.log("Agencies:", JSON.stringify(agencies, null, 2));
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
