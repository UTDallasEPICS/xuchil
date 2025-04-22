import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const since = searchParams.get('since');
  const until = searchParams.get('until');

  let query = 'SELECT * FROM `order` WHERE 1=1';
  const params: any[] = [];

  if (status) {
    query += ' AND deliveryStatus = ?';
    params.push(status);
  }

  if (since) {
    query += ' AND deliveryDate >= ?';
    params.push(since);
  }

  if (until) {
    query += ' AND deliveryDate <= ?';
    params.push(until);
  }

  try {
    const [rows] = await db.query(query, params);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus = 'pending' } = body;

    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO `order` (client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus]
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Order created successfully' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus } = body;

    const [result] = await db.query<ResultSetHeader>(
      'UPDATE `order` SET client = ?, deliveryAddress = ?, deliveryDate = ?, deliveryMethod = ?, deliveryStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
