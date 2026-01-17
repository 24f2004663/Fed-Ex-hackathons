import { allocationQueue, ingestionQueue } from '../../src/lib/queue';

async function testQueues() {
    console.log('🧪 Testing Job Queues...');

    try {
        // Test 1: Add Allocation Job
        const allocationJob = await allocationQueue.add('test-allocation', {
            timestamp: Date.now(),
        });
        console.log(`✅ Added Allocation Job: ${allocationJob.id}`);

        // Test 2: Add Ingestion Job
        const ingestionJob = await ingestionQueue.add('test-ingestion', {
            timestamp: Date.now(),
        });
        console.log(`✅ Added Ingestion Job: ${ingestionJob.id}`);

        // Clean up
        await allocationQueue.close();
        await ingestionQueue.close();
        console.log('🎉 Queue Test Passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Queue Test Failed:', error);
        process.exit(1);
    }
}

testQueues();
