require('dotenv').config();
const db = require('../src/config/database');

async function fixDatabase() {
    try {
        console.log('Starting DB Fix...');

        // System Config
        await db.query(`
      CREATE TABLE IF NOT EXISTS system_config (
          \`key\` VARCHAR(100) PRIMARY KEY,
          \`value\` TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('Created system_config table');

        // Reports
        await db.query(`
      CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          status ENUM('generating', 'ready', 'failed') DEFAULT 'generating',
          file_path VARCHAR(500),
          file_size VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Created reports table');

        // Support Tickets
        await db.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          user_id VARCHAR(36) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          description TEXT,
          status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
          priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'low',
          category VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Created support_tickets table');

        // Support Responses
        await db.query(`
      CREATE TABLE IF NOT EXISTS support_responses (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          ticket_id VARCHAR(36) NOT NULL,
          responder_id VARCHAR(36) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
          FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Created support_responses table');

        // SEED SUPPORT TICKET
        const adminId = (await db.query("SELECT id FROM users WHERE role='admin' LIMIT 1"))[0][0]?.id;
        if (adminId) {
            await db.query(`
         INSERT INTO support_tickets (id, user_id, subject, description, status, priority, category)
         VALUES (UUID(), ?, 'Cannot access reports', 'I am getting 500 error when accessing reports page.', 'open', 'urgent', 'technical')
       `, [adminId]);
            console.log('Seeded dummy support ticket');
        }

        // SEED CONFIG
        const configs = [
            { key: 'platformName', value: 'PGSM - Plateforme de Gestion des Stages Médicaux' },
            { key: 'supportEmail', value: 'support@pgsm.ma' },
            { key: 'defaultLanguage', value: 'fr' },
            { key: 'maintenanceMode', value: 'false' },
            { key: 'sessionTimeout', value: '60' },
            { key: 'maxLoginAttempts', value: '5' },
            { key: 'passwordMinLength', value: '8' },
            { key: 'requireEmailVerification', value: 'true' },
            { key: 'maxApplicationsPerStudent', value: '5' }
        ];

        for (const config of configs) {
            await db.query('INSERT IGNORE INTO system_config (`key`, `value`) VALUES (?, ?)', [config.key, config.value]);
        }
        console.log('Seeded configuration');

        console.log('Database fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Database fix failed:', error);
        process.exit(1);
    }
}

fixDatabase();
