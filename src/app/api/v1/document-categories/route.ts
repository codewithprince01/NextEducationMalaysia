import { NextResponse } from 'next/server';
import { GET as getCategories } from '../university-documents/categories/route';

export async function GET(request: Request) {
  return getCategories(request);
}

