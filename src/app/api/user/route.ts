import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './service';

// Get all users
export async function GET(req: NextRequest) {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ message: 'Users fetched successfully', data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

// Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUser = await createUser(body);
    return NextResponse.json({ message: 'User created successfully', userId: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}