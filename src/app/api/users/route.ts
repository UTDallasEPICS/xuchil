import {NextRequest, NextResponse} from 'next/server';
import prisma from 'src/lib/db';
import bcrypt from 'bcrypt';

// Get all users
export async function GET(_req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      omit: {
        passwordHash: true,
      }
    });
    return NextResponse.json({data: users}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to fetch user", details: error}
    }, {status: 500});
  }
}

// Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {username, name, password, role, email, phoneNo} = body;

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: {username},
    });

    if (existingUser) {
      return NextResponse.json({
        error: {message: 'Username already taken'}
      }, {status: 409});
    }

    // hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        passwordHash,
        // Set default role to "worker" if not provided
        role: role || 'worker',
        email,
        phoneNo,
      },
      omit: {
        passwordHash: true,
      }
    });

    return NextResponse.json({data: newUser}, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: { message: "Failed to create user", details: error}
    }, {status: 500});
  }
}