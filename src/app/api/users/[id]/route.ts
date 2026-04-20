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
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { role } = body;

  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
