import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can download data" },
        { status: 403 }
      );
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause = {};

    if (startDate && endDate) {
      whereClause = {
        dateTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true, phone: true } },
      },
      orderBy: { dateTime: "desc" },
    });

    // Convert to CSV format
    if (inspections.length === 0) {
      return NextResponse.json(
        { message: "No data found for the selected date range" },
        { status: 200 }
      );
    }

    const csv = [
      [
        "Serial Number",
        "Date & Time",
        "CHEC Inspector Name",
        "ECEC Inspector Name",
        "Villa Type",
        "Villa Number",
        "Activity Type",
        "Status of Inspection",
        "Remarks",
        "Department",
        "Submitted By (Email)",
        "Submitted By (Phone)",
      ].join(","),
      ...inspections.map((inspection: any) =>
        [
          inspection.serialNumber,
          inspection.dateTime.toISOString(),
          inspection.checInspectorName,
          inspection.ececInspectorName,
          inspection.villaType,
          inspection.villaNumber,
          inspection.activityType,
          inspection.statusOfInspection,
          `"${inspection.remarks.replace(/"/g, '""')}"`,
          inspection.department,
          inspection.user.email,
          inspection.user.phone,
        ].join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=inspections.csv",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
