const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin_audit_logs table...');
  const createTableQuery = `
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
  `;

  await prisma.$executeRawUnsafe(createTableQuery);
  console.log('admin_audit_logs table created successfully!');

  const check = await prisma.$queryRawUnsafe('DESCRIBE admin_audit_logs');
  console.log('Table structure:', check);
}

main()
  .catch((e) => {
    console.error('Error creating audit table:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
