require('dotenv').config(); // Load environment variables
const express = require('express'); // Force restart
const cors = require('cors');
const helmet = require('helmet'); // Security Headers
const rateLimit = require('express-rate-limit'); // Brute Force Protection
const bodyParser = require('body-parser');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const crypto = require('crypto');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// ... (Existing parseCSV helper - no changes to lines 15-52) ... (Wait, replace takes start/end, so I should be careful not to delete helper)

const app = express();
const port = process.env.PORT || 3005; // Use ENV port
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_DO_NOT_USE_IN_PROD';

// 1. Security Headers (Helmet)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving images/uploads
}));

// 2. Rate Limiting (Global - Basic DOS protection)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(globalLimiter);

// 3. Rate Limiting (Login - Brute Force protection)
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: 'Demasiados intentos de inicio de sesión. Por favor intente nuevamente en 1 hora.'
});

app.use(cors());
app.use(bodyParser.json());

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Setup Uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + path.extname(file.originalname)) // Preserve extension safely
    }
});

// 4. Secure Uploads (File Type & Size Validation)
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, gif)!'));
        }
    }
});

// Upload Endpoint
app.post('/api/upload', (req, res) => { // Wrapped to handle multer errors
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    });
});

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Ping Endpoint
app.get('/api/ping', (req, res) => {
    console.log('[PING] Ping received');
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// DEBUG: Route Lister
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // routes registered directly on the app
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') { // router middleware 
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json({
        routes,
        env: process.env.NODE_ENV,
        db_path: db.filename
    });
});

// Public SEO Settings
app.get('/api/seo', (req, res) => {
    db.get("SELECT value FROM app_settings WHERE key = 'seo'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({}); // Return empty object if not set
        try {
            res.json(JSON.parse(row.value));
        } catch (e) {
            res.json({});
        }
    });
});

// --- Routes ---

// Helper for recaptcha
async function verifyRecaptcha(token) {
    if (!token) {
        // En desarrollo permitimos sin token si no se ha configurado frontend
        if (process.env.NODE_ENV === 'development') return true;
        return false;
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey || secretKey.includes('INSERT')) {
        console.warn('RECAPTCHA_SECRET_KEY missing or invalid. Skipping verification.');
        return true; // Fail open if misconfigured to avoid blocking legitimate logins during setup
    }

    try {
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const params = new URLSearchParams();
        params.append('secret', secretKey);
        params.append('response', token);

        const response = await axios.post(verifyUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { success, score, 'error-codes': errorCodes } = response.data;

        // Log result for debugging
        console.log(`[RECAPTCHA] Verification result: Success=${success}, Score=${score}, Errors=${JSON.stringify(errorCodes)}`);

        // v3 returns a score (0.0 - 1.0). 0.5 is a good default threshold.
        if (success && (score === undefined || score >= 0.5)) {
            return true;
        } else {
            console.warn(`[RECAPTCHA] Failed. Success: ${success}, Score: ${score}`);
            return false;
        }
    } catch (error) {
        console.error('[RECAPTCHA] Verification request error:', error.message);
        return false;
    }
}

// ... Routes ...

// Login with Rate Limiter
app.post('/api/login', loginLimiter, async (req, res) => {
    const { email, password, captchaToken } = req.body;

    // Verify Captcha
    // Verify Captcha
    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
        return res.status(400).json({ error: 'Verificación de seguridad fallida (reCAPTCHA). Por favor recarga e intenta de nuevo.' });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' }); // Generic message

        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, terminals: user.terminals }, SECRET_KEY, { expiresIn: '24h' });
            // Update last_login
            db.run("UPDATE users SET last_login = ? WHERE id = ?", [new Date().toISOString(), user.id]);
            res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, terminals: user.terminals } });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' }); // Generic message
        }
    });
});

// Get Terminals (Public)
app.get('/api/terminals', (req, res) => {
    db.all("SELECT * FROM terminals WHERE is_active = 1", [], (err, terminals) => {
        if (err) return res.status(500).json({ error: err.message });

        // For each terminal, get schedules
        const promises = terminals.map(terminal => {
            return new Promise((resolve, reject) => {
                db.all("SELECT * FROM schedules WHERE terminal_id = ?", [terminal.id], (err, schedules) => {
                    if (err) reject(err);
                    else {
                        terminal.schedules = schedules;
                        resolve(terminal);
                    }
                });
            });
        });

        Promise.all(promises).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }));
    });
});

// Get Single Terminal (Public)
app.get('/api/terminals/:id', (req, res) => {
    const { id } = req.params;

    // Increment visits
    db.run("UPDATE terminals SET visits = COALESCE(visits, 0) + 1 WHERE id = ?", [id], (err) => {
        if (err) console.error("Error incrementing visits:", err);
    });

    db.get("SELECT * FROM terminals WHERE id = ?", [id], (err, terminal) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!terminal) return res.status(404).json({ error: 'Terminal not found' });

        db.all("SELECT * FROM schedules WHERE terminal_id = ?", [id], (err, schedules) => {
            if (err) return res.status(500).json({ error: err.message });
            terminal.schedules = schedules || [];
            res.json(terminal);
        });
    });
});

