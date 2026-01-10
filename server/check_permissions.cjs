const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, email, name, permissions FROM users', [], (err, users) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('=== PERMISOS DE USUARIOS ===\n');
    users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name || 'SIN NOMBRE'} (${u.email})`);
        console.log(`   Permissions value: ${JSON.stringify(u.permissions)}`);
        console.log(`   Permissions type: ${typeof u.permissions}`);

        if (u.permissions) {
            try {
                const parsed = JSON.parse(u.permissions);
                console.log(`   Parsed OK:`, parsed);
            } catch (e) {
                console.log(`   ❌ JSON.parse ERROR:`, e.message);
            }
        }
        console.log('');
    });

    db.close();
});
