const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check if column exists first
    db.all("PRAGMA table_info(terminals)", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        const columns = rows.map(r => r.name);

        if (!columns.includes('long_content')) {
            console.log("Adding long_content column...");
            db.run("ALTER TABLE terminals ADD COLUMN long_content TEXT", (err) => {
                if (err) console.error("Error adding long_content:", err);
                else console.log("long_content added successfully.");
            });
        } else {
            console.log("long_content already exists.");
        }

        if (!columns.includes('municipality_info')) {
            console.log("Adding municipality_info column...");
            db.run("ALTER TABLE terminals ADD COLUMN municipality_info TEXT", (err) => {
                if (err) console.error("Error adding municipality_info:", err);
                else console.log("municipality_info added successfully.");
            });
        } else {
            console.log("municipality_info already exists.");
        }
    });
});
