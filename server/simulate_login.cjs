const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);
const SECRET_KEY = 'secret-key-mision-bus';

console.log('=== SIMULANDO LOGIN ===\n');

const email = 'enolmarket@gmail.com';

db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    if (!user) {
        console.log('❌ Usuario no encontrado');
        db.close();
        return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.name);
    console.log('   Rol:', user.role);
    console.log('   Terminal:', `"${user.terminals}"`);
    console.log('   Longitud terminal:', user.terminals ? user.terminals.length : 0);

    // Generate token like the server does
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            terminals: user.terminals
        },
        SECRET_KEY,
        { expiresIn: '7d' }
    );

    console.log('\n=== TOKEN JWT GENERADO ===');
    console.log('Token:', token.substring(0, 50) + '...');

    // Decode to verify
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('\n=== TOKEN DECODIFICADO ===');
    console.log('   ID:', decoded.id);
    console.log('   Email:', decoded.email);
    console.log('   Rol:', decoded.role);
    console.log('   Terminal en token:', `"${decoded.terminals}"`);
    console.log('   Longitud:', decoded.terminals ? decoded.terminals.length : 0);

    db.close();
});
