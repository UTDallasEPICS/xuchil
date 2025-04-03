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

// Get a specific user by ID (Assumes the request includes an ID as a search parameter)
export async function GET_ID(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id"); // Corrected
  if (!id) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

  try {
    const user = await getUserById(parseInt(id));
    if (user) {
      return NextResponse.json({ message: 'User fetched successfully', data: user }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
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

// Update a specific user by ID
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id"); // Corrected
  if (!id) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

  try {
    const body = await req.json();
    const updatedUser = await updateUser(parseInt(id), body);
    if (updatedUser) {
      return NextResponse.json({ message: 'User updated successfully', data: updatedUser }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

// Delete a specific user by ID
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id"); // Corrected
  if (!id) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

  try {
    const deleted = await deleteUser(parseInt(id));
    if (deleted) {
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
