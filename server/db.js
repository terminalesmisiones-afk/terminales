const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
console.log('DB PATH:', dbPath);
const db = new sqlite3.Database(dbPath);

const SALT_ROUNDS = 10;

db.serialize(() => {
  console.log('Initializing database...');

  // Terminals Table
  db.run(`CREATE TABLE IF NOT EXISTS terminals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    image TEXT,
    phone TEXT,
    email TEXT,
    description TEXT,
    municipality_info TEXT,
    long_content TEXT, -- HTML Content for "City Page"
    latitude REAL,
    longitude REAL,
    is_active INTEGER DEFAULT 1,
    schedules_visible INTEGER DEFAULT 1,
    company_count INTEGER DEFAULT 0,
    google_sheet_url TEXT,
    last_updated TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);

  // Schedules Table
  db.run(`CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    terminal_id TEXT NOT NULL,
    company TEXT NOT NULL,
    destination TEXT NOT NULL,
    remarks TEXT, -- Turno (Mañana, Tarde, Noche)
    departure_mon_fri TEXT,
    departure_sat TEXT,
    departure_sun TEXT,
    platform TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY(terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
  )`);

  // Notifications Table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    user_id TEXT,
    target_role TEXT DEFAULT 'all',
    created_at TEXT,
    updated_at TEXT
  )`);

  // Banners Table
  db.run(`CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    html_code TEXT,
    upload_type TEXT DEFAULT 'url',
    position TEXT,
    terminal_id TEXT,
    device_type TEXT DEFAULT 'all',
    show_on_mobile INTEGER DEFAULT 1,
    show_on_tablet INTEGER DEFAULT 1,
    show_on_desktop INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`);

  // Companies Table
  db.run(`CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    description TEXT,
    ticket_offices TEXT,
    is_active INTEGER DEFAULT 1,
    last_updated TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);

  // Users Table (Local Auth)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    terminals TEXT, -- JSON array or comma separated list of terminal IDs
    last_login TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);

  // Search Logs Table
  db.run(`CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT,
    category TEXT, -- 'terminal', 'city', 'company', 'unknown'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
  )`);

  // App Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT
  )`);

  // Pages Table (CMS)
  db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    featured_image TEXT,
    content TEXT,
    is_published INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

  // Seed Admin User
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin'; // Change this for production logic if needed, but fine for local tool

  db.get("SELECT id FROM users WHERE email = ?", [adminEmail], async (err, row) => {
    if (err) {
      console.error("Error creating admin user:", err);
      return;
    }
    if (!row) {
      const hash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      const id = 'user-' + Date.now();
      const now = new Date().toISOString();
      db.run("INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
        [id, adminEmail, hash, 'admin', now], (err) => {
          if (err) console.error("Error inserting admin:", err);
          else console.log("Admin user created: admin@example.com / admin");
        });
    }
  });

  // Users Table (Local Authentication)
  /* db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    terminal_id TEXT,
    city TEXT,
    position TEXT,
    company_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY(terminal_id) REFERENCES terminals(id) ON DELETE SET NULL
  )`); */

  // User Registrations Table (Pending Approval)
  db.run(`CREATE TABLE IF NOT EXISTS user_registrations (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    terminal_name TEXT,
    city TEXT,
    position TEXT,
    company_name TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by TEXT,
    approved_at TEXT,
    rejected_reason TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);

  // Support Messages Table (Chat interno)
  db.run(`CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Schema Correction for 'users' table (Auto-Migration)
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (!err && columns) {
      const hasName = columns.some(c => c.name === 'name');
      const hasFullName = columns.some(c => c.name === 'full_name');

      if (!hasName && hasFullName) {
        console.log('Detected incorrect Users schema (missing "name"). Migrating...');
        db.serialize(() => {
          db.run("ALTER TABLE users RENAME TO users_legacy_backup");
          db.run(`CREATE TABLE users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'active',
            terminals TEXT,
            last_login TEXT,
            created_at TEXT,
            updated_at TEXT
          )`);
          // Migrate Data: name <- full_name
          db.run(`INSERT OR IGNORE INTO users (id, email, password_hash, role, name, created_at, updated_at)
                  SELECT id, email, password_hash, role, full_name, created_at, updated_at FROM users_legacy_backup`, (err) => {
            if (err) console.error("Migration Copy Error:", err);
            else console.log("Users schema fixed and data migrated.");
          });
        });
      }
    }
  });

  console.log('Database tables initialized.');
});

module.exports = db;
