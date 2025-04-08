import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '../service';

// Get a user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const parsedId = parseInt(id);
  if (!parsedId) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

  try {
    const user = await getUserById(parsedId);
    if (user) {
      return NextResponse.json({ message: 'User fetched successfully', data: user }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

// Update a user by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;  
  const parsedId = parseInt(id); 
  if (!parsedId) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

  try {
    const body = await req.json();
    const updatedUser = await updateUser(parsedId, body);
    if (updatedUser) {
      return NextResponse.json({ message: 'User updated successfully', data: updatedUser }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

// Delete a user by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;  
  const parsedId = parseInt(id); 
  if (!parsedId) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

  try {
    const deleted = await deleteUser(parsedId);
    if (deleted) {
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}