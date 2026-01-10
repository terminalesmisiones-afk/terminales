const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== CORRIGIENDO ESPACIOS EN TERMINALES ASIGNADAS ===\n');

// Obtener todos los usuarios con terminales asignadas
db.all("SELECT id, email, name, terminals FROM users WHERE terminals IS NOT NULL AND terminals != ''",
    [],
    (err, users) => {
        if (err) {
            console.error('Error:', err);
            db.close();
            return;
        }

        console.log(`Encontrados ${users.length} usuarios con terminal asignada\n`);

        let updated = 0;
        let processed = 0;

        users.forEach((user, index) => {
            const trimmed = user.terminals.trim();

            if (trimmed !== user.terminals) {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   ANTES: "${user.terminals}" (${user.terminals.length} chars)`);
                console.log(`   DESPUÉS: "${trimmed}" (${trimmed.length} chars)`);

                db.run(
                    "UPDATE users SET terminals = ? WHERE id = ?",
                    [trimmed, user.id],
                    (err) => {
                        if (err) {
                            console.error('   ❌ Error:', err);
                        } else {
                            console.log('   ✅ Actualizado\n');
                            updated++;
                        }

                        processed++;
                        if (processed === users.length) {
                            console.log(`\n=== RESUMEN ===`);
                            console.log(`Total usuarios: ${users.length}`);
                            console.log(`Actualizados: ${updated}`);
                            db.close();
                        }
                    }
                );
            } else {
                console.log(`${index + 1}. ${user.email} - ✅ OK (sin espacios extra)\n`);
                processed++;
                if (processed === users.length) {
                    console.log(`\n=== RESUMEN ===`);
                    console.log(`Total usuarios: ${users.length}`);
                    console.log(`Actualizados: ${updated}`);
                    db.close();
                }
            }
        });

        if (users.length === 0) {
            console.log('No hay usuarios con terminal asignada');
            db.close();
        }
    }
);
