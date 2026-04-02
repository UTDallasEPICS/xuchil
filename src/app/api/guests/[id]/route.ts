import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { verifySession } from "@/lib/session";
import { serverError, notFoundError } from "@/utils/responses";

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await verifySession();
        if (!payload || !payload.isAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const guestId = parseInt((await context.params).id);
        if (isNaN(guestId)) {
            return NextResponse.json({ error: "Invalid guest ID" }, { status: 400 });
        }

        const body = await request.json();
        const { displayName, contactInfo, password } = body;

        const updateData: any = {};
        if (displayName !== undefined) updateData.displayName = displayName.trim();
        if (contactInfo !== undefined) updateData.contactInfo = contactInfo?.trim() || null;
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.guestCollaborator.update({
            where: { id: guestId },
            data: updateData,
            select: { id: true, displayName: true, contactInfo: true, isActive: true },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        if (error?.code === "P2025") {
            return notFoundError("guest");
        }
        return serverError("guest", "update", error);
    }
}

export async function DELETE(
    _request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await verifySession();
        if (!payload || !payload.isAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const guestId = parseInt((await context.params).id);
        if (isNaN(guestId)) {
            return NextResponse.json({ error: "Invalid guest ID" }, { status: 400 });
        }

        await prisma.guestCollaborator.update({
            where: { id: guestId },
            data: { isActive: false },
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        if (error?.code === "P2025") {
            return notFoundError("guest");
        }
        return serverError("guest", "delete", error);
    }
}
