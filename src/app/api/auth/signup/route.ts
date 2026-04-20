import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, phone, password } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or phone number already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        plainPassword: password,
        role: "user",
      },
    });

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
      { status: 201 }
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

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
