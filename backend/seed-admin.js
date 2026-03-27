require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
    const hash = await bcrypt.hash('admin123', 10);
    const res  = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id, name, email, role`,
        ['Admin', 'admin@campus.com', hash]
    );
    console.log('✅ Admin seeded:', res.rows[0]);
    process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
