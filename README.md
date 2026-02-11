# Bóveda Personal

Bóveda Personal es una solución de software orientada a la privacidad que permite el almacenamiento seguro de información sensible mediante una arquitectura de ejecución local absoluta. Implementada como una Aplicación Web Progresiva (PWA), la herramienta garantiza que el control de la información resida exclusivamente en el dispositivo del usuario, eliminando cualquier dependencia de servicios en la nube, servidores externos o APIs de terceros.

## Objetivo del Proyecto

Proporcionar un entorno digital soberano para la gestión de notas, documentos y datos personales. El proyecto nace como respuesta a la centralización de datos y busca ofrecer una alternativa donde la privacidad no sea una configuración, sino la base tecnológica del sistema.

## Principios Fundamentales

*   Sin Nube: Los datos nunca se transmiten a través de la red. No existen servidores centrales ni sincronización externa.
*   Sin Backend: La lógica de persistencia y procesamiento ocurre íntegramente en el cliente (navegador).
*   Offline-First: La aplicación es plenamente funcional sin conexión a internet desde el momento de su instalación.
*   Cero Rastreo: No se incluyen scripts de análisis, telemetría ni cookies de seguimiento.

## Características Principales

*   Gestión de Notas Seguras: Almacenamiento cifrado de texto con soporte para plantillas y organización por colecciones.
*   Repositorio de Documentos: Capacidad para guardar documentos de texto y archivos adjuntos (Base64) de forma local.
*   Lista de Tareas y Compras: Persistencia de estados con cifrado individual de registros.
*   Agenda de Citas: Sistema de recordatorios local con gestión de eventos pasados.
*   Dictado Privado: Integración con Web Speech API para entrada de datos por voz sin procesamiento en la nube.
*   Geolocalización Local: Registro de coordenadas GPS guardadas exclusivamente en la base de datos del dispositivo.
*   Interfaz Adaptable: Incluye un modo senior con escalado de elementos de interfaz y tipografía para mejorar la accesibilidad.

## Modelo de Seguridad (Threat Model)

### Nivel de Protección Alto
*   Acceso Físico no Autorizado: Los datos en IndexedDB están protegidos mediante AES-256-GCM. Sin el PIN maestro, la información es computacionalmente inaccesible.
*   Ataques de Fuerza Bruta: La derivación de claves mediante PBKDF2 con 150,000 iteraciones y un salt aleatorio dificulta significativamente los ataques de diccionario o fuerza bruta offline.
*   Integridad de Datos: El uso de GCM (Galois/Counter Mode) garantiza que cualquier manipulación de los datos cifrados sea detectada durante el proceso de descifrado.

### Limitaciones de Seguridad
*   Compromiso del Sistema Operativo: Si el dispositivo cuenta con malware, keyloggers o software de captura de pantalla, la seguridad de la aplicación puede verse comprometida.
*   Sesión Abierta: La aplicación incluye un sistema de auto-bloqueo, pero la seguridad inmediata depende de que el usuario bloquee la bóveda o su dispositivo tras el uso.
*   Pérdida de PIN: Al ser un sistema de conocimiento cero (Zero-Knowledge), no existe mecanismo de recuperación. La pérdida del PIN implica la pérdida irreversible de los datos.

## Tecnologías Utilizadas

*   Core: React 19, TypeScript (Strict Mode).
*   Estado: Zustand para la gestión de estado global reactivo.
*   Persistencia: Dexie.js (IndexedDB) para el almacenamiento estructurado local.
*   Cifrado: Web Crypto API (Nativo del navegador).
*   Estilos: Tailwind CSS.
*   Entorno de Desarrollo: Vite.

## Arquitectura del Proyecto

El proyecto sigue una estructura modular para separar las preocupaciones de dominio, infraestructura y presentación.

```text
/
├── domain/         # Modelos de datos y definiciones de tipos TypeScript.
├── infra/          # Configuración de base de datos (Dexie) y repositorios.
├── app/
│   ├── components/ # Componentes de lógica compartida.
│   ├── hooks/      # Hooks personalizados (Criptografía, Seguridad).
│   ├── pages/      # Vistas principales de la aplicación.
│   └── store.ts    # Estado global de la aplicación con Zustand.
├── shared/
│   ├── crypto.ts   # Implementación de primitivas criptográficas.
│   └── ui.tsx      # Componentes de interfaz de usuario atómicos.
├── public/         # Manifiesto PWA, Service Worker y recursos estáticos.
└── App.tsx         # Orquestador principal y sistema de rutas/bloqueo.
```

## Instalación y Desarrollo

Para ejecutar el proyecto en un entorno local de desarrollo:

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Compilación para Producción

Para generar el bundle optimizado para despliegue:

```bash
npm run build
```

El resultado se encontrará en el directorio `dist/`, listo para ser servido por cualquier servidor de archivos estáticos.

## Despliegue

Bóveda Personal es compatible con cualquier plataforma de hosting estático (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

Requisito Crítico: El despliegue debe realizarse obligatoriamente bajo protocolo HTTPS. La Web Crypto API y los Service Workers requieren un contexto seguro para funcionar.

## Uso como PWA

La aplicación está configurada para ser instalada como una App nativa:
1. En escritorio: Click en el icono de instalación en la barra de direcciones del navegador.
2. En móviles: Opción "Añadir a pantalla de inicio" desde el menú del navegador.

Una vez instalada, la aplicación funcionará de forma independiente al navegador, con su propio ciclo de vida y almacenamiento persistente incluso si se limpia la caché del navegador general.

## Copia de Seguridad

La aplicación permite la exportación de toda la base de datos en un archivo JSON cifrado. Se recomienda realizar copias periódicas y almacenarlas en un soporte físico seguro. El proceso de importación restaura la configuración de seguridad y los registros, permitiendo la migración entre dispositivos sin intervención de terceros.

## Licencia

Este proyecto está bajo la Licencia MIT.