const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.get("PRAGMA table_info(users)", (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('=== PRAGMA table_info(users) ===');
    console.log(row);
});

db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('\n=== COLUMNAS DE LA TABLA USERS ===\n');
    columns.forEach(col => {
        console.log(`${col.name}:`);
        console.log(`  Tipo: ${col.type}`);
        console.log(`  NOT NULL: ${col.notnull === 1 ? 'SÍ' : 'NO'}`);
        console.log(`  Default: ${col.dflt_value || '(ninguno)'}`);
        console.log(`  PK: ${col.pk === 1 ? 'SÍ' : 'NO'}`);
        console.log('');
    });

    db.close();
});
