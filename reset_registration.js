const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'enolmarket@gmail.com';

db.serialize(() => {
    // 1. Verificar estado actual
    db.get('SELECT * FROM user_registrations WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log('--- Estado Actual ---');
        console.log(row);

        if (row) {
            // 2. Resetear a 'pending'
            db.run(
                "UPDATE user_registrations SET status = 'pending', approved_by = NULL, approved_at = NULL WHERE email = ?",
                [email],
                function (err) {
                    if (err) {
                        console.error('Error al actualizar:', err);
                    } else {
                        console.log(`\nActualizado correctamente. Filas afectadas: ${this.changes}`);
                    }

                    // 3. Verificar estado despues
                    db.get('SELECT * FROM user_registrations WHERE email = ?', [email], (err, newRow) => {
                        console.log('\n--- Nuevo Estado ---');
                        console.log(newRow);

                        // 4. (Opcional) Limpiar usuario si fue creado parcialmente
                        db.run("DELETE FROM users WHERE email = ?", [email], (err) => {
                            if (!err) console.log("\nLimpieza de usuarios parciales completada (si existían).");
                            db.close();
                        });
                    });
                }
            );
        } else {
            console.log('No se encontró registro con ese email.');
            db.close();
        }
    });
});
