import prisma from '../src/lib/db';
import fs from 'fs';
import path from 'path';

// Define types based on JSON structure
interface AgencyData {
    id: string;
    name: string;
    score: number;
    history: number[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'agencies.json');

async function migrate() {
    console.log("Starting Agency Migration...");

    if (!fs.existsSync(DATA_FILE)) {
        console.error("No agencies.json found at:", DATA_FILE);
        return;
    }

    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const agencies: AgencyData[] = JSON.parse(rawData);

    for (const agency of agencies) {
        console.log(`Migrating: ${agency.name} (${agency.id})`);

        // 1. Upsert Agency
        // Determine capacity based on score logic (mirroring Allocation.py initially)
        let capacity = 3;
        if (agency.score >= 85) capacity = 5;
        else if (agency.score >= 75) capacity = 4;

        const status = agency.score > 60 ? 'ACTIVE' : 'ACTIVE'; // Default to ACTIVE for now, or match Allocation logic if 'Probationary' mapped to ACTIVE but low capacity

        await prisma.agency.upsert({
            where: { id: agency.id },
            update: {
                name: agency.name,
                capacity,
                // status: 'ACTIVE' // Keep default
            },
            create: {
                id: agency.id,
                name: agency.name,
                capacity,
                region: 'NA', // Default
                status: 'ACTIVE'
            }
        });

        // 2. Populate History (AgencyPerformance)
        // History array is 12 items. Assuming last item is "last month", or "current month - 1"
        // Let's assume index 0 is 11 months ago, index 11 is last month.
        const today = new Date();

        // Clear old performance entries to avoid dupes/confusion during re-runs
        await prisma.agencyPerformance.deleteMany({
            where: { agencyId: agency.id }
        });

        for (let i = 0; i < agency.history.length; i++) {
            const score = agency.history[i];

            // Calculate month for this entry
            // agency.history length is 12. i=11 is "last month"
            const monthDate = new Date();
            monthDate.setMonth(today.getMonth() - (agency.history.length - i));
            const monthStr = monthDate.toISOString().slice(0, 7); // YYYY-MM

            // Generate dummy metrics that derive the score approx
            // Score ~= 0.5 * Rec + 0.3 * SLA + 0.2 * Cap
            // Let's just set Rec = Score, SLA = Score for simplicity

            await prisma.agencyPerformance.create({
                data: {
                    agencyId: agency.id,
                    month: monthStr,
                    recoveryRate: score, // Mapping directly for simplicity
                    slaAdherence: score,
                    avgDSO: 45 - (score - 60) * 0.5 // Lower DSO for higher score
                }
            });
        }

        // 3. Link Users (Attempt to find user by ID pattern or Agency ID)
        // Our user IDs often match agency IDs in the seed data (e.g. user-agency-alpha)
        // Let's try to update the user with ID == agency.id to have agencyId set.

        const userExists = await prisma.user.findUnique({ where: { id: agency.id } });
        if (userExists) {
            await prisma.user.update({
                where: { id: agency.id },
                data: { agencyId: agency.id }
            });
            console.log(`  Linked User ${agency.id} to Agency.`);
        }
    }

    console.log("Migration Complete.");
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
