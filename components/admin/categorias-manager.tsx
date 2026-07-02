'use client'

/**
 * @fileoverview Categorias Manager — BB Wings Admin Panel
 * @description Gestor interactivo de categorías con catálogo, filtros y CRUD completo.
 * @version 1.0.0
 */

import { useState, useTransition } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Eye,
  EyeOff,
  AlertCircle,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import type { DbCategoria } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, StatCard } from "@/components/ui/card";
import { useToast } from "@/lib/store/ui.store";
import { CategoriaForm } from "@/components/admin/categoria-form";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface CategoriasManagerProps {
  initialCategories: DbCategoria[];
}

export function CategoriasManager({ initialCategories }: CategoriasManagerProps) {
  const [categories, setCategories] = useState<DbCategoria[]>(initialCategories || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DbCategoria | null>(null);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleAddClick = () => {
    setIsCreateOpen(true);
  };

  const handleEditClick = (category: DbCategoria) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (category: DbCategoria) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  // Toggle active state quickly
  const handleToggleActive = async (category: DbCategoria) => {
    const nextActiva = !category.activa;
    
    // Cambiar local optimista
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, activa: nextActiva } : c))
    );

    try {
      const response = await fetch(`/api/categorias/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: nextActiva }),
      });
      const result = await response.json();

      if (!result.success) {
        // Revertir
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, activa: category.activa } : c))
        );
        toast.error("Error", result.error || "No se pudo actualizar el estado de la categoría.");
      } else {
        toast.success(
          "Estado actualizado",
          `La categoría "${category.nombre}" ahora está ${nextActiva ? "Visible" : "Oculta"}.`
        );
      }
    } catch {
      // Revertir
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, activa: category.activa } : c))
      );
      toast.error("Error", "Error de conexión al actualizar el estado.");
    }
  };

  // DELETE Category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/categorias/${selectedCategory.id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
          toast.success("Categoría eliminada", `"${selectedCategory.nombre}" se eliminó correctamente.`);
          setIsDeleteOpen(false);
          setSelectedCategory(null);
        } else {
          toast.error("Error al eliminar", result.error || "No se pudo eliminar la categoría.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  // CREATE Category
  const handleCreateCategory = async (data: Partial<DbCategoria>) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (result.success) {
          setCategories((prev) => [...prev, result.data].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)));
          toast.success("Categoría creada", `"${data.nombre}" se agregó correctamente.`);
          setIsCreateOpen(false);
        } else {
          toast.error("Error al crear", result.error || "No se pudo crear la categoría.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  // EDIT Category
  const handleEditCategory = async (data: Partial<DbCategoria>) => {
    if (!selectedCategory) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/categorias/${selectedCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (result.success) {
          setCategories((prev) =>
            prev.map((c) => (c.id === selectedCategory.id ? result.data : c))
              .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
          );
          toast.success("Categoría actualizada", `"${data.nombre}" se actualizó correctamente.`);
          setIsEditOpen(false);
          setSelectedCategory(null);
        } else {
          toast.error("Error al actualizar", result.error || "No se pudo actualizar la categoría.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  // ─── Filters & Stats ──────────────────────────────────────────────────────

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && cat.activa) ||
      (statusFilter === "inactive" && !cat.activa);

    return matchesSearch && matchesStatus;
  });

  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.activa).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <StatCard
          title="Total de Categorías"
          value={String(totalCount)}
          icon={<Layers />}
          iconColor="primary"
        />
        <StatCard
          title="Categorías Activas"
          value={String(activeCount)}
          icon={<Eye />}
          iconColor="success"
        />
        <StatCard
          title="Categorías Ocultas"
          value={String(inactiveCount)}
          icon={<EyeOff />}
          iconColor="warning"
        />
      </div>

      {/* Control Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "1rem",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", flex: 1, minWidth: "260px", gap: "12px", alignItems: "center" }}>
          {/* Buscar */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                color: "rgba(255,255,255,0.3)",
              }}
            />
            <Input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px", height: "40px", background: "rgba(255, 255, 255, 0.02)" }}
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              height: "40px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              color: "#fff",
              padding: "0 12px",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all" style={{ background: "#111" }}>Todos los Estados</option>
            <option value="active" style={{ background: "#111" }}>Activas (Visibles)</option>
            <option value="inactive" style={{ background: "#111" }}>Inactivas (Ocultas)</option>
          </select>
        </div>

        <Button
          onClick={handleAddClick}
          style={{
            background: "linear-gradient(90deg, #d61f2c, #ea580c)",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 16px",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)",
          }}
        >
          <Plus className="w-4 h-4" /> Agregar Categoría
        </Button>
      </div>

      {/* Grid de Categorías */}
      {filteredCategories.length === 0 ? (
        <div
          style={{
            padding: "5rem 2rem",
            textAlign: "center",
            background: "rgba(255,255,255,0.01)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <Tag style={{ width: "36px", height: "36px", color: "rgba(255,255,255,0.2)" }} />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              No se encontraron categorías
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", margin: 0 }}>
              Intenta cambiar los términos de búsqueda o filtros aplicados
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              variant="glass"
              padding="none"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              }}
              className="hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
            >
              {/* Header con Imagen */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  background: cat.imagen_url ? `url(${cat.imagen_url}) center/cover no-repeat` : "linear-gradient(135deg, #1f1212 0%, #1c0e08 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!cat.imagen_url && (
                  <Tag style={{ width: "32px", height: "32px", color: "rgba(255,255,255,0.15)" }} />
                )}

                {/* Badges superiores */}
                <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* Badge de Orden */}
                  <div
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ArrowUpDown style={{ width: "10px", height: "10px", color: "#ea580c" }} />
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#fff" }}>
                      Orden: {cat.orden}
                    </span>
                  </div>

                  {/* Badge Estado */}
                  <Badge variant={cat.activa ? "success" : "default"}>
                    {cat.activa ? "Activa" : "Oculta"}
                  </Badge>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                  {cat.nombre}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.45)",
                    margin: 0,
                    lineHeight: 1.4,
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cat.descripcion || "Sin descripción proporcionada."}
                </p>

                {/* Acciones */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "12px",
                  }}
                >
                  {/* Toggle Activa */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    style={{
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: cat.activa ? "rgba(255,255,255,0.4)" : "#ea580c",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "4px 0",
                    }}
                  >
                    {cat.activa ? (
                      <>
                        <EyeOff style={{ width: "13px", height: "13px" }} /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye style={{ width: "13px", height: "13px" }} /> Mostrar
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleEditClick(cat)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.02)",
                        color: "rgba(255,255,255,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      }}
                    >
                      <Edit style={{ width: "14px", height: "14px" }} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cat)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid rgba(239,68,68,0.15)",
                        background: "rgba(239,68,68,0.03)",
                        color: "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.03)";
                      }}
                    >
                      <Trash2 style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ─── MODAL CREAR ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nueva Categoría"
        description="Agrega una nueva categoría para organizar los platillos y bebidas en tu menú."
      >
        <CategoriaForm
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCreateOpen(false)}
          isPending={isPending}
        />
      </Modal>

      {/* ─── MODAL EDITAR ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCategory(null);
        }}
        title="Editar Categoría"
        description="Modifica los campos del formulario para actualizar los datos de la categoría."
      >
        <CategoriaForm
          initialData={selectedCategory}
          onSubmit={handleEditCategory}
          onCancel={() => {
            setIsEditOpen(false);
            setSelectedCategory(null);
          }}
          isPending={isPending}
        />
      </Modal>

      {/* ─── MODAL ELIMINAR ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCategory(null);
        }}
        title="¿Eliminar Categoría?"
        description="Esta acción eliminará de forma permanente la categoría de la base de datos."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {selectedCategory && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "1rem",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.04)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <AlertCircle style={{ width: "20px", height: "20px", color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                  Advertencia sobre la categoría "{selectedCategory.nombre}"
                </h4>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "4px", margin: 0, lineHeight: 1.4 }}>
                  No podrás eliminar esta categoría si contiene productos activos vinculados. Asegúrate de reasignar los productos primero.
                </p>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "1.25rem",
            }}
          >
            <button
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedCategory(null);
              }}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteCategory}
              disabled={isPending}
              style={{
                background: "#ef4444",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(239, 68, 68, 0.2)",
              }}
            >
              {isPending ? "Eliminando..." : "Eliminar Categoría"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
