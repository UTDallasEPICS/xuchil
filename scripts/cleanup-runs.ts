#!/usr/bin/env tsx
/**
 * Script para limpiar ProcessRuns en mal estado
 * 
 * Uso:
 *   pnpm tsx scripts/cleanup-runs.ts          # Muestra runs y pregunta qué hacer
 *   pnpm tsx scripts/cleanup-runs.ts --delete  # Elimina todos los runs no completados
 *   pnpm tsx scripts/cleanup-runs.ts --reset   # Resetea todos los runs a estado limpio (PLANNED + steps PENDING)
 */

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

function question(query: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(query, (answer) => { rl.close(); resolve(answer); });
    });
}

async function main() {
    const args = process.argv.slice(2);
    const autoDelete = args.includes('--delete');
    const autoReset = args.includes('--reset');

    const runs = await prisma.processRun.findMany({
        where: {
            status: { not: 'COMPLETED' },
        },
        include: {
            productVariant: { select: { name: true } },
            stepExecutions: {
                select: { id: true, status: true, templateStep: { select: { name: true } } },
                orderBy: { id: 'asc' },
            },
            processPauses: { select: { id: true } },
        },
        orderBy: { id: 'asc' },
    });

    if (runs.length === 0) {
        console.log('No hay ProcessRuns en mal estado. Todo limpio.');
        await prisma.$disconnect();
        return;
    }

    console.log(`\nSe encontraron ${runs.length} ProcessRun(s) no completados:\n`);

    for (const run of runs) {
        const stepSummary = run.stepExecutions.map(
            (se, i) => `    ${i + 1}. ${se.templateStep?.name || 'Sin nombre'} → ${se.status}`
        ).join('\n');

        console.log(`  ID: ${run.id}`);
        console.log(`  Producto: ${run.productVariant?.name || 'Desconocido'}`);
        console.log(`  Estado: ${run.status}`);
        console.log(`  Batch: ${run.batchCode}`);
        console.log(`  Creado: ${run.startedAt || 'Sin iniciar'}`);
        console.log(`  Pasos (${run.stepExecutions.length}):`);
        console.log(stepSummary);
        console.log(`  Pausas registradas: ${run.processPauses.length}`);
        console.log('');
    }

    let action = '';
    if (autoDelete) {
        action = 'delete';
    } else if (autoReset) {
        action = 'reset';
    } else {
        const input = await question('¿Qué deseas hacer? (d)eliminar / (r)esetear / (c)ancelar: ');
        action = input.toLowerCase().startsWith('d') ? 'delete'
            : input.toLowerCase().startsWith('r') ? 'reset'
                : 'cancel';
    }

    if (action === 'cancel') {
        console.log('Cancelado.');
        await prisma.$disconnect();
        return;
    }

    const runIds = runs.map(r => r.id);
    const stepIds = runs.flatMap(r => r.stepExecutions.map(se => se.id));
    const pauseIds = runs.flatMap(r => r.processPauses.map(p => p.id));

    if (action === 'delete') {
        console.log(`\nEliminando ${runs.length} run(s), ${stepIds.length} step(s), ${pauseIds.length} pausa(s)...`);

        await prisma.$transaction([
            // Delete step participants first (foreign key)
            prisma.stepParticipant.deleteMany({ where: { stepExecutionId: { in: stepIds } } }),
            prisma.processPause.deleteMany({ where: { processRunId: { in: runIds } } }),
            prisma.stepExecution.deleteMany({ where: { processRunId: { in: runIds } } }),
            prisma.processRun.deleteMany({ where: { id: { in: runIds } } }),
        ]);

        console.log('Eliminados exitosamente.');
    } else if (action === 'reset') {
        console.log('\nReseteando ' + runs.length + ' run(s) a estado limpio...');

        await prisma.$transaction([
            // Reset run status
            prisma.processRun.updateMany({
                where: { id: { in: runIds } },
                data: { status: 'PLANNED', startedAt: null, finishedAt: null },
            }),
            // Reset all steps to PENDING
            prisma.stepExecution.updateMany({
                where: { processRunId: { in: runIds } },
                data: { status: 'PENDING', startedAt: null, finishedAt: null, actualDurationMin: null },
            }),
            // Delete pause records
            prisma.processPause.deleteMany({ where: { processRunId: { in: runIds } } }),
        ]);

        console.log('Reseteados exitosamente. Todos los runs están en PLANNED con pasos en PENDING.');
    }

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
    process.exit(1);
});
