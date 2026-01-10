const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Migrating Settings table...');

db.serialize(() => {
    // Table for App Configuration (SEO, etc.)
    db.run(`CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
    )`, (err) => {
        if (err) console.error("Error creating app_settings:", err);
        else console.log("Table app_settings created/ready.");
    });

    // Table for Daily Analytics (Simple)
    db.run(`CREATE TABLE IF NOT EXISTS analytics_daily (
        date TEXT PRIMARY KEY,
        visits INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        updated_at TEXT
    )`, (err) => {
        if (err) console.error("Error creating analytics_daily:", err);
        else console.log("Table analytics_daily created/ready.");
    });

    // Insert default SEO config if not exists
    const defaultSeo = JSON.stringify({
        title: 'Terminales Misiones - Horarios de Colectivos',
        description: 'Sistema integral para consultar horarios de colectivos en todas las terminales de ómnibus de la Provincia de Misiones, Argentina.',
        keywords: 'terminales, omnibus, colectivos, misiones, argentina, horarios, transporte',
        ogImage: '/og-image.jpg',
        favicon: '/favicon.ico',
        appleTouchIcon: '/apple-touch-icon.png',
        themeColor: '#2563EB',
        author: 'Terminales Misiones',
        siteUrl: 'https://terminales-misiones.lovable.app'
    });

    db.get("SELECT key FROM app_settings WHERE key = 'seo_config'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)",
                ['seo_config', defaultSeo, new Date().toISOString()]);
            console.log("Inserted default SEO config.");
        }
    });

});
