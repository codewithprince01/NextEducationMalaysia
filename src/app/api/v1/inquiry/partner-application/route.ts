import { NextRequest } from 'next/server'
import { withMiddleware, apiError, apiSuccess } from '@/backend'
import { prisma } from '@/lib/db-fresh'
import { sendLeadEmail } from '@/backend/email/send-lead-email'

export const POST = withMiddleware()(async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({} as any))

    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    const name = `${firstName} ${lastName}`.trim().slice(0, 100)
    const email = String(body.email || '').trim().slice(0, 190)
    const mobile = String(body.phone || '').trim().slice(0, 20)
    const countryCode = '91'
    const source = 'Education Malaysia - Partner Application'
    const sourcePath = '/become-a-partner'
    const website = process.env.SITE_VAR || 'MYS'

    if (!name || !email || !mobile) {
      return apiError('Name, email and phone are required', 400)
    }

    const payloadForMessage = {
      companyName: body.companyName || '',
      companyType: body.companyType || '',
      registrationNumber: body.registrationNumber || '',
      establishedYear: body.establishedYear || '',
      website: body.website || '',
      address: body.address || '',
      city: body.city || '',
      state: body.state || '',
      pincode: body.pincode || '',
      country: body.country || '',
      designation: body.designation || '',
      experience: body.experience || '',
      qualification: body.qualification || '',
      specialization: body.specialization || [],
      currentStudents: body.currentStudents || '',
      annualRevenue: body.annualRevenue || '',
      teamSize: body.teamSize || '',
      servicesOffered: body.servicesOffered || [],
      partnershipType: body.partnershipType || '',
      expectedStudents: body.expectedStudents || '',
      marketingBudget: body.marketingBudget || '',
      references: body.references || '',
      whyPartner: body.whyPartner || '',
      additionalInfo: body.additionalInfo || '',
      termsAccepted: !!body.termsAccepted,
      dataConsent: !!body.dataConsent,
    }

    await prisma.$queryRawUnsafe(
      `
      INSERT INTO leads
      (name, country_code, mobile, email, source, source_path, message, website, status, created_at, updated_at)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
      name,
      countryCode,
      mobile,
      email,
      source,
      sourcePath,
      JSON.stringify(payloadForMessage),
      website
    )

    await sendLeadEmail({
      name,
      email,
      phone: `${countryCode ? `+${countryCode} ` : ''}${mobile}`.trim(),
      nationality: String(body.country || body.nationality || 'India').trim(),
      university: String(body.companyName || '').trim() || null,
      message: String(body.additionalInfo || body.whyPartner || '').trim() || null,
      formType: 'Partner Application',
      sourceUrl: sourcePath,
      extraFields: {
        ...payloadForMessage,
        form_type: 'Partner Application',
        source_path: sourcePath,
      },
    })

    return apiSuccess(
      { submitted: true },
      'Application submitted successfully! We will contact you soon.',
      200
    )
  } catch (error: any) {
    return apiError(error?.message || 'Failed to submit application', 500)
  }
})
