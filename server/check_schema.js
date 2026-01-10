const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("DB Path:", dbPath);

db.serialize(() => {
    console.log("--- TABLE SCHEMAS ---");
    db.all("SELECT name, sql FROM sqlite_master WHERE type = 'table'", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            rows.forEach(row => {
                console.log(`\n--- Table: ${row.name} ---`);
                console.log(row.sql);
            });
        }
        db.close();
    });
});
