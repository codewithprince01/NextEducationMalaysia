import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { verifyAccessToken } from '@/backend/utils/auth';

// ---------------------------------------------------------------------------
// Helper: resolve the requesting admin's role from JWT token or custom headers
// ---------------------------------------------------------------------------
async function resolveRequesterRole(req: NextRequest): Promise<string | null> {
  const headerId = req.headers.get('x-admin-user-id');
  const headerRole = req.headers.get('x-admin-user-role');

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

  // Fall back to JWT token
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

let tableEnsured = false;
async function ensureAuditTableExists() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_name VARCHAR(255) NULL,
        user_email VARCHAR(255) NULL,
        user_role VARCHAR(100) NULL,
        action VARCHAR(50) NOT NULL,
        module VARCHAR(100) NOT NULL,
        record_id VARCHAR(100) NULL,
        description TEXT NULL,
        old_values LONGTEXT NULL,
        new_values LONGTEXT NULL,
        diff_values LONGTEXT NULL,
        ip_address VARCHAR(100) NULL,
        user_agent TEXT NULL,
        browser VARCHAR(100) NULL,
        os VARCHAR(100) NULL,
        device VARCHAR(100) NULL,
        status VARCHAR(20) DEFAULT 'success',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_user (user_id),
        INDEX idx_audit_module (module),
        INDEX idx_audit_action (action),
        INDEX idx_audit_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableEnsured = true;
  } catch (e) {
    console.warn('[AuditLogs] Table ensure check:', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureAuditTableExists();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const moduleName = searchParams.get('module') || '';
    const userId = searchParams.get('user_id') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        '(user_name LIKE ? OR user_email LIKE ? OR description LIKE ? OR record_id LIKE ? OR ip_address LIKE ? OR module LIKE ?)'
      );
      params.push(q, q, q, q, q, q);
    }

    if (action.trim()) {
      conditions.push('action = ?');
      params.push(action.trim().toUpperCase());
    }

    if (moduleName.trim()) {
      conditions.push('module = ?');
      params.push(moduleName.trim().toLowerCase());
    }

    if (userId.trim()) {
      conditions.push('user_id = ?');
      params.push(parseInt(userId.trim(), 10));
    }

    if (startDate.trim()) {
      conditions.push('created_at >= ?');
      params.push(`${startDate.trim()} 00:00:00`);
    }

    if (endDate.trim()) {
      conditions.push('created_at <= ?');
      params.push(`${endDate.trim()} 23:59:59`);
    }

    const whereClause = conditions.join(' AND ');

    // Fetch total matching count
    const [countRes]: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as total FROM admin_audit_logs WHERE ${whereClause}`,
      ...params
    );
    const total = Number(countRes?.total || 0);

    // Fetch paginated logs
    const logs: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, user_id, user_name, user_email, user_role, action, module, record_id,
              description, old_values, new_values, diff_values, ip_address, user_agent,
              browser, os, device, status, created_at
       FROM admin_audit_logs
       WHERE ${whereClause}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    // Parse JSON fields safely
    const formattedLogs = logs.map((log) => {
      let parsedOld = null;
      let parsedNew = null;
      let parsedDiff = null;

      try { if (log.old_values) parsedOld = JSON.parse(log.old_values); } catch {}
      try { if (log.new_values) parsedNew = JSON.parse(log.new_values); } catch {}
      try { if (log.diff_values) parsedDiff = JSON.parse(log.diff_values); } catch {}

      return {
        ...log,
        old_values: parsedOld,
        new_values: parsedNew,
        diff_values: parsedDiff,
      };
    });

    // Summary Statistics for KPI counters
    const [statsRes]: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as create_count,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as update_count,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as delete_count,
        SUM(CASE WHEN action = 'VIEW' THEN 1 ELSE 0 END) as view_count,
        SUM(CASE WHEN action = 'LOGIN' THEN 1 ELSE 0 END) as login_count,
        COUNT(DISTINCT user_id) as active_admins,
        COUNT(DISTINCT module) as touched_modules
      FROM admin_audit_logs
    `);

    // Available modules
    const modulesRes: any[] = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT module FROM admin_audit_logs WHERE module IS NOT NULL AND module != '' ORDER BY module ASC
    `);
    const availableModules = modulesRes.map((m) => m.module);

    const stats = {
      total: Number(statsRes?.total_count || 0),
      create: Number(statsRes?.create_count || 0),
      update: Number(statsRes?.update_count || 0),
      delete: Number(statsRes?.delete_count || 0),
      view: Number(statsRes?.view_count || 0),
      login: Number(statsRes?.login_count || 0),
      activeAdmins: Number(statsRes?.active_admins || 0),
      touchedModules: Number(statsRes?.touched_modules || 0),
    };

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formattedLogs),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats,
      availableModules,
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch audit logs', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/audit-logs
export async function POST(req: NextRequest) {
  try {
    const { recordAuditLog } = await import('@/lib/auditLogger');
    const body = await req.json();
    const { action = 'VIEW', module: moduleName, recordId, description, oldValues, newValues, status } = body;

    if (!moduleName) {
      return NextResponse.json({ status: false, message: 'Module is required' }, { status: 400 });
    }

    await recordAuditLog({
      req,
      action,
      module: moduleName,
      recordId,
      description,
      oldValues,
      newValues,
      status: status || 'success',
    });

    return NextResponse.json({ status: true, message: 'Audit log recorded successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to record audit log', error: error.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/admin/audit-logs
// Super-admin (role = 'admin') only.
// Supports three modes via JSON body:
//   { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }  → date range
//   { "before": "YYYY-MM-DD" }                              → all before a date
//   { "deleteAll": true }                                   → wipe entire table
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    // --- Permission check ---
    const role = await resolveRequesterRole(req);
    if (role !== 'admin') {
      return NextResponse.json(
        { status: false, message: 'Forbidden: Only super-admins (admin role) can delete audit logs.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { startDate, endDate, before, deleteAll } = body as {
      startDate?: string;
      endDate?: string;
      before?: string;
      deleteAll?: boolean;
    };

    const conditions: string[] = [];
    const params: any[] = [];
    let modeDescription = '';

    if (deleteAll === true) {
      // Wipe entire table — no WHERE clause
      modeDescription = 'Deleted ALL audit log records';
    } else if (before?.trim()) {
      conditions.push('created_at < ?');
      params.push(`${before.trim()} 23:59:59`);
      modeDescription = `Deleted audit logs before ${before.trim()}`;
    } else if (startDate?.trim() || endDate?.trim()) {
      if (startDate?.trim()) {
        conditions.push('created_at >= ?');
        params.push(`${startDate.trim()} 00:00:00`);
      }
      if (endDate?.trim()) {
        conditions.push('created_at <= ?');
        params.push(`${endDate.trim()} 23:59:59`);
      }
      modeDescription = `Deleted audit logs from ${startDate || '*'} to ${endDate || '*'}`;
    } else {
      return NextResponse.json(
        {
          status: false,
          message: 'Provide at least one of: startDate, endDate, before, or deleteAll: true.',
        },
        { status: 400 }
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count before deleting so we can report the number
    const [countRes]: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as total FROM admin_audit_logs ${whereClause}`,
      ...params
    );
    const deletedCount = Number(countRes?.total || 0);

    if (deletedCount === 0) {
      return NextResponse.json({
        status: true,
        message: 'No audit log records matched the given criteria. Nothing deleted.',
        deletedCount: 0,
      });
    }

    // Execute deletion
    await prisma.$executeRawUnsafe(
      `DELETE FROM admin_audit_logs ${whereClause}`,
      ...params
    );

    // Record the bulk-delete action itself
    try {
      const { recordAuditLog } = await import('@/lib/auditLogger');
      await recordAuditLog({
        req,
        action: 'DELETE',
        module: 'audit-logs',
        description: `${modeDescription} — ${deletedCount} record(s) removed by super-admin`,
        newValues: { deletedCount, startDate, endDate, before, deleteAll },
      });
    } catch {}

    return NextResponse.json({
      status: true,
      message: `${deletedCount} audit log record(s) deleted successfully.`,
      deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting audit logs:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete audit logs.', error: error.message },
      { status: 500 }
    );
  }
}
