const db = require('./db');

console.log('Migrating schedules table...');

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS schedules", (err) => {
        if (err) {
            console.error('Error dropping table:', err);
        } else {
            console.log('Old schedules table dropped.');

            db.run(`CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        terminal_id TEXT NOT NULL,
        company TEXT NOT NULL,
        destination TEXT NOT NULL,
        remarks TEXT,
        departure_mon_fri TEXT,
        departure_sat TEXT,
        departure_sun TEXT,
        platform TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY(terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
      )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                } else {
                    console.log('New schedules table created successfully.');
                }
            });
        }
    });
});
