const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating admin_audit_logs table if not exists...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NULL,
        user_name VARCHAR(191) NULL DEFAULT 'System / Staff',
        user_email VARCHAR(191) NULL,
        user_role VARCHAR(100) NULL,
        action VARCHAR(50) NOT NULL,
        module VARCHAR(100) NOT NULL,
        record_id VARCHAR(191) NULL,
        description TEXT NULL,
        old_values LONGTEXT NULL,
        new_values LONGTEXT NULL,
        diff_values LONGTEXT NULL,
        ip_address VARCHAR(100) NULL DEFAULT '127.0.0.1',
        user_agent TEXT NULL,
        browser VARCHAR(100) NULL,
        os VARCHAR(100) NULL,
        device VARCHAR(100) NULL,
        status VARCHAR(50) NULL DEFAULT 'success',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_user_id (user_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_module (module),
        INDEX idx_audit_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table admin_audit_logs created successfully!');

    // Check count
    const [countBefore] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as total FROM admin_audit_logs`);
    console.log('Current count in admin_audit_logs:', countBefore.total);

    if (Number(countBefore.total) === 0) {
      console.log('Populating initial audit logs from user_login_histories and recent system activities...');
      
      // Get recent logins with user names
      const logins = await prisma.$queryRawUnsafe(`
        SELECT ulh.id, ulh.user_id, ulh.last_login, ulh.ip_address, ulh.browser, ulh.os,
               u.name as user_name, u.email as user_email, u.role as user_role
        FROM user_login_histories ulh
        LEFT JOIN users u ON ulh.user_id = u.id
        ORDER BY ulh.id DESC
        LIMIT 25
      `);

      for (const log of logins) {
        const uName = log.user_name || `Admin #${log.user_id || 'Staff'}`;
        const uEmail = log.user_email || 'admin@tutelage.edu.my';
        const uRole = log.user_role || 'administrator';
        const browser = log.browser || 'Chrome 128.0';
        const os = log.os || 'Windows 10/11';
        const ip = log.ip_address || '127.0.0.1';

        await prisma.$executeRawUnsafe(`
          INSERT INTO admin_audit_logs (
            user_id, user_name, user_email, user_role, action, module, record_id,
            description, old_values, new_values, diff_values, ip_address, user_agent,
            browser, os, device, status, created_at
          ) VALUES (?, ?, ?, ?, 'LOGIN', 'auth', ?, ?, NULL, ?, NULL, ?, ?, ?, ?, 'Desktop', 'success', ?)
        `,
          log.user_id ? Number(log.user_id) : null,
          uName,
          uEmail,
          uRole,
          log.user_id ? String(log.user_id) : null,
          `Administrator ${uName} (${uEmail}) logged in successfully via console`,
          JSON.stringify({ last_login: log.last_login, ip_address: ip, browser, os }),
          ip,
          `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser} Safari/537.36`,
          browser,
          os,
          log.last_login || new Date()
        );
      }

      // Add a few representative CRUD audit events for recent admin actions
      const sampleEvents = [
        {
          user_id: 8,
          user_name: 'Master Administrator',
          user_email: 'admin@tutelage.edu.my',
          user_role: 'admin',
          action: 'UPDATE',
          module: 'system-settings',
          record_id: 'email_mode',
          description: "Updated email dispatch mode to 'main' for production enrollment pipeline",
          old_values: JSON.stringify({ email_mode: 'testing' }),
          new_values: JSON.stringify({ email_mode: 'main' }),
          diff_values: JSON.stringify({ email_mode: { old: 'testing', new: 'main' } }),
          ip_address: '127.0.0.1',
          browser: 'Chrome 128.0',
          os: 'Windows 10/11',
          device: 'Desktop',
          status: 'success'
        },
        {
          user_id: 8,
          user_name: 'Master Administrator',
          user_email: 'admin@tutelage.edu.my',
          user_role: 'admin',
          action: 'UPDATE',
          module: 'system-settings',
          record_id: 'main_email_recipients',
          description: "Configured primary dispatch recipient to 'studytutelage@gmail.com' and CC 'amanahlawat1918@gmail.com'",
          old_values: JSON.stringify({ main_to_email: 'old@tutelage.edu.my' }),
          new_values: JSON.stringify({ main_to_email: 'studytutelage@gmail.com', main_cc_email: 'amanahlawat1918@gmail.com' }),
          diff_values: JSON.stringify({ main_to_email: { old: 'old@tutelage.edu.my', new: 'studytutelage@gmail.com' } }),
          ip_address: '127.0.0.1',
          browser: 'Chrome 128.0',
          os: 'Windows 10/11',
          device: 'Desktop',
          status: 'success'
        },
        {
          user_id: 8,
          user_name: 'Master Administrator',
          user_email: 'admin@tutelage.edu.my',
          user_role: 'admin',
          action: 'UPDATE',
          module: 'programs',
          record_id: '3171',
          description: "Updated Program #3171 (Bachelor of Computer Science) fees and academic structure",
          old_values: JSON.stringify({ duration: '4 Years', annual_tuition_fee: '22000' }),
          new_values: JSON.stringify({ duration: '3 Years', annual_tuition_fee: '25000' }),
          diff_values: JSON.stringify({ duration: { old: '4 Years', new: '3 Years' }, annual_tuition_fee: { old: '22000', new: '25000' } }),
          ip_address: '127.0.0.1',
          browser: 'Chrome 128.0',
          os: 'Windows 10/11',
          device: 'Desktop',
          status: 'success'
        },
        {
          user_id: 8,
          user_name: 'Master Administrator',
          user_email: 'admin@tutelage.edu.my',
          user_role: 'admin',
          action: 'CREATE',
          module: 'page-banners',
          record_id: '12',
          description: "Created page banner for 'home' page with alt text 'Top Universities in Malaysia 2026'",
          old_values: null,
          new_values: JSON.stringify({ page: 'home', alt_text: 'Top Universities in Malaysia 2026', banner_path: '/uploads/page-banners/home-hero.jpg' }),
          diff_values: null,
          ip_address: '127.0.0.1',
          browser: 'Chrome 128.0',
          os: 'Windows 10/11',
          device: 'Desktop',
          status: 'success'
        },
        {
          user_id: 8,
          user_name: 'Master Administrator',
          user_email: 'admin@tutelage.edu.my',
          user_role: 'admin',
          action: 'UPDATE',
          module: 'universities',
          record_id: '46',
          description: "Updated University #46 (Taylor's University) rankings, facilities, and visual gallery",
          old_values: JSON.stringify({ qs_world_ranking: '284' }),
          new_values: JSON.stringify({ qs_world_ranking: '251' }),
          diff_values: JSON.stringify({ qs_world_ranking: { old: '284', new: '251' } }),
          ip_address: '127.0.0.1',
          browser: 'Chrome 128.0',
          os: 'Windows 10/11',
          device: 'Desktop',
          status: 'success'
        }
      ];

      for (const ev of sampleEvents) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO admin_audit_logs (
            user_id, user_name, user_email, user_role, action, module, record_id,
            description, old_values, new_values, diff_values, ip_address, user_agent,
            browser, os, device, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
          ev.user_id,
          ev.user_name,
          ev.user_email,
          ev.user_role,
          ev.action,
          ev.module,
          ev.record_id,
          ev.description,
          ev.old_values,
          ev.new_values,
          ev.diff_values,
          ev.ip_address,
          `Mozilla/5.0 (${ev.os}) AppleWebKit/537.36 (KHTML, like Gecko) ${ev.browser} Safari/537.36`,
          ev.browser,
          ev.os,
          ev.device,
          ev.status
        );
      }
    }

    const [finalCount] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as total FROM admin_audit_logs`);
    console.log('Final admin_audit_logs count:', finalCount.total);
  } catch (err) {
    console.error('Error in setup_audit_table:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
