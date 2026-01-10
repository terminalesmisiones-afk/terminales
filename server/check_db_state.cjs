const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('=== VERIFICANDO ESTADO DE SOLICITUDES ===\n');

    // Ver todas las solicitudes
    db.all('SELECT id, email, full_name, status, approved_by, approved_at FROM user_registrations ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        console.log('Total de solicitudes:', rows.length);
        console.log('\nDetalle de solicitudes:\n');

        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.full_name} (${row.email})`);
            console.log(`   ID: ${row.id}`);
            console.log(`   Status: ${row.status}`);
            console.log(`   Approved by: ${row.approved_by || 'NULL'}`);
            console.log(`   Approved at: ${row.approved_at || 'NULL'}`);
            console.log('');
        });

        // Ver usuarios creados
        db.all('SELECT id, email, name FROM users', [], (err, users) => {
            if (err) {
                console.error('Error al obtener usuarios:', err);
            } else {
                console.log('\n=== USUARIOS CREADOS ===');
                console.log('Total:', users.length);
                users.forEach((u, i) => {
                    console.log(`${i + 1}. ${u.name || 'SIN NOMBRE'} (${u.email})`);
                });
            }
            db.close();
        });
    });
});