// Admin: Create Terminal
app.post('/api/terminals', authenticateToken, (req, res) => {
    const { name, city, address, phone, description, latitude, longitude, image, municipality_info, is_active, schedules_visible, google_sheet_url } = req.body;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.run(`INSERT INTO terminals (id, name, city, address, phone, description, municipality_info, long_content, latitude, longitude, image, is_active, schedules_visible, google_sheet_url, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, city, address, phone, description, municipality_info, req.body.long_content || '', latitude, longitude, image, is_active ? 1 : 0, schedules_visible ? 1 : 0, google_sheet_url, now, now],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, message: 'Terminal created' });
        }
    );
});

// Admin: Get Terminals (with role-based filtering)
app.get('/api/admin/terminals', authenticateToken, async (req, res) => {
    try {
        const { role, terminals: userTerminal } = req.user;

        console.log('📋 Get Terminals Request');
        console.log('   User Role:', role);
        console.log('   User Terminal:', userTerminal);

        if (role === 'admin') {
            // Super admin sees all terminals
            db.all("SELECT * FROM terminals WHERE is_active = 1", [], (err, terminals) => {
                if (err) return res.status(500).json({ error: err.message });

                const promises = terminals.map(terminal => {
                    return new Promise((resolve, reject) => {
                        db.all("SELECT * FROM schedules WHERE terminal_id = ?", [terminal.id], (err, schedules) => {
                            if (err) reject(err);
                            else {
                                terminal.schedules = schedules;
                                resolve(terminal);
                            }
                        });
                    });
                });

                Promise.all(promises)
                    .then(data => {
                        console.log('   ✅ Returned', data.length, 'terminals (admin)');
                        res.json(data);
                    })
                    .catch(err => res.status(500).json({ error: err.message }));
            });
        } else {
            // Regular user sees only their assigned terminal
            if (!userTerminal) {
                console.log('   ⚠️  User has no terminal assigned');
                return res.json([]);
            }

            db.get("SELECT * FROM terminals WHERE name = ? AND is_active = 1", [userTerminal], (err, terminal) => {
                if (err) return res.status(500).json({ error: err.message });

                if (!terminal) {
                    console.log('   ⚠️  Terminal not found:', userTerminal);
                    return res.json([]);
                }

                db.all("SELECT * FROM schedules WHERE terminal_id = ?", [terminal.id], (err, schedules) => {
                    if (err) return res.status(500).json({ error: err.message });

                    terminal.schedules = schedules;
                    console.log('   ✅ Returned 1 terminal (user):', terminal.name);
                    res.json([terminal]);
                });
            });
        }
    } catch (error) {
        console.error('❌ Error in /api/admin/terminals:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update Terminal
app.put('/api/terminals/:id', authenticateToken, (req, res) => {
    const { name, city, address, phone, image, description, municipality_info, latitude, longitude, is_active, schedules_visible, google_sheet_url, schedules } = req.body;
    const now = new Date().toISOString();
    const terminalId = req.params.id;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Update Terminal Info
        db.run(`UPDATE terminals SET name = ?, city = ?, address = ?, phone = ?, image = ?, description = ?, municipality_info = ?, long_content = ?, latitude = ?, longitude = ?, is_active = ?, schedules_visible = ?, google_sheet_url = ?, updated_at = ? WHERE id = ?`,
            [name, city, address, phone, image, description, municipality_info, req.body.long_content || '', latitude, longitude, is_active ? 1 : 0, schedules_visible ? 1 : 0, google_sheet_url, now, terminalId],
            function (err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }

                // 2. Update Schedules (if provided)
                if (schedules && Array.isArray(schedules)) {
                    console.log(`[DEBUG] Updating schedules for terminal ${terminalId}. Count: ${schedules.length}`);
                    console.log(`[DEBUG] First schedule sample:`, schedules[0]);

                    // Delete existing schedules
                    db.run("DELETE FROM schedules WHERE terminal_id = ?", [terminalId], (err) => {
                        if (err) {
                            console.error('[ERROR] Delete schedules failed:', err);
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: err.message });
                        }

                        // Insert new schedules
                        const stmt = db.prepare(`INSERT INTO schedules (id, terminal_id, company, destination, remarks, departure_mon_fri, departure_sat, departure_sun, platform, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

                        schedules.forEach(schedule => {
                            stmt.run(
                                crypto.randomUUID(), // New ID for schedule
                                terminalId,
                                schedule.company,
                                schedule.destination,
                                schedule.remarks || '', // Turno
                                schedule.departure_mon_fri || '',
                                schedule.departure_sat || '',
                                schedule.departure_sun || '',
                                schedule.platform || '',
                                now,
                                now
                            );
                        });

                        stmt.finalize((err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: err.message });
                            }

                            db.run("COMMIT");
                            res.json({ message: 'Terminal and schedules updated' });
                        });
                    });
                } else {
                    db.run("COMMIT");
                    res.json({ message: 'Terminal updated (no schedules provided)' });
                }
            }
        );
    });
});

// Admin: Delete Terminal
app.delete('/api/terminals/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM terminals WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Terminal deleted' });
    });
});

