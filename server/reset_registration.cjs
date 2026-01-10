const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'enolmarket@gmail.com';

db.serialize(() => {
    console.log('Reseteando solicitud de registro...');

    // 1. Resetear estado de la solicitud a 'pending'
    db.run(
        "UPDATE user_registrations SET status = 'pending', approved_by = NULL, approved_at = NULL WHERE email = ?",
        [email],
        function (err) {
            if (err) {
                console.error('Error al resetear solicitud:', err);
            } else {
                console.log(`Solicitud reseteada. Filas afectadas: ${this.changes}`);
            }

            // 2. Eliminar usuario si existe (para permitir recreación)
            db.run("DELETE FROM users WHERE email = ?", [email], function (err) {
                if (err) {
                    console.error('Error al eliminar usuario:', err);
                } else {
                    console.log(`Usuario eliminado (si existía). Filas afectadas: ${this.changes}`);
                }

                // 3. Verificar estado final
                db.get('SELECT status, approved_by FROM user_registrations WHERE email = ?', [email], (err, row) => {
                    if (row) {
                        console.log('\nEstado final de la solicitud:');
                        console.log('Status:', row.status);
                        console.log('Approved by:', row.approved_by || 'NULL');
                    }
                    db.close();
                });
            });
        }
    );
});
