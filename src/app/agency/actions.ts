"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export async function getAgenciesAction() {
    try {
        const agencies = await prisma.agency.findMany({
            where: { status: 'ACTIVE' },
            include: {
                performance: {
                    orderBy: { month: 'desc' },
                    take: 12
                }
            },
            orderBy: { name: 'asc' }
        });

        // Map to expected format for dashboard
        return agencies.map((a: any) => {
            const history = a.performance.map((p: any) => p.recoveryRate).reverse(); // Oldest first? or latest first? Dashboard graph expects array. Usually chronological (oldest -> newest).
            // DB returns desc (newest first). So reverse it.
            // Fill missing history with 0 if needed?

            const latestPerf = a.performance[0];
            const currentScore = latestPerf ? latestPerf.recoveryRate : 60; // Default

            // If history is less than 12, pad?
            // Simplified for demo:

            return {
                id: a.id,
                name: a.name,
                score: currentScore,
                history: history.length > 0 ? history : [60, 60, 60, 60]
            };
        });
    } catch (e) {
        console.error("Failed to fetch agencies:", e);
        return [];
    }
}

export async function addAgencyAction(name: string) {
    try {
        const newAgency = await prisma.agency.create({
            data: {
                name,
                status: 'ACTIVE',
                capacity: 5
            }
        });
        revalidatePath("/");
        revalidatePath("/login");
        return { ...newAgency, score: 0 };
    } catch (e) {
        return null;
    }
}

export async function removeAgencyAction(id: string) {
    await prisma.agency.update({
        where: { id },
        data: { status: 'INACTIVE', deletedAt: new Date() }
    });
    revalidatePath("/");
    revalidatePath("/login");
}

export async function resetAgenciesAction() {
    // No-op or restore defaults?
    // Let's not wipe DB in production mode.
    // For demo, maybe re-activate Alpha/Beta/Gamma?

    await prisma.agency.updateMany({
        where: {
            name: { in: ['Alpha Collections', 'Beta Recovery', 'Gamma Partners'] }
        },
        data: { status: 'ACTIVE' }
    });

    revalidatePath("/");
    revalidatePath("/login");
}

export async function uploadAgencyDataAction(formData: FormData) {
    const agencyId = formData.get('agencyId') as string;
    const file = formData.get('file') as File;

    if (!agencyId || !file) {
        return { success: false, error: "Missing agency ID or file" };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}_${safeName}`);

        await fs.promises.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.promises.writeFile(tempPath, buffer);

        const scriptPath = 'AnalyzeAgency.py';
        const args = ['--file', tempPath];

        const pythonCommand = process.platform === "win32" ? "python" : "python3"; // Or 'python' if env is set
        // In some envs it might be 'python'.

        return new Promise<any>((resolve) => {
            const pythonProcess = spawn(pythonCommand, [path.join(process.cwd(), scriptPath), ...args]);

            let output = '';
            let errorOutput = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', async (code) => {
                // Cleanup
                await fs.promises.unlink(tempPath).catch(e => console.error("Failed delete:", e));

                if (code !== 0) {
                    resolve({ success: false, error: "Analysis script failed: " + errorOutput });
                    return;
                }

                try {
                    // Parse output
                    // Output might have "Debug" lines, but we changed python script to only print JSON?
                    // Hopefully. Python might print stderr.
                    // Let's attempt JSON parse on the last line or full output?
                    // We removed print statements in Python, except one print(json.dumps).
                    const result = JSON.parse(output.trim());

                    if (result.error) {
                        resolve({ success: false, error: result.error });
                        return;
                    }

                    // Update DB with results
                    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

                    if (result.score) {
                        // Upsert Performance
                        const existing = await prisma.agencyPerformance.findFirst({
                            where: { agencyId, month }
                        });

                        if (existing) {
                            await prisma.agencyPerformance.update({
                                where: { id: existing.id },
                                data: { recoveryRate: result.score }
                            });
                        } else {
                            await prisma.agencyPerformance.create({
                                data: {
                                    agencyId,
                                    month,
                                    recoveryRate: result.score,
                                    slaAdherence: 95, // Default
                                    avgDSO: 40
                                }
                            });
                        }
                    }

                    if (result.capacity) {
                        await prisma.agency.update({
                            where: { id: agencyId },
                            data: { capacity: result.capacity }
                        });
                    }

                    revalidatePath('/agency');
                    revalidatePath('/');

                    resolve({
                        success: true,
                        details: `Updated: Score ${result.score || 'N/A'}, Capacity ${result.capacity || 'N/A'}`
                    });

                } catch (e: any) {
                    resolve({ success: false, error: "Failed to parse analysis result: " + e.message });
                }
            });
        });

    } catch (error: any) {
        console.error("Upload Action Error:", error);
        return { success: false, error: error.message };
    }
}
