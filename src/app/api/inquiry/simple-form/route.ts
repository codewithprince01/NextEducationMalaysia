import { NextRequest, NextResponse } from 'next/server';
import { inquiryService } from '@/backend';
import { buildLeadSource } from '@/backend/utils/lead-source';

async function parseBody(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return request.json().catch(() => ({} as any));
  }
  const formData = await request.formData();
  return {
    name: formData.get('name'),
    email: formData.get('email'),
    mobile: formData.get('mobile'),
    nationality: formData.get('nationality'),
    source: formData.get('source'),
    source_path: formData.get('source_path'),
    message: formData.get('message'),
    formType: formData.get('formType'),
    sourceUrl: formData.get('sourceUrl'),
    country_code: formData.get('country_code'),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);

    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 190);
    const mobile = String(body.mobile || '').trim().slice(0, 20);
    const countryCode = String(body.country_code || '91').replace('+', '').trim().slice(0, 8) || '91';

    if (!name || !email || !mobile) {
      return NextResponse.json({ status: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sourceMeta = buildLeadSource({
      formType: body.formType as string,
      source: body.source as string,
      sourceUrl: body.sourceUrl as string,
      sourcePath: body.source_path as string,
      requestfor: body.requestfor as string,
    });

    await inquiryService.createLead({
      name,
      email,
      country_code: countryCode,
      mobile,
      source: sourceMeta.source,
      source_path: sourceMeta.source_path,
      nationality: String(body.nationality || '').trim() || undefined,
      message: String(body.message || '').trim() || undefined,
      extra_fields: body,
    });

    return NextResponse.json({ status: true, message: 'Inquiry sent successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('[Inquiry/simple-form]', err);
    return NextResponse.json(
      { status: false, message: err?.message || 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}
