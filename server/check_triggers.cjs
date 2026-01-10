const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Ver todos los triggers
    db.all("SELECT name, sql FROM sqlite_master WHERE type = 'trigger'", [], (err, triggers) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        console.log('=== TRIGGERS EN BASE DE DATOS ===\n');
        if (triggers.length === 0) {
            console.log('No hay triggers');
        } else {
            triggers.forEach((t, i) => {
                console.log(`${i + 1}. ${t.name}`);
                console.log(t.sql);
                console.log('');
            });
        }

        // Ver el esquema completo de users
        db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log('\n=== ESQUEMA COMPLETO DE USERS ===');
                console.log(row.sql);
            }
            db.close();
        });
    });
});
