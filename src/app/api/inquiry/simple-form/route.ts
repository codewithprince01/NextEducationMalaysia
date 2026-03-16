import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const name = body.get('name') as string
    const email = body.get('email') as string
    const mobile = body.get('mobile') as string
    const nationality = body.get('nationality') as string
    const source = body.get('source') as string
    const source_path = body.get('source_path') as string

    if (!name || !email || !mobile) {
      return NextResponse.json({ status: false, message: 'Missing required fields' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: `"Education Malaysia" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Simple Inquiry from ${name}`,
      html: `
        <h3>New Inquiry / Review Submission</h3>
        <table>
          <tr><td><b>Name</b></td><td>${name}</td></tr>
          <tr><td><b>Email</b></td><td>${email}</td></tr>
          <tr><td><b>Mobile</b></td><td>${mobile}</td></tr>
          <tr><td><b>Nationality</b></td><td>${nationality || 'N/A'}</td></tr>
          <tr><td><b>Source</b></td><td>${source || 'N/A'}</td></tr>
          <tr><td><b>Source Path</b></td><td>${source_path || 'N/A'}</td></tr>
        </table>
      `,
    })

    return NextResponse.json({ status: true, message: 'Inquiry sent successfully' })
  } catch (err) {
    console.error('[Inquiry/simple-form]', err)
    return NextResponse.json({ status: false, message: 'Failed to send inquiry' }, { status: 500 })
  }
}
