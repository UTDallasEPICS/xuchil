#!/usr/bin/env tsx
/**
 * Script para limpiar ProcessRuns en mal estado
 * 
 * Uso:
 *   pnpm tsx scripts/cleanup-runs.ts          # Muestra runs y pregunta qué hacer
 *   pnpm tsx scripts/cleanup-runs.ts --delete  # Elimina todos los runs no completados
 *   pnpm tsx scripts/cleanup-runs.ts --reset   # Resetea todos los runs a estado limpio (PLANNED + steps PENDING)
 */

import { PrismaClient, ProcessStatus, StepStatus } from '@prisma/client';
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

    const runs = await prisma.processExecution.findMany({
        where: {
            status: { not: ProcessStatus.COMPLETED },
        },
        include: {
            process: {
                include: {
                    product: { select: { name: true } },
                },
            },
            processStepExecutions: {
                include: {
                    processStep: { select: { name: true } },
                },
                orderBy: { id: 'asc' },
            },
            processPauses: { select: { id: true, processStepExecutionId: true } },
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
        const stepSummary = run.processStepExecutions.map(
            (se, i) => `    ${i + 1}. ${se.processStep?.name || 'Sin nombre'} → ${se.status}`
        ).join('\n');

        console.log(`  ID: ${run.id}`);
        console.log(`  Producto: ${run.process?.product?.name || 'Desconocido'}`);
        console.log(`  Estado: ${run.status}`);
        console.log(`  Iniciado: ${run.startedAt ? run.startedAt.toISOString() : 'Sin iniciar'}`);
        console.log(`  Pasos (${run.processStepExecutions.length}):`);
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
    const stepIds = runs.flatMap(r => r.processStepExecutions.map(se => se.id));
    const pauseIds = runs.flatMap(r => r.processPauses.map(p => p.id));

    if (action === 'delete') {
        console.log(`\nEliminando ${runs.length} run(s), ${stepIds.length} step(s), ${pauseIds.length} pausa(s)...`);

        await prisma.$transaction([
            prisma.processPause.deleteMany({ where: { processStepExecutionId: { in: stepIds } } }),
            prisma.processStepWorker.deleteMany({ where: { stepExecutionId: { in: stepIds } } }),
            prisma.processStepMaterialUsage.deleteMany({ where: { stepExecutionId: { in: stepIds } } }),
            prisma.processStepExecution.deleteMany({ where: { processExecutionId: { in: runIds } } }),
            prisma.processExecution.deleteMany({ where: { id: { in: runIds } } }),
        ]);

        console.log('Eliminados exitosamente.');
    } else if (action === 'reset') {
        console.log('\nReseteando ' + runs.length + ' run(s) a estado limpio...');

        await prisma.$transaction([
            prisma.processExecution.updateMany({
                where: { id: { in: runIds } },
                data: { status: ProcessStatus.PLANNED, finishedAt: null },
            }),
            prisma.processStepExecution.updateMany({
                where: { processExecutionId: { in: runIds } },
                data: { status: StepStatus.PENDING, startedAt: null, finishedAt: null, actualDurationMin: null },
            }),
            prisma.processPause.deleteMany({ where: { processStepExecutionId: { in: stepIds } } }),
        ]);

        console.log('Reseteados exitosamente. Todos los procesos están en PLANNED con pasos en PENDING.');
    }

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
    process.exit(1);
});
