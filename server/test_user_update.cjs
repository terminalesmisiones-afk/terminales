const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Ver esquema de users
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log('=== ESQUEMA DE TABLA USERS ===');
        console.log(row.sql);
        console.log('');

        // Intentar actualizar directamente
        const userId = '6ae5ef71-8579-4d27-9634-d8e65b41220e';
        const now = new Date().toISOString();

        console.log('=== INTENTANDO ACTUALIZAR USUARIO ===');
        console.log('ID:', userId);

        db.run(
            `UPDATE users SET name = ?, role = ?, terminals = ?, status = ?, updated_at = ? WHERE id = ?`,
            ['enrique olivera', 'user', 'Terminal de Ómnibus de Posadas - Posadas', 'active', now, userId],
            function (err) {
                if (err) {
                    console.error('ERROR AL ACTUALIZAR:', err.message);
                } else {
                    console.log('ÉXITO: Filas afectadas:', this.changes);
                }
                db.close();
            }
        );
    });
});
