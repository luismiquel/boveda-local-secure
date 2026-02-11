
# Bóveda Personal 🛡️

Tu asistente de privacidad ultra-seguro, 100% local y offline.

## 🧠 Modelo de Amenazas

### ✅ Protege contra:
- **Acceso Físico/Forense**: Si alguien obtiene tu dispositivo o archivos de IndexedDB, los datos están cifrados con AES-256-GCM. Sin el PIN, los datos son indistinguibles de ruido aleatorio.
- **Backups Expuestos**: Las exportaciones JSON están cifradas.
- **Cambio de PIN**: Implementa *Envelope Encryption*; cambiar el PIN recifra solo la llave maestra (DEK), no todos los registros.

### ❌ NO protege contra:
- **Keyloggers/Malware**: Si el sistema operativo está comprometido, el PIN puede ser capturado.
- **Sesión Abierta**: Si dejas la app desbloqueada, cualquiera puede ver los datos. Usa el *Auto-Lock*.
- **Olvido de PIN**: Al ser Zero-Knowledge local, **no hay recuperación**. Si pierdes el PIN, pierdes los datos.

## 🔐 Decisiones de Cifrado
1. **PBKDF2 SHA-256**: 150,000 iteraciones para dificultar ataques de fuerza bruta.
2. **AES-GCM 256**: Cifrado autenticado para asegurar que los datos no han sido manipulados.
3. **Canario de Verificación**: Se intenta descifrar un secreto interno ("BOVEDA_OK") para validar el PIN antes de intentar descifrar registros.
4. **Wipe de Pánico**: Elimina bases de datos, Service Workers, Caches y reinicia la app.

## 🚀 Despliegue
Diseñado para ser desplegado como sitio estático (Vercel, Netlify, Cloudflare). 
**Requiere HTTPS** para el funcionamiento de la Web Crypto API.

## 🛠️ Desarrollo
```bash
npm install
npm run dev
```
