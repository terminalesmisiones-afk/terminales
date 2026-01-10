const fetch = require('node-fetch');

const testUpdate = async () => {
    try {
        // Primero login para obtener token
        const loginRes = await fetch('http://localhost:3005/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        const { token } = await loginRes.json();
        console.log('Token obtenido:', token ? 'OK' : 'FAIL');

        // Ahora intentar actualizar usuario
        const updateRes = await fetch('http://localhost:3005/api/admin/users/6ae5ef71-8579-4d27-9634-d8e65b41220e', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'enrique olivera',
                role: 'admin',
                terminals: 'Terminal de Ómnibus de Posadas - Posadas',
                status: 'active'
            })
        });

        console.log('Status:', updateRes.status);
        const result = await updateRes.json();
        console.log('Response:', result);

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testUpdate();
