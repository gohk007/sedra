import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

async function requireAdmin(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth) return null;
  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (user?.role !== "admin") return null;
  return auth;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      plainPassword: true,
      createdAt: true,
      _count: { select: { inspections: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

const createUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { email, phone, password, role } = createUserSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email or phone already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, phone, password: hashedPassword, plainPassword: password, role },
      select: { id: true, email: true, phone: true, role: true, plainPassword: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
