import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET all applications for the authenticated user
export async function GET() {
  try {
    // Get session from the authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only fetch applications belonging to the authenticated user
    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        appliedDate: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// POST create a new application for the authenticated user
export async function POST(request: Request) {
  try {
    // Get session from the authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.company || !body.appliedDate || !body.role) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: company, appliedDate, and role are required",
        },
        { status: 400 },
      );
    }

    // Create application with the authenticated user's ID
    const application = await prisma.application.create({
      data: {
        company: body.company,
        role: body.role,
        appliedDate: new Date(body.appliedDate),
        userId: session.user.id, // Automatically use the authenticated user's ID
        status: body.status || "Applied",
        notes: body.notes || null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
