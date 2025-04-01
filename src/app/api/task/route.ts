import prisma from '@/lib/db'

export async function POST(request: Request) {
    const body = await request.json();
    const { 
        input_weight, 
        output_weight, 
        loss_weight, 
        status, 
        start_timestamp, 
        end_timestamp, 
        notes, 
        worker_id, 
        product_id 
    } = body;

const task = await prisma.task.create( {
    data: {
        input_weight,
        output_weight,
        loss_weight,
        status,
        start_timestamp,
        end_timestamp,
        notes,
        worker_id,
        product_id,
    }
})

return Response.json(task);

}