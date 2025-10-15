# 🔍 DEBUG AVANZADO: Dialog No Se Ve

## 📅 Fecha: 11 de octubre de 2025

---

## 🎯 Próximos Pasos de Debugging

### 1. **Verificar Logs en Consola**

Después de hacer click en "Cobrar", deberías ver:

```
🔵 Cobrar clicked for sale: 3
🔵 Fetch response status: 200
✅ Sale data loaded: {...}
✅ Opening payment dialog with fee: 6.42
💰 isPayOpen changed to: true    ← NUEVO
💰 scheduleSale: {...}           ← NUEVO
💰 payAmount: "214.42"           ← NUEVO
💰 payInstallmentId: 123         ← NUEVO
💰 Payment Dialog onOpenChange: true  ← NUEVO
```

**Si NO ves estos logs:**
- Algo está impidiendo que se setee el estado
- Revisa la consola por errores

---

### 2. **Inspeccionar el DOM**

#### Cómo:
1. Hacer click en "Cobrar"
2. Abrir DevTools (F12)
3. Ir a pestaña "Elements" (Elementos)
4. Buscar (Ctrl+F) por: `dialog-content`

#### Qué buscar:

**Caso A: El elemento SÍ existe**
```html
<div data-slot="dialog-portal">
  <div data-slot="dialog-overlay" class="..."></div>
  <div data-slot="dialog-content" class="..." style="z-index: 9999">
    <div data-slot="dialog-header">
      <h2>Registrar pago</h2>
      ...
    </div>
  </div>
</div>
```
**Conclusión:** El dialog se renderiza pero **no es visible** (problema CSS)

**Caso B: El elemento NO existe**
```html
<!-- Nada con data-slot="dialog-content" -->
```
**Conclusión:** El dialog **no se está renderizando** (problema de estado/React)

---

### 3. **Verificar Estilos CSS**

Si el elemento existe en el DOM:

#### En DevTools:
1. Hacer click derecho en el elemento `dialog-content`
2. "Inspect" (Inspeccionar)
3. Ver el panel "Styles" (Estilos)
4. Buscar:
   - `display: none` ← Ocultándolo
   - `opacity: 0` ← Invisible
   - `visibility: hidden` ← No visible
   - `transform: translate(...)` ← Fuera de pantalla
   - `z-index: -1` ← Detrás de otros elementos

#### También verificar:
- El overlay (fondo oscuro) ¿se ve?
- ¿Hay algún error en la consola sobre CSS/animaciones?

---

### 4. **Descartar Conflictos de Tabs**

¿Estás en la pestaña "Cobranzas" del panel admin?

**Posible problema:**
El Dialog puede estar renderizándose **dentro de un TabsContent** que está oculto.

**Verificar:**
```tsx
<TabsContent value="cobranzas">
  {/* Todo el contenido de Cobranzas */}
  {/* ¿El Dialog está AQUÍ DENTRO? */}
</TabsContent>
```

**Solución:** Mover el Dialog **fuera** de TabsContent, al nivel raíz del componente.

---

### 5. **Test Simple: Alert**

Agreguemos un `alert` para confirmar que el código se ejecuta:

```typescript
<Button onClick={async () => {
  alert('CLICK!') // ← Agregar esto
  setIsScheduleOpen(false)
  // ... resto del código
}}>Cobrar</Button>
```

**Si NO ves el alert:**
- El onClick no se está ejecutando
- Hay un error silencioso

**Si SÍ ves el alert:**
- El onClick funciona
- El problema es después

---

## 🛠️ Soluciones Posibles

### Solución 1: Mover Dialog Fuera de Tabs

**ANTES:**
```tsx
<Tabs>
  <TabsContent value="cobranzas">
    {/* Contenido */}
  </TabsContent>
  
  {/* Dialog está DENTRO del Tabs */}
  <Dialog>...</Dialog>
</Tabs>
```

**DESPUÉS:**
```tsx
<Tabs>
  <TabsContent value="cobranzas">
    {/* Contenido */}
  </TabsContent>
</Tabs>

{/* Dialog está FUERA del Tabs */}
<Dialog>...</Dialog>
```

---

### Solución 2: Usar Portal Explícito

```tsx
import { createPortal } from 'react-dom'

{isPayOpen && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2>Registrar pago</h2>
      {/* ... contenido ... */}
    </div>
  </div>,
  document.body
)}
```

---

### Solución 3: Dialog Modal Simplificado

Reemplazar el Dialog de Radix por uno custom:

```tsx
{isPayOpen && (
  <div 
    className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
    onClick={() => setIsPayOpen(false)}
  >
    <div 
      className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4">Registrar pago</h2>
      {/* ... resto del contenido ... */}
      <Button onClick={() => setIsPayOpen(false)}>Cerrar</Button>
    </div>
  </div>
)}
```

---

## 📋 Checklist de Debugging

Marca lo que ya verificaste:

- [ ] Los logs de console.log aparecen
- [ ] `isPayOpen` cambia a `true`
- [ ] El elemento existe en el DOM (Inspector)
- [ ] El elemento tiene `z-index: 9999`
- [ ] No hay `display: none` en los estilos
- [ ] No hay errores en la consola
- [ ] El overlay (fondo oscuro) se ve
- [ ] Estás en la tab correcta
- [ ] No hay otro dialog abierto
- [ ] El alert() funciona si lo agregas

---

## 🎯 Información Necesaria

Para ayudarte mejor, necesito que me digas:

1. **¿Qué logs ves en la consola?** (copia y pega todos los que empiezan con 💰)

2. **¿El elemento existe en el DOM?** (busca `dialog-content` en Elements)

3. **¿Ves el fondo oscuro (overlay)?** o ¿no ves nada en absoluto?

4. **¿En qué tab estás?** (Cobranzas, Ventas, etc.)

5. **Screenshot** de:
   - La consola con los logs
   - El inspector de elementos buscando "dialog-content"

Con esta información podré darte una solución exacta. 🎯
