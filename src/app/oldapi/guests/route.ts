import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { verifySession } from "@/lib/session";
import { serverError } from "@/utils/responses";

export async function GET() {
    try {
        const payload = await verifySession();
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const guests = await prisma.guestCollaborator.findMany({
            where: { isActive: true },
            select: {
                id: true,
                displayName: true,
                contactInfo: true,
                isActive: true,
            },
            orderBy: { displayName: "asc" },
        });

        return NextResponse.json(guests);
    } catch (error) {
        return serverError("guest", "fetch", error);
    }
}

export async function POST(request: Request) {
    try {
        const payload = await verifySession();
        if (!payload || !payload.isAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await request.json();
        const { displayName, contactInfo, password } = body;

        if (!displayName || displayName.trim().length === 0) {
            return NextResponse.json({ error: "displayName is required" }, { status: 400 });
        }

        let passwordHash: string | undefined;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const guest = await prisma.guestCollaborator.create({
            data: {
                displayName: displayName.trim(),
                contactInfo: contactInfo?.trim() || null,
                passwordHash: passwordHash || null,
            },
        });

        return NextResponse.json(
            { id: guest.id, displayName: guest.displayName, contactInfo: guest.contactInfo },
            { status: 201 }
        );
    } catch (error) {
        return serverError("guest", "create", error);
    }
}
