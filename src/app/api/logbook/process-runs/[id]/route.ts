import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }){
    const processRunId = parseInt((await params).id);

    try{
        const processRun = await prisma.processRun.findUnique({
            where: {id: processRunId},
            include: {
                productVariant: {select: {name: true}},
                processTemplate: {select: {name: true, version: true}},
                creator: {select: {id: true, fullName: true}},
                plannedUnit: {select: {name: true}},
                outputUnit: {select: {name: true}},
                processPauses: {select: {startedAt: true, endedAt: true, reason: true}},
                inventoryMovements: true,
                stepExecutions: {
                    orderBy: {templateStep: {position: 'asc'}},
                    select: {
                        id: true,
                        status: true,
                        startedAt: true,
                        finishedAt: true,
                        actualDurationMin: true,
                        notes: true,
                        templateStep: {select: {name: true, position: true}},
                        worker: {select: {id: true, fullName: true}},
                        stepParticipants: {
                            include:{
                                worker: {select: {id: true, fullName: true}},
                                guest: {select: {id: true, displayName: true}}
                            }}}}
            }
        })

        if(!processRun){
            return NextResponse.json({ message: 'Process Run not found'}, { status: 404 });
        }
        return NextResponse.json({ processRun, status: 200});
    }catch(e){
        console.error('Error fetching Process Run details: ', e);
        return NextResponse.json({ message: 'Internal Server Error'}, { status: 500 });
    }
}