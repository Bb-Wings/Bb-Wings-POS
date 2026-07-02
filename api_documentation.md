# API Documentation — Products Catalog

Esta documentación detalla los endpoints de la API de Next.js para la gestión del catálogo de productos de BB Wings.

Todos los endpoints base están bajo el prefijo `/api/productos`.

---

## 1. Obtener catálogo de productos
Obtiene la lista de todos los productos o productos filtrados por búsqueda, categoría o disponibilidad.

- **URL:** `/api/productos`
- **Method:** `GET`
- **Auth Required:** No (Público)
- **Query Parameters:**
  - `search` (opcional): Filtro de búsqueda insensible a mayúsculas/minúsculas sobre el nombre del producto (ej: `?search=alitas`).
  - `categoria_id` (opcional): Filtro por ID de categoría numérica (ej: `?categoria_id=2`).
  - `disponible` (opcional): Filtro booleano por disponibilidad (ej: `?disponible=true` o `?disponible=false`).

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria_id": 2,
      "nombre": "Alitas BBQ",
      "descripcion": "Deliciosas alitas bañadas en salsa BBQ dulce.",
      "precio": 149.00,
      "precio_costo": 65.00,
      "slug": "alitas-bbq",
      "sku": "AL-BBQ-01",
      "codigo_barras": "7501234567890",
      "imagen_principal": "/images/menu/alitas-bbq.jpg",
      "calorias": 650,
      "es_nuevo": false,
      "es_popular": true,
      "es_vegetariano": false,
      "es_picante": false,
      "nivel_picante": null,
      "tiempo_preparacion": 15,
      "disponible": true,
      "estado": "activo",
      "orden": 1,
      "created_at": "2026-07-02T16:00:00.000Z",
      "updated_at": "2026-07-02T16:00:00.000Z"
    }
  ]
}
```

---

## 2. Crear un nuevo producto
Inserta un nuevo producto en el catálogo de BB Wings.

- **URL:** `/api/productos`
- **Method:** `POST`
- **Auth Required:** Sí (Debe ser `admin` o `super_admin`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "categoria_id": 2,
  "nombre": "Alitas Buffalo Inferno",
  "descripcion": "Alitas extra picantes con salsa buffalo casera.",
  "precio": 159.00,
  "precio_costo": 70.00,
  "sku": "AL-BUF-INF",
  "imagen_principal": "/images/menu/buffalo-inferno.jpg",
  "calorias": 700,
  "es_nuevo": true,
  "es_popular": false,
  "es_vegetariano": false,
  "es_picante": true,
  "nivel_picante": 4,
  "tiempo_preparacion": 15,
  "disponible": true,
  "orden": 2
}
```

### Responses
- **201 Created:** Producto creado con éxito. Devuelve el registro completo incluyendo el ID generado y timestamps.
- **400 Bad Request:** Datos requeridos faltantes (`nombre`, `categoria_id`, `precio`).
- **401 Unauthorized:** No hay sesión de usuario activa.
- **403 Forbidden:** Sesión activa pero rol insuficiente (no es administrador).

---

## 3. Obtener un producto por ID
Obtiene los detalles de un producto específico mediante su ID.

- **URL:** `/api/productos/{id}` (ej: `/api/productos/2`)
- **Method:** `GET`
- **Auth Required:** No (Público)

### Responses
- **200 OK:** Retorna el objeto del producto.
- **404 Not Found:** El ID de producto no existe.

---

## 4. Actualizar un producto existente
Actualiza parcialmente los detalles de un producto.

- **URL:** `/api/productos/{id}`
- **Method:** `PUT`
- **Auth Required:** Sí (Debe ser `admin` o `super_admin`)
- **Headers:** `Content-Type: application/json`
- **Request Body:** Envía los campos que deseas actualizar (ej: cambiar precio o disponibilidad).
```json
{
  "precio": 165.00,
  "disponible": false
}
```

### Responses
- **200 OK:** Producto actualizado con éxito. Devuelve el objeto del producto modificado.
- **404 Not Found:** Producto no encontrado.
- **401 Unauthorized / 403 Forbidden:** Error de permisos.

---

## 5. Eliminar un producto
Remueve un producto permanentemente del catálogo.

- **URL:** `/api/productos/{id}`
- **Method:** `DELETE`
- **Auth Required:** Sí (Debe ser `admin` o `super_admin`)

### Responses
- **200 OK:** `{ "success": true, "message": "Producto eliminado con éxito" }`
- **500 Internal Server Error:** Ocurre si hay dependencias activas (ej: detalles de pedidos existentes que referencian al producto) que bloquean la eliminación debido a restricciones de integridad referencial.
