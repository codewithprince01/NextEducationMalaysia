const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApiLogic() {
  try {
    const conditions = ['1=1'];
    const params = [];
    const whereClause = conditions.join(' AND ');

    const [countRes] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as total FROM admin_audit_logs WHERE ${whereClause}`,
      ...params
    );
    console.log('Count:', countRes);

    const logs = await prisma.$queryRawUnsafe(
      `SELECT id, user_id, user_name, user_email, user_role, action, module, record_id,
              description, old_values, new_values, diff_values, ip_address, user_agent,
              browser, os, device, status, created_at
       FROM admin_audit_logs
       WHERE ${whereClause}
       ORDER BY id DESC
       LIMIT 10 OFFSET 0`
    );
    console.log('Fetched logs count:', logs.length);
    console.log('First log:', logs[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testApiLogic();
