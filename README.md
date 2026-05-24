# MapGestion Landing

Landing page estatica para presentar MapGestion.

## Publicacion gratis

Este proyecto esta preparado para desplegarse en `GitHub Pages`.

## Estructura

- `index.html`: archivo principal para Pages
- `sandbox-mapa.html`: demo interactiva del mapa
- `assets/screenshots/`: capturas reales del sistema

## Backlog de producto para la app

Este checkout no contiene la app `app.mapgestion.com`; las tareas de abajo deben aplicarse en el repo de la aplicacion cuando este disponible.

### P0 - Flujo de entrada y alta

- Agregar en login un link visible: "¿No tienes cuenta? Conoce MapGestion ->" hacia `https://mapgestion.com/`.
- Crear solicitudes de alta desde landing/app y revisarlas desde el panel de programador.
- Convertir el panel de programador en wizard: crear empresa, asignar plan, poblar feature gates, crear admin inicial y enviar bienvenida.

### P0 - Modelo de empresa y billing manual

Agregar estos campos al documento de empresa aunque los cobros sigan siendo manuales:

```json
{
  "plan": "basico | intermedio | avanzado | ultra",
  "planVigenciaHasta": "Timestamp",
  "estadoSuscripcion": "trial | activo | vencido"
}
```

### P1 - Feature gates

- Cambiar de opt-in rigido a opt-out con herencia por plan.
- Si una key no existe en `empresa.features`, heredar el default del plan.
- Usar overrides explicitos solo para desactivar o activar excepciones por empresa.

### P1 - Onboarding y estados vacios

- Mostrar checklist en dashboard: dibujar mapa, agregar usuarios, definir estados y registrar primera unidad.
- Agregar empty states con CTA en vistas vacias, por ejemplo: "Aun no tienes unidades registradas - Agregar primera unidad ->".
- Preparar `/app/onboarding` para que eventualmente sea autoservicio.

### P2 - UX, mobile y operacion

- Migrar primero Admin/Gestion fuera de `legacy-stage.js`; despues Cuadre y Cola de preparacion.
- Probar drag and drop del mapa en Chrome Android de gama media.
- Validar grabacion de audio en mensajes moviles.
- Revisar manifest PWA, iconos y service worker offline para mapa/cuadre.
- Automatizar `bump-sw.js` en el deploy para no olvidar invalidar cache.
- Verificar reCAPTCHA Enterprise para `app.mapgestion.com`.

### P2 - Analytics

- Integrar GA4 o Plausible.
- Medir usuarios activos por empresa, vistas mas usadas, tiempo en app y abandono del onboarding.

## Despliegue

1. Sube este proyecto a un repositorio de GitHub.
2. En GitHub, ve a `Settings > Pages`.
3. En `Build and deployment`, elige `Deploy from a branch`.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda y espera a que GitHub publique el sitio.

La URL final quedara con este formato:

`https://TU-USUARIO.github.io/TU-REPO/`
