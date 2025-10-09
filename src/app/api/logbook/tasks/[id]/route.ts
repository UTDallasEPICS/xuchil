import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {getUser, getRole} from '@/lib/session';

export async function GET(request: NextRequest, {params}: { params: Promise<{id: string}>}) {
    const stepExecutionId = parseInt((await params).id)
    // const user = await getUser();

    // if(!user || user.workerID === null){
    //     return NextResponse.json({message: 'Access Denied. Must be a worker.'}, {status: 403});
    // }
    // if(isNaN(stepExecutionId)){
    //     return NextResponse.json({message: 'Invalid Step Execution ID.'}, {status: 400})
    // }

    try {
        const stepExecution = await prisma.stepExecution.findUnique({
            where: {id: stepExecutionId},
            include: {
                processRun: { include: { productVariant: { select: {name: true}}}},
                templateStep: {include: { processTemplate: { select: {id: true, name: true}}}},
                stepMaterialUsages: { include: {rawMaterial: true, inventoryLot: true, unit: true}},
                worker: {select: {id: true, fullName: true}},
                stepParticipants: {
                    include: {
                        worker: {select: {id: true, fullName: true}},
                        guest: {select: {id: true, displayName: true}}
                    }},
                inventoryMovements: true
            }
        })

        if(!stepExecution){
            return NextResponse.json({ message: 'Step Execution not found' }, {status: 404});
        }
        return NextResponse.json({ status: 200 });
    }
    catch(e) {
        console.error('Error fetching Step Execution details: ', e);
        return NextResponse.json({ message: 'Internal Server Error'}, { status: 500 });
    }
}