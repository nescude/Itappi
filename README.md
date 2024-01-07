# Itappi

<h1>🇬🇧 English</h1>

An app to create your own italian dictionary and to learn testing your knowledge. Currently only between italian-spanish, it may change in the future to support more languages.
  
<h2>📖 Features</h2>
  <ul>
    <li>Translation creation, deletion</li>
    <li>Theme creation, deletion</li>
    <li>Translation grouping by theme</li>
    <li>Practice Mode: Challenge to remember the translations of a specific theme</li>
    <li>Translation similarity system in Practice Mode</li>
    <li>Export translations to QR code (Uploads the words to a cloud database)</li>
    <li>Scan QR code to import translations from another device</li>
  </ul>


<h2>📷 Screenshots</h2>
<div>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-main-screen.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-add-translation.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-quiz-almost.jpeg" width="250"/>
</div>
<div>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-quiz-correct.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-qr-export.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-qr-scan.jpeg" width="250"/>
</div>

<h2>⚙️ Techs</h2>
  
Powered by Expo, Typescript & SQLite. Package manager: npm. It can be built to get an Android or iOS application.

<h2>✔️ Releases</h2>

There will not be any compiled version of the app in the near future. You can download the source code and compile it yourself. A proper cloud database is required for the app to work, see <b>Getting Started</b> for more info.
  
<h2>🪄 Getting Started</h2>

First step is to download the source code, via 'git clone' or dowloading the source code from 'Releases'.

  <ul>
    <li><code>git clone https://github.com/nescude/Itappi</code></li>
    <li><hlink>https://github.com/nescude/Itappi/releases</hlink></li>
  </ul>

Next step is to install npm dependencies (inside your Itappi folder).

<code>npm install</code>

Make sure you have JDK (for Java 11) installed and JAVA_HOME setted correctly.

For the export QR and scan QR functionality to work you have to configure a cloud database. Firebase realtime database was used but you can use anything that stores .json files. You can see an example of the export format in <hlink>/examples/export.json</hlink>.

Once you have your DB url paste it in your app.json (Not currently implemented, paste it in /src/utils/JsonAPIs.ts -> URL).

If everything is ok you can now build your project with Expo EAS. Do not forget to change EAS's projectId in app.json.

Feel free to report any bug you find!

  
<h1>🇪🇸 Spanish</h1>
  Una aplicación para crear tu propio diccionario en italiano y poner a prueba tu conocimiento en pequeños desafíos. Actualmente solo funciona entre italiano-español. En el futuro puede agregarse soporte para más idiomas.
  
<h2>📖 Caracteristicas</h2>
  <ul>
    <li>Creación y eliminación de traducciones</li>
    <li>Creación y eliminación de temas</li>
    <li>Agrupado de traducciones en temas</li>
    <li>Modo práctica: Desafío para poner a prueba tus conocimientos de un tema específico</li>
    <li>Sistema de similaridad / cercania de traducciones en modo práctica</li>
    <li>Exporta traducciones mediante un código QR (Sube las traducciones a la nube y genera un QR con el link)</li>
    <li>Escanea un código QR para importar las traducciones de otro dispositivo</li>
  </ul>


<h2>📷 Capturas</h2>
<div>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-main-screen.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-add-translation.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-quiz-almost.jpeg" width="250"/>
</div>
<div>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-quiz-correct.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-qr-export.jpeg" width="250"/>
  <img src="https://github.com/nescude/Itappi/blob/main/assets/screenshots/itappi-qr-scan.jpeg" width="250"/>
</div>

<h2>⚙️ Tecnologías</h2>
  
Utiliza Expo, Typescript y SQLite. Gestor de paquetes: npm. Se pueden crear versiones para Android y iOS.

<h2>✔️ Releases</h2>

No habrá ninguna versión compilada en el futuro próximo. Se puede descargar el código fuente y compilarlo uno mismo. Se necesita una base de datos en la nube para exportar/importar traducciones por lo que no se puede ofrecer una versión compilada. Ver más en <b>¿Cómo empezar?</b>.
There will not be any compiled version of the app in the near future. You can download the source code and compile it yourself. A proper cloud database is required for the app to work, see <b>Getting Started</b> for more info.
  
<h2>🪄 ¿Cómo empezar?</h2>

Primero se debe descargar el código fuente, mediante 'git clone' o descargandolo directamente de 'Releases'.

  <ul>
    <li><code>git clone https://github.com/nescude/Itappi</code></li>
    <li><hlink>https://github.com/nescude/Itappi/releases</hlink></li>
  </ul>

El siguinte paso es instalar las librerias de npm (Dentro del directorio Itappi).

<code>npm install</code>

Asegurarse de tener JDK (para Java 11) instalado y JAVA_HOME configurado correctamente.

Para que la función de exportar/importar traducciones funcione se debe configurar una base de datos remota . Firebase realtime database se usó para probar, pero se puede utilizar cualquier base de datos que almacene archivos json. Se puede ver un ejemplo del formato exportado en <hlink>/examples/export.json</hlink>.

Una vez que se tenga la direccion URL del base de datos pegarla en app.json (No funciona de momento, en vez de eso pegarla en: /src/utils/JsonAPIs.ts -> URL).

Si todo funciona bien se puede generar una build con Expo EAS. No olvidarse de cambiar el projectId de EAS en app.json.

¡Sientete libre de reportar cualquier bug!
