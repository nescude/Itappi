# Itappi

<h1>🇬🇧 English</h1>

An app to create your own italian dictionary and to learn testing your knowledge. Currently only between italian-spanish, it may change in the future to support more languages.
  
<h2>📖 Features</h2>
  <ul>
    <li>Translation creation, deletion</li>
    <li>Theme creation, deletion</li>
    <li>Translation grouping by theme</li>
    <li>Practice Mode: Taken translations of a theme to play a practice game</li>
    <li>Similarity system in Practice Mode</li>
    <li>Export translations to QR code (Uploads the words to a cloud database)</li>
    <li>Scan QR code to import translations from another device</li>
  </ul>
  
<h2>⚙️ Techs</h2>
  
Powered by Expo. Typescript. It can be built to get an Android or iOS application.

<h2>✔️ Releases</h2>

There will not be any compiled version of the app in the near future. You can download the source code and compile it yourself. A proper cloud database is required for the app to work, see <b>Getting Started</b> for more info.
  
<h2>🪄 Getting Started</h2>

First step is to download the source code, via 'git clone' or dowloading the source code from 'Releases'

  <ul>
    <li><code>git clone https://github.com/nescude/Itappi</code></li>
    <li><hlink>https://github.com/nescude/Itappi/releases</hlink></li>
  </ul>

Next step is to install npm dependencies (inside your Itappi folder)

<code>npm install</code>

Make sure you have JDK installed and JAVA_HOME setted correctly.

For the export QR and scan QR functionality to work you have to configure a cloud database. Firebase realtime database was used but you can use anything that stores .json files. You can see an example of the export format in <hlink>/examples/export.json</hlink>.

Once you have your DB url paste it in your app.json (Not currently implemented, paste it in /src/utils/JsonAPIs.ts -> URL)

If everything is ok you can now build your project with Expo EAS. Do not forget to change EAS's projectId in app.json.

Feel free to report any bug you find!


  
<h1>🇪🇸 Spanish</h1>

  Una aplicación para aprender italiano. Actualmente solo funciona entre italiano-español. En el futuro puede agregarse soporte para más idiomas.



