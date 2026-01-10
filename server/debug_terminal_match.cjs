const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== VERIFICANDO USUARIO Y TERMINAL ===\n');

db.get("SELECT id, email, name, role, terminals FROM users WHERE email = ?",
    ['enolmarket@gmail.com'],
    (err, user) => {
        if (err) {
            console.error('Error:', err);
            db.close();
            return;
        }

        if (!user) {
            console.log('❌ Usuario no encontrado');
            db.close();
            return;
        }

        console.log('✅ Usuario encontrado:');
        console.log('   Email:', user.email);
        console.log('   Rol:', user.role);
        console.log('   Terminal asignada:', `"${user.terminals}"`);
        console.log('   Longitud:', user.terminals ? user.terminals.length : 0);

        console.log('\n=== BUSCANDO TERMINALES EN BD ===');
        db.all("SELECT id, name FROM terminals WHERE is_active = 1", [], (err, terminals) => {
            if (err) {
                console.error('Error:', err);
                db.close();
                return;
            }

            console.log(`\nTerminales activas (${terminals.length}):`);
            terminals.forEach((t, i) => {
                const match = t.name === user.terminals ? '✅ MATCH' : '';
                console.log(`${i + 1}. "${t.name}" (${t.name.length} chars) ${match}`);
            });

            console.log('\n=== COMPARACIÓN EXACTA ===');
            const exactMatch = terminals.find(t => t.name === user.terminals);
            if (exactMatch) {
                console.log('✅ Encontrada coincidencia exacta:', exactMatch.name);
            } else {
                console.log('❌ NO hay coincidencia exacta');
                console.log('   Buscando:', `"${user.terminals}"`);
            }

            db.close();
        });
    }
);
