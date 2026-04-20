import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const inspectionSchema = z.object({
  checInspectorName: z.string(),
  ececInspectorName: z.string(),
  villaType: z.string(),
  villaNumber: z.number(),
  activityType: z.string(),
  statusOfInspection: z.string(),
  remarks: z.string(),
  department: z.string(),
  wirAttachmentUrl: z.string().optional(),
  wirAttachmentName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = inspectionSchema.parse(body);

    const inspection = await prisma.inspection.create({
      data: {
        ...data,
        userId: auth.userId,
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Inspection creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //Get user role and decide what data to return
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let data;
    if (user.role === "admin") {
      // Admin can get all inspections
      data = await prisma.inspection.findMany({
        include: {
          user: { select: { id: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Regular users can only get their own inspections
      data = await prisma.inspection.findMany({
        where: { userId: auth.userId },
        include: {
          user: { select: { id: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Fetch inspections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
