# 🐛 DEBUG: Botón "Cobrar" no funciona

## 📅 Fecha: 11 de octubre de 2025

---

## 🔍 Problema Reportado

**Usuario dice:** "en cobranzas al hacer click en cobrar no funciona"

---

## 🛠️ Cambios Realizados para Debug

He agregado **console.logs detallados** y **manejo de errores** en ambos botones "Cobrar":

### Ubicaciones modificadas:
1. ✅ Tabla "Vencen Hoy" - botón Cobrar
2. ✅ Tabla "Cuotas Vencidas" - botón Cobrar

### Código agregado:
```typescript
<Button size="sm" onClick={async () => {
  try {
    console.log('🔵 Cobrar clicked for sale:', i.saleId)
    const res = await fetch(`/api/sales/${i.saleId}`)
    console.log('🔵 Fetch response status:', res.status)
    const ok = await handleApiResponse(res)
    if (!ok) {
      console.log('❌ handleApiResponse returned null')
      return
    }
    const data = await res!.json()
    console.log('✅ Sale data loaded:', data)
    setScheduleSale(data)
    setPayInstallmentId(i.id)
    setPayAmount(String(remaining.toFixed(2)))
    setPayMethod("CASH")
    console.log('✅ Opening payment dialog')
    setIsPayOpen(true)
  } catch (error) {
    console.error('❌ Error in Cobrar button:', error)
    toast({ 
      title: "Error", 
      description: "No se pudo cargar la información de la venta",
      variant: "destructive" as any
    })
  }
}}>Cobrar</Button>
```

---

## 📋 Instrucciones de Testing

### 1. **Abrir la consola del navegador**
   - Chrome/Edge: `F12` o `Ctrl+Shift+I`
   - Pestaña "Console"

### 2. **Navegar a Cobranzas**
   - Ir a http://localhost:3001/admin
   - Hacer login si es necesario
   - Click en tab "Cobranzas"

### 3. **Hacer click en un botón "Cobrar"**
   - Click en cualquier botón "Cobrar" de las tablas
   - **Observar la consola**

---

## 🎯 Posibles Escenarios y Soluciones

### Escenario 1: Error 401 (No autenticado)

**Console muestra:**
```
🔵 Cobrar clicked for sale: 123
🔵 Fetch response status: 401
❌ handleApiResponse returned null
```

**Toast muestra:**
```
Sesión expirada
Vuelve a iniciar sesión
```

**Solución:**
- ✅ Ir a `/login` y autenticarse
- ✅ Volver a /admin

---

### Escenario 2: Error 404 (Venta no existe)

**Console muestra:**
```
🔵 Cobrar clicked for sale: 999
🔵 Fetch response status: 404
❌ handleApiResponse returned null
```

**Toast muestra:**
```
Error
Operación fallida
```

**Solución:**
- ⚠️ La venta con ese ID no existe en la base de datos
- ⚠️ Verificar que la DB esté poblada correctamente
- ⚠️ Ejecutar `npm run seed` si es necesario

---

### Escenario 3: Error 500 (Error del servidor)

**Console muestra:**
```
🔵 Cobrar clicked for sale: 123
🔵 Fetch response status: 500
❌ handleApiResponse returned null
```

**Toast muestra:**
```
Error
{mensaje de error del servidor}
```

**Solución:**
- 🔧 Revisar logs del servidor (terminal donde corre `npm run dev`)
- 🔧 Verificar que Prisma esté conectado a la DB
- 🔧 Verificar que el endpoint `/api/sales/[id]/route.ts` funcione

---

### Escenario 4: Datos no incluyen installments

**Console muestra:**
```
🔵 Cobrar clicked for sale: 123
🔵 Fetch response status: 200
✅ Sale data loaded: { id: 123, total: 1000, ... } (SIN installments)
✅ Opening payment dialog
```

**Problema:**
- El diálogo se abre PERO el selector de cuotas está vacío
- No se puede procesar el pago correctamente

**Solución:**
- 🔧 Verificar que `/api/sales/[id]/route.ts` incluya `include: { installments: true }`

---

### Escenario 5: Diálogo se abre correctamente

**Console muestra:**
```
🔵 Cobrar clicked for sale: 123
🔵 Fetch response status: 200
✅ Sale data loaded: { id: 123, installments: [...], ... }
✅ Opening payment dialog
```

**Resultado:**
- ✅ El diálogo de pago se abre
- ✅ Se muestra "Venta #123"
- ✅ El campo "Monto" está prellenado
- ✅ El campo "Método" está en "Efectivo"
- ✅ El selector de cuotas muestra las cuotas disponibles

**Si el diálogo NO se ve:**
- 🎨 Problema de CSS/z-index
- 🎨 El diálogo está detrás de otros elementos
- 🎨 Inspeccionar con DevTools para ver si el elemento existe en el DOM

---

### Escenario 6: Error de red (no hay conexión)

**Console muestra:**
```
🔵 Cobrar clicked for sale: 123
❌ Error in Cobrar button: TypeError: Failed to fetch
```

**Toast muestra:**
```
Error
No se pudo cargar la información de la venta
```

**Solución:**
- 🌐 Verificar que el servidor esté corriendo
- 🌐 Verificar conexión a internet
- 🌐 Verificar URL del API

---

## 🔧 Verificaciones Adicionales

### 1. Verificar que el servidor esté corriendo
```bash
# Terminal debería mostrar:
✓ Ready in X.Xs
Local: http://localhost:3001
```

### 2. Verificar que estés autenticado
```bash
# En la consola del navegador:
document.cookie
# Debería contener una cookie de sesión
```

### 3. Verificar que el endpoint funcione
```bash
# En una nueva pestaña del navegador, ir a:
http://localhost:3001/api/sales/1

# Debería devolver JSON con los datos de la venta
```

### 4. Verificar que la DB tenga datos
```bash
# En terminal:
npx prisma studio

# Abrir tabla "Sale" y verificar que hay registros
# Abrir tabla "Installment" y verificar que hay cuotas asociadas
```

---

## 📝 Próximos Pasos

### Si el problema persiste:

1. **Compartir los logs de la consola**
   - Screenshot de la consola del navegador
   - Copiar y pegar los mensajes completos

2. **Compartir los logs del servidor**
   - Output del terminal donde corre `npm run dev`
   - Cualquier error que aparezca

3. **Verificar el endpoint**
   - Revisar `app/api/sales/[id]/route.ts`
   - Asegurarse de que incluya:
     ```typescript
     include: {
       client: true,
       installments: {
         include: { payments: true },
         orderBy: { number: 'asc' }
       },
       financingMethod: true
     }
     ```

---

## ✅ Compilación

```bash
✓ No errors found
✓ Console logs agregados
✓ Error handling mejorado
✓ Listo para debugging
```

---

## 🎯 Resultado Esperado

Después de estos cambios, cuando hagas click en "Cobrar":

1. ✅ La consola mostrará logs detallados
2. ✅ Si hay un error, verás exactamente dónde y por qué
3. ✅ Si funciona, verás el flujo completo hasta abrir el diálogo
4. ✅ Si hay un problema de red/API, verás un toast con el error

**Ahora podrás saber exactamente qué está pasando cuando haces click en "Cobrar".** 🔍
