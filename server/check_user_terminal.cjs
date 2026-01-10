const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== VERIFICANDO USUARIO enolmarket@gmail.com ===\n');

db.get("SELECT id, email, name, role, terminals, status FROM users WHERE email = ?",
    ['enolmarket@gmail.com'],
    (err, user) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        if (!user) {
            console.log('❌ Usuario no encontrado');
            db.close();
            return;
        }

        console.log('✅ Usuario encontrado:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nombre:', user.name);
        console.log('   Rol:', user.role);
        console.log('   Terminal asignada:', user.terminals || '(ninguna)');
        console.log('   Estado:', user.status);

        if (user.terminals) {
            console.log('\n=== BUSCANDO TERMINAL ===');
            db.get("SELECT id, name, city, is_active FROM terminals WHERE name = ?",
                [user.terminals],
                (err, terminal) => {
                    if (err) {
                        console.error('Error:', err);
                    } else if (terminal) {
                        console.log('✅ Terminal encontrada:');
                        console.log('   ID:', terminal.id);
                        console.log('   Nombre:', terminal.name);
                        console.log('   Ciudad:', terminal.city);
                        console.log('   Activa:', terminal.is_active ? 'Sí' : 'No');
                    } else {
                        console.log('❌ Terminal NO encontrada con nombre:', user.terminals);
                    }
                    db.close();
                }
            );
        } else {
            console.log('\n⚠️  Usuario no tiene terminal asignada');
            db.close();
        }
    }
);
