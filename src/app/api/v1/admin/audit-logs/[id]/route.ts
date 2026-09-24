import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { verifyAccessToken } from '@/backend/utils/auth';

// ---------------------------------------------------------------------------
// Helper: resolve the requesting admin's role from JWT token or custom headers
// ---------------------------------------------------------------------------
async function resolveRequesterRole(req: NextRequest): Promise<string | null> {
  // 1. Try x-admin-user-role header (injected by admin frontend)
  const headerRole = req.headers.get('x-admin-user-role');
  const headerId   = req.headers.get('x-admin-user-id');

  if (headerId) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        'SELECT role FROM users WHERE id = ? LIMIT 1',
        Number(headerId)
      );
      if (rows?.length > 0) return rows[0].role || null;
    } catch {}
  }

  if (headerRole) return headerRole;

  // 2. Try Bearer / cookie token
  try {
    let token: string | undefined;
    token = req.cookies.get('admin_access_token')?.value;
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const m = cookieHeader.match(/admin_access_token=([^;]+)/);
      if (m) token = m[1];
    }
    if (!token) {
      const auth = req.headers.get('authorization');
      if (auth?.startsWith('Bearer ')) token = auth.substring(7);
    }
    if (token) {
      let payload: any = null;
      try { payload = verifyAccessToken(token); } catch {
        try { payload = require('jsonwebtoken').decode(token); } catch {}
      }
      const userId = Number(payload?.sub || payload?.id || payload?.userId);
      if (userId) {
        const rows: any[] = await prisma.$queryRawUnsafe(
          'SELECT role FROM users WHERE id = ? LIMIT 1',
          userId
        );
        if (rows?.length > 0) return rows[0].role || null;
      }
    }
  } catch {}

  return null;
}

// ---------------------------------------------------------------------------
// GET /api/v1/admin/audit-logs/[id]
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM admin_audit_logs WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Audit record not found' }, { status: 404 });
    }

    const log = rows[0];
    let parsedOld = null;
    let parsedNew = null;
    let parsedDiff = null;

    try { if (log.old_values) parsedOld = JSON.parse(log.old_values); } catch {}
    try { if (log.new_values) parsedNew = JSON.parse(log.new_values); } catch {}
    try { if (log.diff_values) parsedDiff = JSON.parse(log.diff_values); } catch {}

    const formatted = {
      ...log,
      old_values: parsedOld,
      new_values: parsedNew,
      diff_values: parsedDiff,
    };

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching audit log detail:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch audit log detail', error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/admin/audit-logs/[id]
// Only role = 'admin' (super-admin) can delete a single audit log entry.
// ---------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // --- Permission check ---
    const role = await resolveRequesterRole(req);
    if (role !== 'admin') {
      return NextResponse.json(
        { status: false, message: 'Forbidden: Only super-admins (admin role) can delete audit logs.' },
        { status: 403 }
      );
    }

    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ status: false, message: 'Invalid audit log ID.' }, { status: 400 });
    }

    // --- Check it exists ---
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, module, action, description FROM admin_audit_logs WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Audit log record not found.' }, { status: 404 });
    }

    const target = rows[0];

    // --- Delete ---
    await prisma.$executeRawUnsafe(
      `DELETE FROM admin_audit_logs WHERE id = ?`,
      id
    );

    // --- Record deletion in audit trail ---
    try {
      const { recordAuditLog } = await import('@/lib/auditLogger');
      await recordAuditLog({
        req,
        action: 'DELETE',
        module: 'audit-logs',
        recordId: id,
        description: `Super-admin deleted audit log #${id} (module: ${target.module}, action: ${target.action})`,
        oldValues: { id: target.id, module: target.module, action: target.action, description: target.description },
      });
    } catch {}

    return NextResponse.json({
      status: true,
      message: `Audit log #${id} deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting audit log:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete audit log.', error: error.message },
      { status: 500 }
    );
  }
}

