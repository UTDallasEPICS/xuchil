import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// currently hard-coded because authentication not implemented yet
// set here for testing purposes
const WORKER_ID = 1;

export async function GET(request: NextRequest) {
    const workerId = WORKER_ID;

    const {searchParams} = new URL(request.url);
    const dateFrom  = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const productVariantId = searchParams.get('productVariantId');

    const where: any = {
        OR: [
            {workerId: workerId},
            {stepParticipants: {some: {workerId: workerId}}}
        ]
    };

    if(dateFrom || dateTo) {
        where.startedAt = {};
        if(dateFrom){
            where.startedAt.gte = new Date(dateFrom as string);
        }
        if(dateTo){
            // gets the entire date range
            const endDate = new Date(dateTo as string);
            endDate.setDate(endDate.getDate() + 1);
            where.startedAt.lt = endDate;
        }
    }

    if(productVariantId) {
        const productId = parseInt(productVariantId);
        if (!isNaN(productId)){
            where.processRun = {
                productVariantId: productId
            };
        }
    }

    try {
        const myTasks = await prisma.stepExecution.findMany({
            where: where,
            orderBy: {
                startedAt: 'desc', // newest first
            },
            select: {
                id: true,
                processRun: {select: {batchCode: true, productVariant: {select: {name: true}}}},
                templateStep: {select: {id: true, name: true}},
                status: true,
                startedAt: true,
                finishedAt: true,
                actualDurationMin: true,
                inputQty: true,
                inputUnit: {select: {name: true}},
                notes: true
            }
        });
        return NextResponse.json(myTasks, {status: 200});
    }
    catch(e){
        console.error('Error fetching myTasks:', e);
        return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
    }
}

