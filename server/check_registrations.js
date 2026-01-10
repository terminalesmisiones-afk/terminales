const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("DB Path:", dbPath);

db.serialize(() => {
    console.log("--- USER_REGISTRATIONS DATA ---");
    db.all("SELECT * FROM user_registrations ORDER BY created_at DESC", (err, rows) => {
        if (err) console.error(err);
        else {
            rows.forEach(r => {
                console.log('\n---');
                console.log('Email:', r.email);
                console.log('Status:', r.status);
                console.log('Approved By:', r.approved_by);
                console.log('Approved At:', r.approved_at);
                console.log('Created At:', r.created_at);
            });
        }
    });
});
