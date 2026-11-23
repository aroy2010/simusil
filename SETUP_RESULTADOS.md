# Publicar el simulador y recibir resultados privados

El simulador es una página estática: GitHub Pages puede mostrarla, pero no guarda resultados por sí solo. Esta carpeta incluye un envío opcional a Google Sheets mediante Google Apps Script. No requiere exponer las notas en la web.

## 1. Prueba local

Abre `index.html` con un navegador. Para ensayar con un tiempo corto, abre `index.html?minutos=2`. No habrá envío mientras `resultsEndpoint` esté vacío.

## 2. Crear el registro privado en Google Sheets

1. Crea una hoja de cálculo de Google llamada, por ejemplo, **Resultados simulador Piero**.
2. Ve a **Extensiones → Apps Script**, elimina el contenido y pega lo siguiente. Reemplaza `ID_DE_TU_HOJA` por el identificador que aparece en la URL de la hoja, entre `/d/` y `/edit`.

```javascript
const SHEET_ID = 'ID_DE_TU_HOJA';
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Resultados') || SpreadsheetApp.openById(SHEET_ID).insertSheet('Resultados');
  if (sheet.getLastRow() === 0) sheet.appendRow(['Fecha', 'Estudiante', 'Puntaje', 'Total', 'Omisiones', 'Tiempo (seg.)', 'Autoenvío', 'Matemática', 'Lenguaje', 'Respuestas', 'Detalle por competencia']);
  const m = data.areas['Matemática'], l = data.areas['Lenguaje'];
  sheet.appendRow([data.submittedAt, data.student, data.score, data.total, data.omitted, data.durationSeconds, data.autoSubmitted, `${m.correct}/${m.total}`, `${l.correct}/${l.total}`, data.answers.join(''), JSON.stringify(data.areas)]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
```

3. Pulsa **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: tu cuenta. Acceso: **Cualquier persona**. Autoriza la primera vez y copia la URL que termina en `/exec`.
4. Abre `config.js` y pega esa URL como valor de `resultsEndpoint`. Guarda el archivo.
5. Haz una prueba completa y comprueba que aparece una fila en la hoja. Comparte la hoja solo con el padre/tutor.

> La URL de Apps Script permitirá enviar resultados desde la página, pero no entrega una lista de resultados al visitante. La hoja no debe publicarse ni compartirse con el estudiante.

## 3. Publicar en GitHub Pages

1. Crea un repositorio **privado o público según prefieras** en tu propia cuenta de GitHub. Para una URL accesible a Piero sin iniciar sesión, GitHub Pages debe estar disponible públicamente.
2. Sube el contenido de esta carpeta: `index.html`, `styles.css`, `app.js` y `config.js`.
3. En el repositorio entra a **Settings → Pages**. En “Build and deployment”, elige **Deploy from a branch**, selecciona `main` y la carpeta `/(root)`, luego guarda.
4. GitHub mostrará la URL exacta de publicación. Envíale únicamente esa URL a Piero.

Nunca subas la hoja de cálculo ni credenciales de Google al repositorio. El archivo `config.js` solo contiene la URL pública de recepción de Apps Script; no contiene contraseñas.

## Uso para el padre

El estudiante verá solo el mensaje de finalización. El reporte detallado queda en la hoja privada: puntaje, omisiones, tiempo, resultados por área, respuestas y un detalle por competencia. No se incluye una «clave de padre» en la página, porque cualquier clave incrustada en una web pública podría inspeccionarse; la privacidad real la proporciona la hoja de cálculo compartida únicamente contigo.
