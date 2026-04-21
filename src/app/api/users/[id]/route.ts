import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

async function requireAdmin(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth) return null;
  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (user?.role !== "admin") return null;
  return auth;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (id === auth.userId) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (id === auth.userId) {
    return NextResponse.json(
      { error: "Cannot modify your own account" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { role, isDisabled } = body;

  const updateData: any = {};

  // Handle role update
  if (role !== undefined) {
    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updateData.role = role;
  }

  // Handle disabled status update
  if (isDisabled !== undefined) {
    if (typeof isDisabled !== "boolean") {
      return NextResponse.json({ error: "Invalid disabled status" }, { status: 400 });
    }
    updateData.isDisabled = isDisabled;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, role: true, isDisabled: true },
  });

  return NextResponse.json(user);
}
