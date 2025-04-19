import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Get all users
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phoneno: true,
      },
    });
    return NextResponse.json({ message: 'Users fetched successfully', data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

// Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name, password, role, email, phoneno } = body;

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
    }

    // Set default role to "worker" if not provided
    const userRole = role || 'worker';

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        password,
        role: userRole,
        email,
        phoneno,
      },
    });

    return NextResponse.json({ message: 'User created successfully', userId: newUser.user_id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}