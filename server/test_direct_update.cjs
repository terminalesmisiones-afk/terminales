const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const userId = '6ae5ef71-8579-45f7-9634-d8e1964122db';
const now = new Date().toISOString();

console.log('Intentando actualizar usuario:', userId);
console.log('Datos:', {
    name: 'enrique olivera',
    role: 'user',
    terminals: 'Terminal de Ómnibus de Posadas - Posadas',
    status: 'active'
});

db.run(
    `UPDATE users SET name = ?, role = ?, terminals = ?, status = ?, updated_at = ? WHERE id = ?`,
    ['enrique olivera', 'user', 'Terminal de Ómnibus de Posadas - Posadas', 'active', now, userId],
    function (err) {
        if (err) {
            console.error('\n❌ ERROR:', err.message);
            console.error('Código:', err.code);
        } else {
            console.log('\n✅ ÉXITO');
            console.log('Filas afectadas:', this.changes);
        }
        db.close();
    }
);
