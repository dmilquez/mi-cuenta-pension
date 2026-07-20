# Mi Cuenta Pensión

Calculadora en español que guarda nombre, sexo para el cálculo legal y fecha
de nacimiento en una cookie del dispositivo. Muestra una cuenta regresiva hasta
la edad general de pensión en Colombia: 57 años para mujeres y 62 para hombres.

## Desarrollo

```bash
npm ci
npm run dev
```

## Pruebas

```bash
npm test
```

Las pruebas cubren las edades configuradas, cumpleaños en año bisiesto,
desglose del contador, fechas ya cumplidas, privacidad de la cookie y renderizado
de la interfaz.

## GitHub Pages

El flujo `.github/workflows/pages.yml` compila, prueba, exporta y publica el
sitio automáticamente al enviar cambios a `main`. En la configuración del
repositorio, Pages debe usar **GitHub Actions** como origen.
