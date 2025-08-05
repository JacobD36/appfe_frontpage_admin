// Script de prueba rápida para verificar la estructura de la API
const fetch = require('node-fetch');

async function testAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/users?page=1&limit=10');
        const data = await response.json();

        console.log('Respuesta completa de la API:');
        console.log(JSON.stringify(data, null, 2));

        console.log('\n--- Verificación de estructura ---');
        console.log('data exists:', !!data.data);
        console.log('data.data exists:', !!data.data?.data);
        console.log('data.data.pagination exists:', !!data.data?.pagination);

        if (data.data?.data) {
            console.log('Número de usuarios:', data.data.data.length);
            console.log('Primer usuario:', data.data.data[0]);
        }

        if (data.data?.pagination) {
            console.log('Información de paginación:', data.data.pagination);
        }

    } catch (error) {
        console.error('Error al probar la API:', error.message);
    }
}

testAPI();
