import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/db';
import bcrypt from "bcrypt";

// Get a user by ID
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }
    const user = await prisma.user.findUnique({
      where: {id: id,},
      omit: {passwordHash: true,}
    });

    if (!user) {
      return NextResponse.json({
        error: {message: 'User not found'}
      }, {status: 404});
    }

    return NextResponse.json({data: user}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to fetch user", details: error}
    }, {status: 500});
  }
}

// Update a user by ID
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    const body = await req.json();

    const {username, name, password, role, email, phoneNo} = body;

    let passwordHash = null;
    if (password) {
      // hash password
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: {id: id,},
      data: {
        username,
        name,
        role,
        email,
        phoneNo,
        ...((passwordHash != null) ? {passwordHash} : {})
      },
      omit: {passwordHash: true,}
    });

    if (!updatedUser) {
      return NextResponse.json({
        error: {message: 'User not found'}
      }, {status: 404});
    }

    return NextResponse.json({data: updatedUser}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to update user", details: error}
    }, {status: 500});
  }
}

// Delete a user by ID
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }
    await prisma.user.delete({
      where: {id: id},
    });

    return new NextResponse(null, {status:204})
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to delete user", details: error}
    }, {status: 500});
  }
}