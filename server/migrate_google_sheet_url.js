const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Migrating terminals table to include google_sheet_url...');

db.serialize(() => {
    db.run("ALTER TABLE terminals ADD COLUMN google_sheet_url TEXT", function (err) {
        if (err) {
            // Ignore error if column already exists
            if (err.message.includes('duplicate column name')) {
                console.log('Column google_sheet_url already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Successfully added google_sheet_url column.');
        }
    });
});

db.close();