// Admin: Sync Terminal Schedules from Saved URL
app.post('/api/terminals/:id/sync', authenticateToken, (req, res) => {
    const terminalId = req.params.id;

    db.get("SELECT google_sheet_url FROM terminals WHERE id = ?", [terminalId], async (err, terminal) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!terminal || !terminal.google_sheet_url) {
            return res.status(400).json({ error: 'No Google Sheet URL configured for this terminal.' });
        }

        try {
            console.log(`[SYNC] Fetching CSV for terminal ${terminalId} from ${terminal.google_sheet_url}`);

            // Adjust URL for Google Sheets export if needed
            let fetchUrl = terminal.google_sheet_url;
            if (fetchUrl.includes('docs.google.com/spreadsheets')) {
                fetchUrl = fetchUrl.replace(/\/edit.*$/, '/export?format=csv');
            }

            const response = await axios.get(fetchUrl);
            const schedules = parseCSV(response.data);
            const now = new Date().toISOString();

            console.log(`[SYNC] Parsed ${schedules.length} schedules.`);

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // Delete old schedules
                db.run("DELETE FROM schedules WHERE terminal_id = ?", [terminalId], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: 'Failed to clear old schedules: ' + err.message });
                    }

                    // Insert new schedules
                    const stmt = db.prepare(`INSERT INTO schedules (id, terminal_id, company, destination, remarks, departure_mon_fri, departure_sat, departure_sun, platform, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

                    schedules.forEach(schedule => {
                        stmt.run(
                            crypto.randomUUID(),
                            terminalId,
                            schedule.company,
                            schedule.destination,
                            schedule.remarks,
                            schedule.departure_mon_fri,
                            schedule.departure_sat,
                            schedule.departure_sun,
                            schedule.platform,
                            now,
                            now
                        );
                    });

                    stmt.finalize((err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: 'Failed to insert schedules: ' + err.message });
                        }

                        // Update terminal timestamp
                        db.run("UPDATE terminals SET updated_at = ? WHERE id = ?", [now, terminalId], (err) => {
                            if (err) console.error("Error updating terminal timestamp", err);
                            db.run("COMMIT");
                            res.json({ message: `Successfully synced ${schedules.length} schedules.`, count: schedules.length });
                        });
                    });
                });
            });

        } catch (error) {
            console.error('[SYNC] Error:', error.message);
            res.status(500).json({ error: 'Sync failed: ' + error.message });
        }
    });
});




// --- Companies Routes ---

// Get Companies (Public)
app.get('/api/companies', (req, res) => {
    db.all("SELECT * FROM companies WHERE is_active = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: Get All Companies
app.get('/api/admin/companies', authenticateToken, (req, res) => {
    db.all("SELECT * FROM companies", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: Create Company
app.post('/api/companies', authenticateToken, (req, res) => {
    const { name, logo, phone, whatsapp, email, address, website, description, ticketOffices, isActive } = req.body;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.run(`INSERT INTO companies (id, name, logo, phone, whatsapp, email, address, website, description, ticket_offices, is_active, last_updated, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, logo, phone, whatsapp, email, address, website, description, ticketOffices, isActive ? 1 : 0, now, now, now],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, message: 'Company created' });
        }
    );
});

// Admin: Update Company
app.put('/api/companies/:id', authenticateToken, (req, res) => {
    const { name, logo, phone, whatsapp, email, address, website, description, ticketOffices, isActive } = req.body;
    const now = new Date().toISOString();

    db.run(`UPDATE companies SET name = ?, logo = ?, phone = ?, whatsapp = ?, email = ?, address = ?, website = ?, description = ?, ticket_offices = ?, is_active = ?, last_updated = ?, updated_at = ? WHERE id = ?`,
        [name, logo, phone, whatsapp, email, address, website, description, ticketOffices, isActive ? 1 : 0, now, now, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Company updated' });
        }
    );
});

// Admin: Delete Company
app.delete('/api/companies/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM companies WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Company deleted' });
    });
});

// Sync Terminals from CSV (Google Sheets)
app.post('/api/sync/terminals', authenticateToken, async (req, res) => {
    const { csvUrl } = req.body;

    if (!csvUrl) {
        return res.status(400).json({ error: 'CSV URL is required' });
    }

    try {
        const response = await axios.get(csvUrl);
        const csvData = response.data;

        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        if (records.length === 0) {
            return res.status(400).json({ error: 'No records found in CSV' });
        }

        const stmt = db.prepare(`INSERT OR REPLACE INTO terminals (id, name, city, address, phone, description, latitude, longitude, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        let updatedCount = 0;
        const now = new Date().toISOString();

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            records.forEach(record => {
                // Try to find existing terminal by Name to keep ID, otherwise generate new
                // Since we don't have name as unique index, we might just generate UUIDs or rely on client provided ID if it existed.
                // For this simple sync, let's look up by name:
                db.get("SELECT id FROM terminals WHERE name = ?", [record.name], (err, row) => {
                    let id = row ? row.id : crypto.randomUUID();
                    let isActive = record.is_active === '1' || record.is_active === 'TRUE' ? 1 : 0;

                    stmt.run(
                        id,
                        record.name,
                        record.city,
                        record.address,
                        record.phone,
                        record.description,
                        parseFloat(record.latitude) || 0,
                        parseFloat(record.longitude) || 0,
                        isActive,
                        now,
                        now
                    );
                });
                updatedCount++;
            });

            db.run("COMMIT");
            stmt.finalize();
        });

        res.json({ message: `Sync started for ${records.length} records. Check logs for details.` });

    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Failed to sync CSV: ' + error.message });
    }
});

// --- Banners Routes ---

// Admin: Get All Banners
app.get('/api/admin/banners', authenticateToken, (req, res) => {
    db.all("SELECT * FROM banners ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Public: Get Active Banners
app.get('/api/banners', (req, res) => {
    db.all("SELECT * FROM banners WHERE is_active = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: Create Banner
app.post('/api/banners', authenticateToken, (req, res) => {
    const { title, imageUrl, linkUrl, htmlCode, uploadType, position, terminal, deviceType, showOnMobile, showOnTablet, showOnDesktop, isActive, startDate, endDate } = req.body;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.run(`INSERT INTO banners (id, title, image_url, link_url, html_code, upload_type, position, terminal_id, device_type, show_on_mobile, show_on_tablet, show_on_desktop, is_active, start_date, end_date, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, title, imageUrl, linkUrl, htmlCode, uploadType, position, terminal, deviceType, showOnMobile ? 1 : 0, showOnTablet ? 1 : 0, showOnDesktop ? 1 : 0, isActive ? 1 : 0, startDate, endDate, now, now],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, message: 'Banner created' });
        }
    );
});

