const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Migrating notifications table...');

db.serialize(() => {
    // Add user_id column
    db.run("ALTER TABLE notifications ADD COLUMN user_id TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column user_id already exists');
            } else {
                console.error('Error adding user_id:', err);
            }
        } else {
            console.log('Added user_id column');
        }
    });

    // Add target_role column
    db.run("ALTER TABLE notifications ADD COLUMN target_role TEXT DEFAULT 'all'", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column target_role already exists');
            } else {
                console.error('Error adding target_role:', err);
            }
        } else {
            console.log('Added target_role column');
        }
    });
});

db.close(() => {
    console.log('Migration complete');
});
