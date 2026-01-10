import { useEffect } from 'react';

// ACÁ DEFINIMOS LA VERSIÓN ACTUAL DE LA APP
// INCREMENTAR ESTE NÚMERO CADA VEZ QUE SE HAGAN CAMBIOS IMPORTANTES QUE REQUIERAN LIMPIEZA
const APP_VERSION = '1.0.3';

const CacheBuster = () => {
    useEffect(() => {
        const checkVersion = async () => {
            const storedVersion = localStorage.getItem('app_version');

            console.log(`[CacheBuster] Current Version: ${APP_VERSION}, Stored: ${storedVersion}`);

            if (storedVersion !== APP_VERSION) {
                console.warn('[CacheBuster] New version detected! Cleaning cache...');

                // 1. Limpiar localStorage (Excepto items críticos si quisieras mantener login, pero por seguridad limpiamos todo o selectivo)
                // Mantenemos el token si existe para no desloguear al usuario agresivamente, 
                // O mejor limpiamos todo para asegurar estado fresco.
                // Vamos a mantener solo el token si el usuario quiere, pero el requerimiento es "auto limitador", asumo limpieza profunda.
                // Para "no borrar al cache" del usuario, mejor limpiamos todo lo que sea datos huerfanos.

                // Estrategia: Guardar token, limpiar todo, restaurar token.
                const token = localStorage.getItem('token');
                localStorage.clear();
                if (token) localStorage.setItem('token', token);

                // 2. Guardar nueva versión
                localStorage.setItem('app_version', APP_VERSION);

                // 3. Limpiar caches del navegador (Service Workers, Cache Storage)
                if ('caches' in window) {
                    try {
                        const keys = await caches.keys();
                        await Promise.all(keys.map(key => caches.delete(key)));
                        console.log('[CacheBuster] Browser caches cleared.');
                    } catch (err) {
                        console.error('[CacheBuster] Error clearing caches:', err);
                    }
                }

                // 4. Recargar página para obtener nuevos assets
                console.log('[CacheBuster] Reloading page...');
                window.location.reload();
            }
        };

        checkVersion();
    }, []);

    return null; // Este componente no renderiza nada visible
};

export default CacheBuster;