// Admin: Update Banner
app.put('/api/banners/:id', authenticateToken, (req, res) => {
    const { title, imageUrl, linkUrl, htmlCode, uploadType, position, terminal, deviceType, showOnMobile, showOnTablet, showOnDesktop, isActive, startDate, endDate } = req.body;
    const now = new Date().toISOString();

    db.run(`UPDATE banners SET title = ?, image_url = ?, link_url = ?, html_code = ?, upload_type = ?, position = ?, terminal_id = ?, device_type = ?, show_on_mobile = ?, show_on_tablet = ?, show_on_desktop = ?, is_active = ?, start_date = ?, end_date = ?, updated_at = ? WHERE id = ?`,
        [title, imageUrl, linkUrl, htmlCode, uploadType, position, terminal, deviceType, showOnMobile ? 1 : 0, showOnTablet ? 1 : 0, showOnDesktop ? 1 : 0, isActive ? 1 : 0, startDate, endDate, now, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Banner updated' });
        }
    );
});

// Admin: Delete Banner
app.delete('/api/banners/:id', authenticateToken, (req, res) => {
    console.log(`[DELETE] Request to delete banner ID: ${req.params.id}`);
    db.run("DELETE FROM banners WHERE id = ?", [req.params.id], function (err) {
        if (err) {
            console.error(`[DELETE] Error deleting banner ${req.params.id}:`, err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[DELETE] Deleted ${this.changes} rows for banner ID: ${req.params.id}`);
        if (this.changes === 0) {
            console.warn(`[DELETE] WARNING: ID ${req.params.id} not found or not deleted.`);
        }
        res.json({ message: 'Banner deleted' });
    });
});

// --- User Routes ---

// Admin: Get All Users
app.get('/api/admin/users', authenticateToken, (req, res) => {
    console.log('=== GET USERS REQUEST ===');
    db.all("SELECT id, name, email, role, status, terminals, permissions, last_login, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            console.error('=== DB ERROR IN GET USERS ===');
            console.error('Error:', err);
            return res.status(500).json({ error: err.message });
        }

        console.log('Rows fetched:', rows.length);

        try {
            const users = rows.map(user => ({
                ...user,
                // terminals is a simple string field, not JSON
                permissions: user.permissions ? JSON.parse(user.permissions) : []
            }));

            console.log('Users processed successfully');
            res.json(users);
        } catch (error) {
            console.error('=== ERROR PROCESSING USERS ===');
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

// Admin: Debug endpoint para verificar información del servidor
app.get('/api/admin/debug/server-info', authenticateToken, (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: process.uptime(),
        nodeVersion: process.version,
        cwd: process.cwd(),
        memoryUsage: process.memoryUsage()
    });
});

// Admin: Create User
app.post('/api/admin/users', authenticateToken, async (req, res) => {
    const { name, email, password, role, status, terminals, permissions } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const id = 'user-' + Date.now();
        const now = new Date().toISOString();
        const terminalsJson = JSON.stringify(terminals || []);
        const permissionsJson = JSON.stringify(permissions || []);

        db.run(`INSERT INTO users (id, name, email, password_hash, role, status, terminals, permissions, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, hashedPassword, role, status || 'active', terminalsJson, permissionsJson, now, now],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.json({ id, message: 'User created' });
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update User
app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
    const { name, email, password, role, status, terminals, permissions } = req.body;
    const now = new Date().toISOString();
    const terminalsJson = JSON.stringify(terminals || []);
    const permissionsJson = JSON.stringify(permissions || []);

    try {
        let sql = `UPDATE users SET name = ?, email = ?, role = ?, status = ?, terminals = ?, permissions = ?, updated_at = ?`;
        let params = [name, email, role, status, terminalsJson, permissionsJson, now];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            sql += `, password_hash = ?`;
            params.push(hashedPassword);
        }

        sql += ` WHERE id = ?`;
        params.push(req.params.id);

        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete User
app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

// Admin: Settings API
app.get('/api/admin/settings/:key', authenticateToken, (req, res) => {
    const { key } = req.params;
    db.get("SELECT value FROM app_settings WHERE key = ?", [key], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Setting not found' });
        try {
            res.json(JSON.parse(row.value));
        } catch (e) {
            res.json({ value: row.value });
        }
    });
});

app.post('/api/admin/settings/:key', authenticateToken, (req, res) => {
    const { key } = req.params;
    const value = JSON.stringify(req.body);
    const now = new Date().toISOString();

    db.run(`INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
        [key, value, now, value, now],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Setting saved' });
        }
    );
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const getCount = (table, where = '') => {
            return new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM ${table} ${where}`, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.count : 0);
                });
            });
        };

        const getTopTerminals = () => {
            return new Promise((resolve, reject) => {
                db.all("SELECT id, name, visits FROM terminals ORDER BY visits DESC LIMIT 4", [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
        };

        const getRecentActivity = () => {
            return new Promise((resolve, reject) => {
                // Get recently updated terminals and users
                db.all("SELECT name, updated_at, 'Terminal actualizada' as action FROM terminals ORDER BY updated_at DESC LIMIT 3", [], (err, terminals) => {
                    if (err) return reject(err);
                    db.all("SELECT name, created_at as updated_at, 'Usuario registrado' as action FROM users ORDER BY created_at DESC LIMIT 3", [], (err, users) => {
                        if (err) return reject(err);
                        const combined = [...(terminals || []), ...(users || [])]
                            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                            .slice(0, 4);
                        resolve(combined);
                    });
                });
            });
        };

        const [terminalsCount, usersCount, companiesCount, bannersCount, topTerminals, recentActivity] = await Promise.all([
            getCount('terminals'),
            getCount('users', "WHERE status = 'active'"),
            getCount('companies'),
            getCount('banners', "WHERE is_active = 1"),
            getTopTerminals(),
            getRecentActivity()
        ]);

        res.json({
            terminals: terminalsCount,
            users: usersCount,
            companies: companiesCount,
            banners: bannersCount,
            topTerminals,
            recentActivity
        });

    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Search Analytics Routes ---

// Log Search
app.post('/api/analytics/search', (req, res) => {
    const { query, category } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!query) return res.status(400).json({ error: 'Query required' });

    db.run("INSERT INTO search_logs (query, category, ip_address) VALUES (?, ?, ?)",
        [query, category || 'unknown', ip],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Search logged' });
        });
});

// --- PAGES API (CMS) ---

app.get('/api/pages', authenticateToken, (req, res) => {
    db.all("SELECT * FROM pages ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/pages/public/:slug', (req, res) => {
    const { slug } = req.params;
    db.get("SELECT * FROM pages WHERE slug = ? AND is_published = 1", [slug], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Page not found' });
        res.json(row);
    });
});

// CREATE PAGE
app.post('/api/pages', authenticateToken, (req, res) => {
    const { title, slug, featured_image, content, is_published } = req.body;
    const finalSlug = slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    db.run(
        'INSERT INTO pages (title, slug, featured_image, content, is_published, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
        [title, finalSlug, featured_image, content, is_published ? 1 : 0],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, slug: finalSlug });
        }
    );
});

// UPDATE PAGE
app.put('/api/pages/:id', authenticateToken, (req, res) => {
    const { title, slug, featured_image, content, is_published } = req.body;
    db.run(
        'UPDATE pages SET title = ?, slug = ?, featured_image = ?, content = ?, is_published = ?, updated_at = datetime("now") WHERE id = ?',
        [title, slug, featured_image, content, is_published ? 1 : 0, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/pages/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM pages WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Page deleted' });
    });
});

// Get Search Stats
app.get('/api/analytics/search-stats', authenticateToken, (req, res) => {
    const stats = {};

    // Top Queries
    const p1 = new Promise((resolve, reject) => {
        db.all("SELECT query, COUNT(*) as count FROM search_logs GROUP BY query ORDER BY count DESC LIMIT 10", [], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });

    // Top Categories
    const p2 = new Promise((resolve, reject) => {
        db.all("SELECT category, COUNT(*) as count FROM search_logs GROUP BY category ORDER BY count DESC", [], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });

    // Last 24h count
    const p3 = new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM search_logs WHERE timestamp > datetime('now', '-1 day')", [], (err, row) => {
            if (err) reject(err); else resolve(row ? row.count : 0);
        });
    });

    Promise.all([p1, p2, p3])
        .then(([topQueries, topCategories, last24h]) => {
            res.json({ topQueries, topCategories, last24h });
        })
        .catch(err => {
            console.error('Analytics Stats Error:', err);
            res.status(500).json({ error: err.message });
        });
});

