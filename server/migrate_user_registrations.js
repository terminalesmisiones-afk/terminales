const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Migrando tabla user_registrations...');

db.serialize(() => {
    // Primero, verificar si la tabla existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user_registrations'", (err, row) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        if (!row) {
            console.log('⚠️  Tabla user_registrations no existe. Créala primero ejecutando el servidor.');
            db.close();
            return;
        }

        // Crear tabla temporal con la nueva estructura
        db.run(`CREATE TABLE user_registrations_new (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            terminal_name TEXT,
            city TEXT,
            position TEXT,
            company_name TEXT,
            reason TEXT,
            status TEXT DEFAULT 'pending',
            approved_by TEXT,
            approved_at TEXT,
            rejected_reason TEXT,
            created_at TEXT,
            updated_at TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creando tabla temporal:', err);
                db.close();
                return;
            }

            // Copiar datos existentes
            db.run(`INSERT INTO user_registrations_new 
                    SELECT id, email, password_hash, full_name, phone, 
                           terminal_id as terminal_name, city, position, company_name, reason,
                           status, approved_by, approved_at, rejected_reason, created_at, updated_at
                    FROM user_registrations`, (err) => {
                if (err) {
                    console.error('Error copiando datos:', err);
                    db.close();
                    return;
                }

                // Eliminar tabla vieja
                db.run('DROP TABLE user_registrations', (err) => {
                    if (err) {
                        console.error('Error eliminando tabla vieja:', err);
                        db.close();
                        return;
                    }

                    // Renombrar tabla nueva
                    db.run('ALTER TABLE user_registrations_new RENAME TO user_registrations', (err) => {
                        if (err) {
                            console.error('Error renombrando tabla:', err);
                        } else {
                            console.log('✅ Migración completada exitosamente!');
                            console.log('   - Columna terminal_id renombrada a terminal_name');
                            console.log('   - Ahora acepta texto libre (nombre de terminal)');
                        }
                        db.close();
                    });
                });
            });
        });
    });
});
