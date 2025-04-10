import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Get all users
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ message: 'Users fetched successfully', data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

// Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_name, user_password, user_role, user_email, user_phoneno } = body;
    
    const newUser = await prisma.user.create({
      data: {
        user_name,
        user_password,
        user_role,
        user_email,
        user_phoneno,
      },
    });
    
    return NextResponse.json({ message: 'User created successfully', userId: newUser.user_id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}