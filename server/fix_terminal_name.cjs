const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== CORRIGIENDO TERMINAL ASIGNADA ===\n');

const correctTerminalName = 'Terminal de Ómnibus de Puerto Iguazú';

db.run(
    "UPDATE users SET terminals = ? WHERE email = ?",
    [correctTerminalName, 'enolmarket@gmail.com'],
    function (err) {
        if (err) {
            console.error('❌ Error:', err);
            db.close();
            return;
        }

        console.log('✅ Terminal actualizada correctamente');
        console.log('   Rows affected:', this.changes);

        // Verify
        db.get("SELECT email, terminals FROM users WHERE email = ?",
            ['enolmarket@gmail.com'],
            (err, user) => {
                if (err) {
                    console.error('Error verificando:', err);
                } else {
                    console.log('\n=== VERIFICACIÓN ===');
                    console.log('   Email:', user.email);
                    console.log('   Terminal:', user.terminals);
                    console.log('   Longitud:', user.terminals.length, 'caracteres');
                }
                db.close();
            }
        );
    }
);
