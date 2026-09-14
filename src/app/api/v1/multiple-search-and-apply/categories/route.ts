import { NextRequest, NextResponse } from "next/server";
import {
  multipleSearchApplyService,
  apiSuccess,
  apiError,
  serializeBigInt,
} from "@/backend";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get("website");
    const universityIds = searchParams.get("university_id");
    const levels = searchParams.get("level");

    if (!website || !website.trim()) {
      return NextResponse.json(
        {
          status: false,
          message: "website is required",
          data: [],
        },
        { status: 422 },
      );
    }

    const categories = await multipleSearchApplyService.getCategories(
      website,
      universityIds,
      levels,
    );
    if (!categories || categories.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: "No categories found",
          data: [],
        },
        { status: 404 },
      );
    }

    return apiSuccess(
      serializeBigInt(categories),
      "Categories fetched successfully",
    );
  } catch (error: any) {
    return apiError(error.message);
  }
}
