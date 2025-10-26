# front-web

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## Custom alert notifications

The app now renders frontend notifications through a reusable component. Any existing `alert(...)` or `window.alert(...)` call will show a styled toast instead of the browser dialog. You can also trigger typed messages manually:

- `alert.success('Operación realizada correctamente')`
- `alert.error('Algo salió mal', { duration: 6000 })`
- Inside Vue components, `this.$alert({ message: 'Listo', type: 'info' })`

## Custom confirm dialog

Calls to `confirm(...)` now open a non-blocking modal dialog. Always `await` the result:

- `const accepted = await confirm('¿Seguro?')`
- With options: `await confirm({ message: 'Eliminar?', title: 'Confirmar', confirmText: 'Sí', cancelText: 'No' })`
- From options API: `const ok = await this.$confirm({ message: 'Continuar' })`

> ℹ️ Since the dialog is asynchronous, review legacy code before adding conditions like `if (confirm(...))`; convert them to `const confirmed = await confirm(...)`.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
