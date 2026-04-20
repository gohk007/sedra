import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signinSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { emailOrPhone, password } = signinSchema.parse(body);

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Set cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
