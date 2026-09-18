const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing audit log insertion and retrieval...');
  
  // Insert sample test log
  const diffSample = JSON.stringify({
    name: { old: 'Monash Univ', new: 'Monash University Malaysia' },
    status: { old: 0, new: 1 },
    qs_rank: { old: '50', new: '42' }
  });

  const oldValues = JSON.stringify({ name: 'Monash Univ', status: 0, qs_rank: '50' });
  const newValues = JSON.stringify({ name: 'Monash University Malaysia', status: 1, qs_rank: '42' });

  await prisma.$executeRawUnsafe(
    `INSERT INTO admin_audit_logs (
      user_id, user_name, user_email, user_role, action, module, record_id,
      description, old_values, new_values, diff_values, ip_address, user_agent,
      browser, os, device, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    1,
    'Super Administrator',
    'admin@educationmalaysia.in',
    'super-admin',
    'UPDATE',
    'universities',
    '120',
    "Updated university details for 'Monash University Malaysia'",
    oldValues,
    newValues,
    diffSample,
    '103.21.244.2',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
    'Chrome 128',
    'Windows 10/11',
    'Desktop',
    'success'
  );

  console.log('Sample audit log created successfully!');

  const logs = await prisma.$queryRawUnsafe('SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 1');
  console.log('Fetched sample log:', logs);
}

main()
  .catch((e) => {
    console.error('Audit test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
