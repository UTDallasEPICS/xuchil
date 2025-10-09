import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {getUser} from '@/lib/session';

export async function GET(request: NextRequest) {
    const user = await getUser();

    // if(!user || user.workerID === null){
    //     return NextResponse.json({message: 'Access Denied. Must be a worker'}, {status: 403});
    // }
    
    const workerId = user.WorkerId;

    const {searchParams} = new URL(request.url);
    const dateFrom  = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const productVariantId = searchParams.get('productVariantId');

    const where: any = {
        workerId: workerId,
        OR: [
            {workerId: workerId},
            {stepParticipants: {some: {workerId: workerId}}}
        ]
    };

    if(dateFrom || dateTo) {
        where.startedAt = {};
        if(dateFrom){
            where.startedAt.gte = new Date(dateFrom);
        }
        if(dateTo){
            where.startedAt.lte = new Date(dateTo);
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

