# 💶 Expensor — Control de gastos

Aplicación web para llevar un control dinámico de ingresos y gastos, con
múltiples "casos" (escenarios de presupuesto), histórico mensual y sin
necesidad de servidor ni base de datos: todo vive en tu navegador y se puede
exportar/importar como un único CSV.

## Características

- **Casos**: crea distintos escenarios de presupuesto (p. ej. "Ahora" vs.
  "Con hipoteca"), duplícalos para comparar o crea uno nuevo desde cero.
- **Presupuesto**: ingresos y gastos organizados en categorías/conceptos
  editables, con importe mensual y anual (× 12) calculado automáticamente.
- **Histórico**: registra los importes reales mes a mes (a partir del
  presupuesto vigente) para comparar presupuesto vs. realidad y ver la
  evolución en un gráfico.
- **Resumen**: totales de ingresos, gastos y ahorro, desglose por categoría y
  evolución histórica.
- **CSV como "base de datos"**: exporta todo (casos, presupuestos, histórico)
  a un único CSV y vuelve a importarlo cuando quieras, en cualquier
  dispositivo, sin depender de ningún servidor.
- **localStorage**: mientras trabajas, todo se autoguarda en el navegador, así
  que no hace falta reimportar el CSV cada vez que abres la app.

## Desarrollo local

Requisitos: Node.js 22+.

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

Otros comandos:

```bash
npm run build    # compila a dist/
npm run preview  # sirve el build de producción localmente
npm run lint     # oxlint
```

## Docker

La app es 100% estática (sin backend), así que el contenedor solo compila y
sirve los archivos con nginx.

```bash
docker compose up --build
```

Disponible en http://localhost:8080.

Para construir la imagen manualmente:

```bash
docker build -t expensor-web-app .
docker run -p 8080:80 expensor-web-app
```

## Despliegue en GitHub Pages

El repo incluye `.github/workflows/deploy.yml`, que compila la app y la
publica en GitHub Pages en cada push a `main`.

Para activarlo en tu repositorio:

1. Ve a **Settings → Pages**.
2. En "Build and deployment", selecciona **Source: GitHub Actions**.
3. Haz push a `main` (o ejecuta el workflow manualmente desde la pestaña
   Actions) y la web quedará publicada en
   `https://<usuario>.github.io/<repositorio>/`.

La app usa rutas en modo *hash* (`/#/presupuesto`, etc.) y rutas de assets
relativas, por lo que funciona tanto en la raíz de un dominio como en un
subdirectorio de GitHub Pages sin configuración adicional.

También hay un workflow `.github/workflows/ci.yml` que compila y lintea en
cada push/PR.

## Formato del CSV

El botón **Datos → Exportar** descarga un único CSV con una fila por
concepto. Columnas:

| Columna | Significado |
|---|---|
| `tipo` | `CASO`, `INGRESO`, `GASTO` o `HISTORICO` |
| `caso_id` | identificador interno del caso |
| `caso_nombre` | nombre del caso (solo en filas `CASO`) |
| `seccion` | `ingreso` o `gasto` |
| `categoria` | categoría del concepto (`Ingresos` para ingresos) |
| `concepto` | nombre del concepto (ej. "Gasolina") |
| `importe_mensual` | importe mensual presupuestado |
| `mes` | mes en formato `YYYY-MM` (solo filas `HISTORICO`) |
| `importe_real` | importe real de ese mes (solo filas `HISTORICO`) |
| `notas` | notas del mes (solo filas `HISTORICO`) |

Puedes editar este CSV a mano en Excel/Google Sheets (los importes admiten
tanto `1234.56` como el formato español `1.234,56 €`) y volver a importarlo
desde **Datos → Importar**. La importación sustituye todos los datos
guardados en el navegador actual.

## Stack técnico

React 19 + TypeScript + Vite, Tailwind CSS 4, Zustand (estado +
persistencia en `localStorage`), React Router (`HashRouter`), Recharts para
los gráficos y PapaParse para el CSV.
