const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("--- USERS TABLE INFO ---");
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    console.log("\n--- USER_REGISTRATIONS TABLE INFO ---");
    db.all("PRAGMA table_info(user_registrations)", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
});
