const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== VERIFICANDO ESQUEMA Y CONSTRAINTS ===\n');

db.serialize(() => {
    // 1. Ver esquema completo de la tabla users
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log('ESQUEMA DE TABLA USERS:');
        console.log(row.sql);
        console.log('\n');

        // 2. Ver todos los triggers
        db.all("SELECT name, sql FROM sqlite_master WHERE type='trigger'", [], (err, triggers) => {
            if (err) {
                console.error('Error:', err);
                return;
            }

            console.log('TRIGGERS:');
            if (triggers.length === 0) {
                console.log('No hay triggers');
            } else {
                triggers.forEach(t => {
                    console.log(`\nTrigger: ${t.name}`);
                    console.log(t.sql);
                });
            }
            console.log('\n');

            // 3. Ver todos los índices
            db.all("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='users'", [], (err, indexes) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }

                console.log('ÍNDICES EN TABLA USERS:');
                if (indexes.length === 0) {
                    console.log('No hay índices');
                } else {
                    indexes.forEach(idx => {
                        console.log(`\nÍndice: ${idx.name}`);
                        console.log(idx.sql || '(índice automático)');
                    });
                }

                db.close();
            });
        });
    });
});
