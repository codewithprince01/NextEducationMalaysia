import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail } from '@/backend/email/send-lead-email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const payload = {
      name: String(body.name || '').trim(),
      email: String(body.email || '').trim(),
      phone: String(body.phone || body.mobile || '').trim(),
      nationality: String(body.nationality || '').trim() || null,
      university: String(body.university || body.universityName || '').trim() || null,
      message: String(body.message || '').trim() || null,
      formType: String(body.formType || body.source || '').trim() || null,
      sourceUrl: String(body.sourceUrl || body.source_path || '').trim() || '/',
      extraFields: typeof body.extraFields === 'object' && body.extraFields ? body.extraFields : null,
    };

    if (!payload.name || !payload.email || !payload.phone) {
      return NextResponse.json(
        { status: false, message: 'name, email and phone are required' },
        { status: 400 }
      );
    }

    await sendLeadEmail(payload);
    return NextResponse.json({ status: true, message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
