const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const terminals = [
    {
        name: 'Terminal de Ómnibus de Posadas',
        city: 'Posadas',
        address: 'Av. Santa Catalina y Av. Quaranta',
        phone: '+54 376 445-4888',
        description: 'Principal terminal de la provincia, conexión con todo el país.',
        municipality_info: 'Capital de la provincia de Misiones.',
        latitude: -27.401688,
        longitude: -55.915060,
        image: 'https://lh5.googleusercontent.com/p/AF1QipN3T3t3f2d2Yv5XZ6Q8q9c6b7W8e0r1s2t3u4v5=w408-h306-k-no' // Placeholder URL, ideally would be real or uploaded
    },
    {
        name: 'Terminal de Ómnibus de Puerto Iguazú',
        city: 'Puerto Iguazú',
        address: 'Av. Misiones y Av. Córdoba',
        phone: '+54 3757 42-3006',
        description: 'Acceso a las Cataratas del Iguazú.',
        municipality_info: 'Ciudad turística internacional.',
        latitude: -25.59846,
        longitude: -54.57105,
        image: 'https://lh5.googleusercontent.com/p/AF1QipPj-8K7L0N9M2O4P3Q5R6S7T8U9V0W1X2Y3Z4a5=w408-h306-k-no'
    },
    {
        name: 'Terminal de Ómnibus de Oberá',
        city: 'Oberá',
        address: 'Av. Italia y Ruta Nacional 14',
        phone: '+54 3755 40-1168',
        description: 'Terminal de la zona centro.',
        municipality_info: 'Capital del Monte.',
        latitude: -27.504087,
        longitude: -55.120104,
        image: 'https://lh5.googleusercontent.com/p/AF1QipM4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2=w408-h306-k-no'
    },
    {
        name: 'Terminal de Ómnibus de Eldorado',
        city: 'Eldorado',
        address: 'Av. Fundador Adolfo Julio Schwelm 76',
        phone: '+54 3751 42-1825',
        description: 'Terminal del norte misionero.',
        municipality_info: 'Capital del Trabajo.',
        latitude: -26.42518,
        longitude: -54.63733,
        image: 'https://lh5.googleusercontent.com/p/AF1QipO9P0Q1R2S3T4U5V6W7X8Y9Z0a1b2c3d4e5f6=w408-h306-k-no'
    }
];

db.serialize(() => {
    const stmt = db.prepare(`INSERT INTO terminals (id, name, city, address, phone, description, municipality_info, latitude, longitude, is_active, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    terminals.forEach(terminal => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        stmt.run(
            id,
            terminal.name,
            terminal.city,
            terminal.address,
            terminal.phone,
            terminal.description,
            terminal.municipality_info,
            terminal.latitude,
            terminal.longitude,
            1, // is_active
            terminal.image,
            now,
            now,
            (err) => {
                if (err) {
                    console.error(`Error inserting ${terminal.name}:`, err.message);
                } else {
                    console.log(`Inserted: ${terminal.name}`);
                }
            }
        );
    });

    stmt.finalize(() => {
        console.log('Seeding completed.');
        db.close();
    });
});
