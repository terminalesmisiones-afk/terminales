const db = require('./db');

console.log('Migrating Pages Table...');

db.serialize(() => {
    // Check if column exists
    db.all("PRAGMA table_info(pages)", (err, rows) => {
        if (err) {
            console.error('Error reading table info:', err);
            return;
        }

        const hasFeaturedImage = rows.some(r => r.name === 'featured_image');

        if (!hasFeaturedImage) {
            console.log('Adding featured_image column...');
            db.run("ALTER TABLE pages ADD COLUMN featured_image TEXT", (err) => {
                if (err) console.error('Error adding column:', err);
                else console.log('Column featured_image added successfully.');
            });
        } else {
            console.log('Column featured_image already exists.');
        }
    });
});
