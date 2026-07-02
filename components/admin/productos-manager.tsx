'use client'

/**
 * @fileoverview Products Manager — BB Wings Admin Panel
 * @description Gestor interactivo de productos con catálogo, filtros y CRUD completo.
 * @version 1.0.0
 */

import { useState, useTransition } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Flame,
  Star,
  Clock,
  Sparkles,
  Leaf,
  Power,
  Package,
} from "lucide-react";
import type { DbProducto } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/lib/store/ui.store";
import { formatCurrency } from "@/lib/utils/formatters";
import { ProductoForm } from "@/components/admin/producto-form";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductosManagerProps {
  initialProducts: DbProducto[];
  categorias: Categoria[];
}

export function ProductosManager({ initialProducts, categorias }: ProductosManagerProps) {
  const [products, setProducts] = useState<DbProducto[]>(initialProducts || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DbProducto | null>(null);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleAddClick = () => {
    setIsCreateOpen(true);
  };

  const handleEditClick = (product: DbProducto) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (product: DbProducto) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // Toggle Availability
  const handleToggleDisponible = async (product: DbProducto) => {
    const nextDisponible = !product.disponible;
    // Local optimista
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, disponible: nextDisponible } : p))
    );

    try {
      const response = await fetch(`/api/productos/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponible: nextDisponible }),
      });
      const result = await response.json();

      if (!result.success) {
        // Revertir
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, disponible: product.disponible } : p))
        );
        toast.error("Error", result.error || "No se pudo actualizar el estado de disponibilidad.");
      } else {
        toast.success(
          "Estado actualizado",
          `"${product.nombre}" ahora está ${nextDisponible ? "Disponible" : "Agotado"}.`
        );
      }
    } catch {
      // Revertir
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, disponible: product.disponible } : p))
      );
      toast.error("Error", "Error de conexión al actualizar disponibilidad.");
    }
  };

  // DELETE Product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/productos/${selectedProduct.id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
          toast.success("Producto eliminado", `"${selectedProduct.nombre}" se eliminó del catálogo.`);
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        } else {
          toast.error("Error al eliminar", result.error || "Asegúrate de que no existan pedidos asociados.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  // ─── Filters ──────────────────────────────────────────────────────────────

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.categoria_id.toString() === selectedCategory;

    const matchesAvailability =
      selectedAvailability === "all" ||
      (selectedAvailability === "disponible" && product.disponible) ||
      (selectedAvailability === "no_disponible" && !product.disponible);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ─── Control Bar ─── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          background: "rgba(30, 30, 30, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", flex: 1, minWidth: "280px" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                color: "rgba(255, 255, 255, 0.35)",
              }}
            />
            <Input
              placeholder="Buscar por nombre, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: "36px",
                background: "rgba(0,0,0,0.2)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#fff",
                height: "40px",
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              height: "40px",
              borderRadius: "0.5rem",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.75)",
              padding: "0 12px",
              fontSize: "0.85rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all" style={{ background: "#1a1a1a", color: "#fff" }}>Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id.toString()} style={{ background: "#1a1a1a", color: "#fff" }}>
                {cat.nombre}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            style={{
              height: "40px",
              borderRadius: "0.5rem",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.75)",
              padding: "0 12px",
              fontSize: "0.85rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all" style={{ background: "#1a1a1a", color: "#fff" }}>Todos los estados</option>
            <option value="disponible" style={{ background: "#1a1a1a", color: "#fff" }}>Disponible</option>
            <option value="no_disponible" style={{ background: "#1a1a1a", color: "#fff" }}>Agotado</option>
          </select>
        </div>

        <Button
          onClick={handleAddClick}
          className="bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-300"
          style={{ height: "40px", display: "flex", gap: "8px", borderRadius: "8px" }}
        >
          <Plus className="w-4 h-4" /> Agregar Producto
        </Button>
      </div>

      {/* ─── Grid de Productos ─── */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "5rem 2rem",
            background: "rgba(30,30,30,0.2)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            color: "rgba(255,255,255,0.35)",
            gap: "12px",
          }}
        >
          <Package className="w-12 h-12" />
          <p style={{ fontSize: "0.95rem" }}>No se encontraron productos coincidentes.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredProducts.map((product) => {
            const cat = categorias.find((c) => c.id === product.categoria_id);
            return (
              <div
                key={product.id}
                style={{
                  background: "#1e1e1e",
                  border: `1px solid ${product.disponible ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"}`,
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  opacity: product.disponible ? 1 : 0.65,
                  transition: "all 0.3s ease",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Image / Header */}
                <div style={{ position: "relative", height: "160px", background: "#151515", overflow: "hidden" }}>
                  {product.imagen_principal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imagen_principal}
                      alt={product.nombre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.15)" }}>
                      <Package style={{ width: "40px", height: "40px" }} />
                    </div>
                  )}

                  {/* Badges Container */}
                  <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {product.es_nuevo && (
                      <Badge variant="warning" size="sm">
                        <Sparkles className="w-2.5 h-2.5" /> Nuevo
                      </Badge>
                    )}
                    {product.es_popular && (
                      <Badge variant="secondary" size="sm">
                        <Star className="w-2.5 h-2.5 fill-current" /> Popular
                      </Badge>
                    )}
                    {product.es_vegetariano && (
                      <Badge variant="success" size="sm">
                        <Leaf className="w-2.5 h-2.5" /> Veggie
                      </Badge>
                    )}
                    {product.es_picante && (
                      <Badge variant="danger" size="sm">
                        <Flame className="w-2.5 h-2.5" /> Picante {"🌶️".repeat(product.nivel_picante || 1)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                      {product.nombre}
                    </h3>
                    <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f97316" }}>
                      {formatCurrency(product.precio)}
                    </span>
                  </div>

                  {product.sku && (
                    <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
                      SKU: {product.sku}
                    </span>
                  )}

                  {product.descripcion && (
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: "4px 0" }}>
                      {product.descripcion}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "8px" }}>
                    {cat && <Badge variant="default" size="sm">{cat.nombre}</Badge>}
                    {product.tiempo_preparacion && (
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock className="w-3.5 h-3.5" /> {product.tiempo_preparacion} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "10px 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleDisponible(product)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "transparent",
                      border: "none",
                      color: product.disponible ? "#2ecc71" : "rgba(255,255,255,0.3)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Power className={`w-3.5 h-3.5 transition-transform duration-300 ${product.disponible ? "rotate-90" : ""}`} />
                    {product.disponible ? "Disponible" : "Agotado"}
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleEditClick(product)}
                      title="Editar"
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#ea580c";
                        e.currentTarget.style.background = "rgba(234, 88, 12, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      title="Eliminar"
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal: AGREGAR PRODUCTO ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Agregar nuevo producto al menú"
        description="Ingresa los datos para registrar un nuevo platillo o bebida."
        size="xl"
      >
        <ProductoForm
          mode="create"
          categorias={categorias}
          onSubmit={async (data) => {
            startTransition(async () => {
              try {
                const response = await fetch("/api/productos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                const result = await response.json();

                if (result.success) {
                  setProducts((prev) => [...prev, result.data].sort((a, b) => a.orden - b.orden));
                  toast.success("Producto creado", `"${result.data.nombre}" se agregó correctamente.`);
                  setIsCreateOpen(false);
                } else {
                  toast.error("Error", result.error || "No se pudo crear el producto.");
                }
              } catch {
                toast.error("Error", "Error de conexión con el servidor.");
              }
            });
          }}
          onCancel={() => setIsCreateOpen(false)}
          isPending={isPending}
        />
      </Modal>

      {/* ─── Modal: EDITAR PRODUCTO ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Editar: ${selectedProduct?.nombre || ""}`}
        description="Modifica los detalles del producto seleccionado."
        size="xl"
      >
        <ProductoForm
          mode="edit"
          categorias={categorias}
          initialData={selectedProduct}
          onSubmit={async (data) => {
            if (!selectedProduct) return;
            startTransition(async () => {
              try {
                const response = await fetch(`/api/productos/${selectedProduct.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                const result = await response.json();

                if (result.success) {
                  setProducts((prev) =>
                    prev.map((p) => (p.id === selectedProduct.id ? result.data : p)).sort((a, b) => a.orden - b.orden)
                  );
                  toast.success("Producto actualizado", `"${result.data.nombre}" se guardó correctamente.`);
                  setIsEditOpen(false);
                  setSelectedProduct(null);
                } else {
                  toast.error("Error", result.error || "No se pudo actualizar el producto.");
                }
              } catch {
                toast.error("Error", "Error de conexión con el servidor.");
              }
            });
          }}
          onCancel={() => setIsEditOpen(false)}
          isPending={isPending}
        />
      </Modal>

      {/* ─── Modal: ELIMINAR PRODUCTO ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={`¿Eliminar "${selectedProduct?.nombre}"?`}
        description="Esta acción es permanente y no se puede deshacer."
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            ¿Estás seguro de que deseas eliminar este producto del menú? Si el producto ya se ha vendido o está referenciado en un pedido histórico, la base de datos impedirá la eliminación directa para conservar la integridad.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <Button type="button" onClick={() => setIsDeleteOpen(false)} style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteProduct} disabled={isPending} style={{ background: "#ef4444", color: "#fff" }}>
              {isPending ? "Eliminando..." : "Eliminar Producto"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
