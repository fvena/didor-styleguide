# didor-styleguide

Genera una guía de estilo desde tu CSS, usando [YAML](http://en.wikipedia.org/wiki/YAML) en los comentarios.

#### [Ver un ejemplo](http://www.fvena.com/framework_didor/)


### Instalación
Didor-styleguide funcione en node. Está especialmente desarrollado para integrarse
en el [`Didor Starter Kit`](https://github.com/fvena/didor-starter-kit), por lo que deberías modificarlo para usarlo en otros
entornos.

```shell
$ npm install styleguidejs
```


### Modo de uso
Añade comentarios a tu código scss con tres asteríscos, será parseado como datos Yaml.
Las propiedades `section`, `name`, `description` y `ejemplo` son obligatorias.

````css
/***
  section: Buttons
  name: Square buttons
  description: |
    Very pretty square buttons

    ### States
    - ```.btn.btn-small``` - Button size small.
    - ```.btn.btn-medium``` - Button size medium.
    - ```.btn.btn-large``` - Button size large.
  statuses: [btn-small, btn-medium, btn-large]
  example: |
    a.btn Button
    a.btn.btn-small button
    a.btn.btn-medium button
    a.btn.btn-large button
***/
````


````js
var StyleGuide = require('didor-styleguide');
sg = new StyleGuide();

sg.addFile("main.scss");
sg.render({
  logo: './app/assets/images/logo.png',
  css: './.tmp/styles/main.css',
  outputFolder: './docs'
  });
````


### Personalizar
Sientete libre de modificar el estilo. Incluye tus propios css, js o tu propia
plantilla pug.

Tu puedes añadir tus propias propiedades(navegadores soportados, media-query, ...)
como datos Yaml, y usarlos luego en tu plantilla personalizada.

````js
var StyleGuide = require('didor-styleguide');
sg = new StyleGuide();

sg.addFile("main.scss");
sg.render({
  templateCss: "styleguide/style.css",
  templateJs: "styleguide/script.js",
  template: "styleguide/template.jade",
  logo: './app/assets/images/logo.png',
  css: './.tmp/styles/main.css',
  outputFolder: './docs'
  });
````

### Orden personalizado
Puedes cambiar el orden de aparición con la opción `sortBy`. Cualquier clave de
los datos Yaml puede usarse, como `name`, `section` o cualquiera que definas.
Si quieres mantener el orden en que aparecen en tu archivo, puedes usar `fileOrder`.

````js
// ...
sg.render({
    sortBy: ['section', 'title'], // default
    // ...
});
````


### Esconder elementos
Si quieres esconder un elemento, añade en sus datos Yaml `visible: false`, esto
lo ocultará en tu guía de estilos. Puede serte util mientras desarrollas un elemento
y no quieres que aparezca.

```css
/***
  section: Mi sección
  name: Mi nombre
  visible: false
  description: Mi descripción
  example:
    | ...
***/
```


### Gulp task
Mira [gulp-didor-styleguide](https://github.com/fvena/gulp-didor-styleguide) para
usar didor-styleguide como un plugin de gulp.
