const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const SALT_ROUNDS = 10;
const adminEmail = 'admin@example.com';
const newPassword = 'admin';

async function resetAdminPassword() {
    try {
        const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const now = new Date().toISOString();
        const id = 'user-admin-reset'; // Fixed ID for reset

        db.serialize(() => {
            // First try to update
            db.run("UPDATE users SET password_hash = ? WHERE email = ?", [hash, adminEmail], function (err) {
                if (err) {
                    console.error("Error updating password:", err);
                    return;
                }

                if (this.changes > 0) {
                    console.log(`Password updated for user: ${adminEmail}`);
                } else {
                    // If not found, insert
                    console.log(`User ${adminEmail} not found, creating new one...`);
                    db.run("INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
                        [id, adminEmail, hash, 'admin', now], (err) => {
                            if (err) console.error("Error creating user:", err);
                            else console.log(`Admin user created: ${adminEmail}`);
                        });
                }
            });
        });

    } catch (error) {
        console.error("Error hashing password:", error);
    }
}

resetAdminPassword();
