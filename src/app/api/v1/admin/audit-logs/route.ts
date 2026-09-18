import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(req: NextRequest) {
  try {
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
      params.push(new Date(startDate.trim()));
    }

    if (endDate.trim()) {
      conditions.push('created_at <= ?');
      params.push(new Date(endDate.trim() + ' 23:59:59'));
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
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch audit logs', error: error.message },
      { status: 500 }
    );
  }
}
