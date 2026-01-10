const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all('SELECT id, email, name, role FROM users', [], (err, users) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        console.log('=== USUARIOS EN BASE DE DATOS ===\n');
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.name || 'SIN NOMBRE'}`);
            console.log(`   Email: ${u.email}`);
            console.log(`   ID: ${u.id}`);
            console.log(`   Role: ${u.role}`);
            console.log('');
        });

        db.close();
    });
});
