Simulador de barra de tragos

Es un simulador de un bar hecho con JavaScript. Tiene la administración del bar y el ingreso al bar.

Cómo se usa

Administración del bar
- Se completa nombre, precio y stock y se toca Agregar para sumar un trago a la carta. Con Buscar Trago se filtra la carta mientras se escribe.
- Cada trago tiene un botón Eliminar para sacarlo de la carta.
- Restablecer bar borra todo lo guardado y vuelve a la carta original.
- La carta (con su stock), los pedidos y el ingreso se guardan en localStorage, así que no se pierden al refrescar la página.

Ingreso al Bar
- Se pone la edad y se toca Ingresar. Solo pueden entrar mayores de 18.
- Se pueden pedir hasta 2 tragos con el botón Pedir y abajo aparece la cuenta con el total.


Archivos

- `index.html`
- `css/style.css`
- `js/main.js`
- `data.json` (la carta de tragos, funciona como base de datos)

Fetch y librerías
- Al entrar, la carta se pide con fetch("./data.json") usando async/await con try/catch/finally. Mientras carga se ve "Cargando carta...". Si la respuesta no es ok o falla la red, se muestra una notificación de error.
- Para probar el error se puede cambiar la ruta del fetch en obtenerTragos (por ejemplo "./datos.json").
- Hay que abrir el proyecto con un servidor (por ejemplo Live Server de VS Code), porque abriendo el index.html con doble click el navegador bloquea el fetch.
- Librería (por CDN): SweetAlert2 para los avisos al usuario (carta cargada, errores, tragos agregados/eliminados, pedidos, acceso denegado y confirmación para restablecer el bar).

Asincronismo
- A los 3 segundos de entrar aparece un aviso de happy hour con setTimeout.
- Pedir un trago usa try/catch/finally: si el trago no tiene stock se muestra un mensaje de error.