// --- MercadoPago Routes ---
const { MercadoPagoConfig, Preference } = require('mercadopago');

app.post('/api/payment/create-preference', async (req, res) => {
    try {
        const { title, price, quantity } = req.body;

        // 1. Get Access Token from Settings
        const settingsRow = await new Promise((resolve, reject) => {
            db.get("SELECT value FROM app_settings WHERE key = 'mercadopago_config'", [], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!settingsRow) return res.status(500).json({ error: 'MercadoPago not configured in Admin' });
        const config = JSON.parse(settingsRow.value);

        if (!config.accessToken) return res.status(500).json({ error: 'Access Token missing' });

        // 2. Initialize Client
        const client = new MercadoPagoConfig({ accessToken: config.accessToken });
        const preference = new Preference(client);

        // 3. Create Preference
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: title,
                        quantity: quantity || 1,
                        unit_price: Number(price),
                        currency_id: 'ARS',
                    },
                ],
                back_urls: {
                    success: req.headers.origin + '/publicidad?status=success',
                    failure: req.headers.origin + '/publicidad?status=failure',
                    pending: req.headers.origin + '/publicidad?status=pending',
                },
                auto_return: 'approved',
            }
        });

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('MercadoPago Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- User Registration Routes ---
const emailService = require('./emailService');
const SALT_ROUNDS = 10;

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, fullName, phone, terminalName, city, position, companyName, reason } = req.body;

        // Validate required fields
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, contraseña y nombre completo son requeridos' });
        }

        // Check if email already exists in registrations
        const existing = await new Promise((resolve, reject) => {
            db.get("SELECT id FROM user_registrations WHERE email = ?", [email], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (existing) {
            return res.status(400).json({ error: 'Este email ya tiene una solicitud pendiente' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create registration
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO user_registrations (id, email, password_hash, full_name, phone, terminal_name, city, position, company_name, reason, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
                [id, email, passwordHash, fullName, phone, terminalName, city, position, companyName, reason, now, now],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        // Send confirmation email
        await emailService.sendRegistrationConfirmation(email, fullName);

        res.json({
            message: 'Solicitud de registro enviada. Un administrador la revisará pronto.',
            id
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get all pending registrations
app.get('/api/admin/registrations', authenticateToken, async (req, res) => {
    try {
        const registrations = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM user_registrations ORDER BY created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err); else resolve(rows || []);
                }
            );
        });

        res.json(registrations);
    } catch (error) {
        console.error('Get Registrations Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Approve registration
app.post('/api/admin/registrations/:id/approve', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const adminEmail = req.user.email;

        // Get registration
        const registration = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM user_registrations WHERE id = ?", [id], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!registration) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        if (registration.status !== 'pending') {
            return res.status(400).json({ error: 'Esta solicitud ya fue procesada' });
        }

        // Update status
        const now = new Date().toISOString();
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE user_registrations 
                 SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ?
                 WHERE id = ?`,
                [adminEmail, now, now, id],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        // Generate temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const tempPasswordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

        // Create user in users table
        const userId = crypto.randomUUID();
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (id, email, password_hash, name, role, terminals, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, 'user', ?, 'active', ?, ?)`,
                [userId, registration.email, tempPasswordHash, registration.full_name, registration.terminal_name, now, now],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        // Send approval email with credentials
        await emailService.sendApprovalEmail(
            registration.email,
            registration.full_name,
            registration.email,
            tempPassword
        );

        res.json({
            message: 'Usuario aprobado exitosamente. Se ha enviado un email con las credenciales.',
            userId
        });
    } catch (error) {
        console.error('Approve Registration Error:', error);
        console.error('Error Stack:', error.stack);
        console.error('Error Message:', error.message);
        res.status(500).json({ error: error.message, details: error.toString() });
    }
});

// Admin: Reject registration
app.post('/api/admin/registrations/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Get registration data for email
        const registration = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM user_registrations WHERE id = ?", [id], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!registration) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const now = new Date().toISOString();
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE user_registrations 
                 SET status = 'rejected', rejected_reason = ?, updated_at = ?
                 WHERE id = ?`,
                [reason, now, id],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        // Send rejection email
        await emailService.sendRejectionEmail(
            registration.email,
            registration.full_name,
            reason || 'No se especificó un motivo'
        );

        res.json({ message: 'Solicitud rechazada. Se ha enviado un email al usuario.' });
    } catch (error) {
        console.error('Reject Registration Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Notifications Routes ---

// Get all notifications
// Get notifications (Filtered by user/role)
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        const notifications = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM notifications 
                 WHERE (
                     user_id = ? 
                     OR target_role = 'all' 
                     OR (target_role = 'admin' AND ? = 'admin')
                     OR (target_role = 'user' AND user_id = ?)
                 )
                 ORDER BY created_at DESC LIMIT 50`,
                [userId, role, userId],
                (err, rows) => {
                    if (err) reject(err); else resolve(rows || []);
                }
            );
        });

        res.json(notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get all users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        const users = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, email, name, role, status, terminals, created_at, last_login, updated_at FROM users ORDER BY created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err); else resolve(rows || []);
                }
            );
        });

        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update user
