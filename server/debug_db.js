
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, name FROM terminals", [], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('--- TERMINALS IN DB ---');
        console.log(`Count: ${rows.length}`);
        console.log(JSON.stringify(rows, null, 2));
        console.log('-----------------------');
    });
});

db.close();
