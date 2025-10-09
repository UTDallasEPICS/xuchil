import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {getUser, getRole} from '@/lib/session';
import { ProcessStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
    // const user = await getUser();

    // if (!user || user.isAdmin === false) {
    //     return NextResponse.json({message: 'Access denied. Must be Admin'}, {status: 403});
    // }

    const {searchParams} = new URL(request.url);
    const batchCode = searchParams.get('batchCode');
    const workerId = searchParams.get('workerId');
    const dateFrom  = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const productVariantId = searchParams.get('productVariantId');

    const where: any= {
        status: {
            in: [ProcessStatus.COMPLETED, ProcessStatus.CANCELLED]
        }
    };

    if(batchCode){
        where.batchCode = {
            batchCode: batchCode
        }
    }

    if(workerId){
        where.WorkerId = {
            workerId: workerId
        }
    }

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

    try{
        const processRuns = await prisma.processRun.findMany({
            where: where,
            orderBy: {
                startedAt: 'desc'
            },
            select: {
                id: true,
                batchCode: true,
                status: true,
                startedAt: true,
                finishedAt: true,
                goodOutputQty: true,
                productVariant: {select: {name: true}},
                outputUnit: {select: {name: true}}
            }
        });
        return NextResponse.json(processRuns, {status: 200});
    } catch(e){
        console.error('Error fetching Process Runs history.', e);
        return NextResponse.json({message: 'Interval Server Error'}, {status: 500});
    }
}