app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    console.log('========================================');
    console.log('PUT /api/admin/users/:id');
    console.log('ID:', id);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    try {
        const { name, role, terminals, status } = req.body;
        const now = new Date().toISOString();

        // Verificar que el usuario existe antes de actualizar
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            console.error('Usuario no encontrado:', id);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        console.log('Usuario encontrado:', user.email);

        // Actualizar usuario
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET name = ?, role = ?, terminals = ?, status = ?, updated_at = ? WHERE id = ?`,
                [name, role, terminals, status, now, id],
                function (err) {
                    if (err) {
                        console.error('Error en UPDATE:', err);
                        console.error('SQL:', this.sql);
                        console.error('Params:', [name, role, terminals, status, now, id]);
                        reject(err);
                    } else {
                        console.log('UPDATE exitoso. Filas afectadas:', this.changes);
                        resolve();
                    }
                }
            );
        });

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error en endpoint PUT:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update user (ALTERNATIVO - PATCH)
// Este endpoint usa PATCH en lugar de PUT y un enfoque completamente diferente
app.patch('/api/admin/users/:id/update', authenticateToken, async (req, res) => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  PATCH /api/admin/users/:id/update   ║');
    console.log('╚════════════════════════════════════════╝');

    const { id } = req.params;
    console.log('📝 User ID:', id);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const updates = req.body;

        // Construir query dinámicamente solo con los campos que se envían
        const allowedFields = ['name', 'role', 'terminals', 'status'];
        const fieldsToUpdate = [];
        const values = [];

        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                fieldsToUpdate.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }

        // Agregar updated_at
        fieldsToUpdate.push('updated_at = ?');
        values.push(new Date().toISOString());

        // Agregar ID al final
        values.push(id);

        const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

        console.log('🔧 SQL:', sql);
        console.log('📊 Values:', values);

        await new Promise((resolve, reject) => {
            db.run(sql, values, function (err) {
                if (err) {
                    console.error('❌ Error en DB:', err);
                    reject(err);
                } else {
                    console.log('✅ Filas actualizadas:', this.changes);
                    resolve();
                }
            });
        });

        console.log('╚════════════════════════════════════════╝\n');
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            updated: fieldsToUpdate.length - 1 // -1 porque updated_at no cuenta
        });
    } catch (error) {
        console.error('❌ Error en PATCH:', error);
        console.log('╚════════════════════════════════════════╝\n');
        res.status(500).json({ error: error.message });
    }
});


// Admin: Change user password
app.patch('/api/admin/users/:id/password', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    console.log('\n🔐 ════════════════════════════════════════');
    console.log('   Cambio de contraseña solicitado');
    console.log('   Usuario ID:', id);
    console.log('════════════════════════════════════════');

    try {
        // Validar contraseña
        if (!newPassword || newPassword.length < 6) {
            console.log('❌ Contraseña muy corta');
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar que el usuario existe
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id, email, name FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            console.log('❌ Usuario no encontrado');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        console.log('👤 Usuario encontrado:', user.email);

        // Hash de la nueva contraseña
        const password_hash = await bcrypt.hash(newPassword, 10);
        console.log('🔒 Contraseña hasheada');

        // Actualizar contraseña
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
                [password_hash, new Date().toISOString(), id],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Contraseña actualizada para:', user.email);
        console.log('════════════════════════════════════════\n');

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        console.log('════════════════════════════════════════\n');
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await new Promise((resolve, reject) => {
            db.serialize(() => {
                // Remove related notifications first
                db.run("DELETE FROM notifications WHERE user_id = ?", [id]);

                // Then remove user
                db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
                    if (err) reject(err); else resolve();
                });
            });
        });

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create notification
app.post('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const { title, message, type } = req.body;

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO notifications (id, title, message, type, is_read, created_at, updated_at)
                 VALUES (?, ?, ?, ?, 0, ?, ?)`,
                [id, title, message, type || 'info', now, now],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        res.json({ id, message: 'Notificación creada' });
    } catch (error) {
        console.error('Create Notification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date().toISOString();

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE notifications SET is_read = 1, updated_at = ? WHERE id = ?`,
                [now, id],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete notification
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM notifications WHERE id = ?`,
                [id],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        res.json({ message: 'Notificación eliminada' });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clear all notifications
app.delete('/api/notifications', authenticateToken, async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM notifications`,
                [],
                (err) => {
                    if (err) reject(err); else resolve();
                }
            );
        });

        res.json({ message: 'Todas las notificaciones eliminadas' });
    } catch (error) {
        console.error('Clear Notifications Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SUPPORT CHAT ENDPOINTS
// ============================================

// POST /api/support/messages - Enviar mensaje de soporte
app.post('/api/support/messages', authenticateToken, async (req, res) => {
    try {
        const { message, target_user_id } = req.body;
        const { id: senderId, role } = req.user;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
        }

        let conversationId = senderId;

        // Si el admin envía el mensaje, debe especificar el destinatario (owner de la conversación)
        if (role === 'admin') {
            if (!target_user_id) {
                return res.status(400).json({ error: 'Admin debe especificar target_user_id' });
            }
            conversationId = target_user_id;
        }

        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();

        // 1. Insertar mensaje en la conversación correcta
        db.run(
            `INSERT INTO support_messages (id, user_id, sender_role, message, created_at, is_read) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [messageId, conversationId, role, message, now, 0],
            function (err) {
                if (err) {
                    console.error('Error creating support message:', err);
                    return res.status(500).json({ error: 'Error al enviar mensaje' });
                }

                // 2. Crear Notificación
                const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                let notifTitle = '';
                let notifMessage = '';
                let notifUserId = null;
                let notifTargetRole = 'all';

                if (role === 'user') {
                    // Usuario envía -> Notificar Admin(s)
                    notifTitle = 'Nuevo mensaje de soporte';
                    notifMessage = `Usuario ha enviado un mensaje: "${message.substring(0, 30)}..."`;
                    notifTargetRole = 'admin';
                } else {
                    // Admin envía -> Notificar Usuario específico
                    notifTitle = 'Respuesta de Soporte';
                    notifMessage = `Admin ha respondido: "${message.substring(0, 30)}..."`;
                    notifUserId = conversationId;
                    notifTargetRole = 'user';
                }

                db.run(
                    `INSERT INTO notifications (id, title, message, type, is_read, user_id, target_role, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [notifId, notifTitle, notifMessage, 'info', 0, notifUserId, notifTargetRole, now],
                    (notifErr) => {
                        if (notifErr) console.error('Error creating notification:', notifErr);
                    }
                );

                res.json({
                    id: messageId,
                    user_id: conversationId,
                    sender_role: role,
                    message,
                    created_at: now,
                    is_read: 0
                });
            }
        );
    } catch (error) {
        console.error('Support Message Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/support/messages - Obtener mensajes de soporte
app.get('/api/support/messages', authenticateToken, async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { user_id } = req.query; // Para admin: filtrar por usuario específico

        let query = '';
        let params = [];

        if (role === 'admin') {
            // Admin puede ver mensajes de un usuario específico
            if (user_id) {
                query = `SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC`;
                params = [user_id];
            } else {
                // Si no especifica user_id, devolver error
                return res.status(400).json({ error: 'Se requiere user_id para admin' });
            }
        } else {
            // Usuario normal solo ve sus propios mensajes
            query = `SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC`;
            params = [userId];
        }

        db.all(query, params, (err, messages) => {
            if (err) {
                console.error('Error fetching support messages:', err);
                return res.status(500).json({ error: 'Error al obtener mensajes' });
            }

            res.json(messages || []);
        });
    } catch (error) {
        console.error('Get Support Messages Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/support/conversations - Listar conversaciones (solo admin)
app.get('/api/support/conversations', authenticateToken, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        // Obtener lista de usuarios con mensajes y contar no leídos
        const query = `
            SELECT 
                u.id as user_id,
                u.name as user_name,
                u.email as user_email,
                u.terminals as terminal,
                (SELECT COUNT(*) FROM support_messages 
                 WHERE user_id = u.id AND sender_role = 'user' AND is_read = 0) as unread_count,
                (SELECT message FROM support_messages 
                 WHERE user_id = u.id 
                 ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM support_messages 
                 WHERE user_id = u.id 
                 ORDER BY created_at DESC LIMIT 1) as last_message_at
            FROM users u
            WHERE EXISTS (SELECT 1 FROM support_messages WHERE user_id = u.id)
            ORDER BY last_message_at DESC
        `;

        db.all(query, [], (err, conversations) => {
            if (err) {
                console.error('Error fetching conversations:', err);
                return res.status(500).json({ error: 'Error al obtener conversaciones' });
            }

            res.json(conversations || []);
        });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/support/messages/mark-read - Marcar mensajes como leídos
app.patch('/api/support/messages/mark-read', authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Solo admin puede marcar mensajes como leídos' });
        }

        if (!user_id) {
            return res.status(400).json({ error: 'Se requiere user_id' });
        }

        db.run(
            `UPDATE support_messages 
             SET is_read = 1 
             WHERE user_id = ? AND sender_role = 'user' AND is_read = 0`,
            [user_id],
            function (err) {
                if (err) {
                    console.error('Error marking messages as read:', err);
                    return res.status(500).json({ error: 'Error al marcar mensajes' });
                }

                res.json({
                    message: 'Mensajes marcados como leídos',
                    updated: this.changes
                });
            }
        );
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ error: error.message });
    }
});



// Payment Routes
app.post('/api/payment/create-preference', async (req, res) => {
    try {
        const { title, price, quantity } = req.body;

        // Get Access Token from DB
        const settingsParams = await new Promise((resolve, reject) => {
            db.get("SELECT value FROM app_settings WHERE key = 'mercadopago_access_token'", (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!settingsParams || !settingsParams.value) {
            console.error('MercadoPago Access Token missing in DB');
            return res.status(500).json({ error: 'MercadoPago no configurado' });
        }

        const client = new MercadoPagoConfig({ accessToken: settingsParams.value });
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        title: title,
                        unit_price: Number(price),
                        quantity: Number(quantity),
                        currency_id: 'ARS'
                    }
                ],
                back_urls: {
                    success: 'https://terminalesmisiones.com.ar/payment/success',
                    failure: 'https://terminalesmisiones.com.ar/payment/failure',
                    pending: 'https://terminalesmisiones.com.ar/payment/pending'
                },
                auto_return: 'approved'
            }
        });

        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ error: 'Error al crear preferencia de pago' });
    }
});


// Admin: Dashboard Stats
app.get('/api/admin/stats', authenticateToken, (req, res) => {
    const stats = {
        terminals: 0,
        users: 0,
        companies: 0,
        banners: 0,
        topTerminals: [],
        recentActivity: []
    };

    const queries = [
        new Promise(resolve => db.get("SELECT COUNT(*) as count FROM terminals", (err, row) => resolve(row ? row.count : 0))),
        new Promise(resolve => db.get("SELECT COUNT(*) as count FROM users", (err, row) => resolve(row ? row.count : 0))),
        // Asumiendo que existe tabla companies o se cuenta de otra forma, si no existe pondremos 0 o ajustaremos
        // new Promise(resolve => db.get("SELECT COUNT(*) as count FROM companies", (err, row) => resolve(row ? row.count : 0))),
        new Promise(resolve => db.get("SELECT COUNT(*) as count FROM banners", (err, row) => resolve(row ? row.count : 0)))
    ];

    // Check if 'companies' table exists before querying, or just skip it if we know it doesn't
    // For now, let's query specific tables we know exist: terminals, users, banners.

    Promise.all([
        new Promise((resolve, reject) => db.get("SELECT COUNT(*) as count FROM terminals WHERE is_active = 1", (err, row) => err ? resolve(0) : resolve(row.count))),
        new Promise((resolve, reject) => db.get("SELECT COUNT(*) as count FROM users", (err, row) => err ? resolve(0) : resolve(row.count))),
        new Promise((resolve, reject) => db.get("SELECT COUNT(*) as count FROM banners", (err, row) => err ? resolve(0) : resolve(row.count)))
    ]).then(([terminalsCount, usersCount, bannersCount]) => {
        stats.terminals = terminalsCount;
        stats.users = usersCount;
        stats.banners = bannersCount;
        // Mock data for others to prevent crashes until tables exist
        stats.companies = 0;

        // Get Top Terminals (mock or real)
        db.all("SELECT id, name, visits FROM terminals ORDER BY visits DESC LIMIT 5", [], (err, rows) => {
            if (!err) stats.topTerminals = rows;

            res.json(stats);
        });
    }).catch(err => {
        console.error("Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
