'use client'

/**
 * @fileoverview Categoria Form Component — BB Wings Admin Panel
 * @description Formulario premium de creación/edición de categorías con soporte para
 * subida de imágenes a Supabase Storage mediante el servidor.
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, CSSProperties } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import type { DbCategoria } from "@/types/database.types";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface FormPayload {
  nombre: string;
  descripcion: string;
  orden: string;
  activa: boolean;
  imagen_url: string;
}

interface CategoriaFormProps {
  initialData?: DbCategoria | null;
  onSubmit: (data: Partial<DbCategoria>) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

export function CategoriaForm({
  initialData = null,
  onSubmit,
  onCancel,
  isPending = false,
}: CategoriaFormProps) {
  const [form, setForm] = useState<FormPayload>({
    nombre: "",
    descripcion: "",
    orden: "0",
    activa: true,
    imagen_url: "",
  });

  // Estado del upload de imagen
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Cargar datos iniciales en edición
  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        orden: String(initialData.orden ?? 0),
        activa: initialData.activa ?? true,
        imagen_url: initialData.imagen_url || "",
      });
      if (initialData.imagen_url) {
        setUploadState("done");
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "orden") {
        return { ...prev, orden: value.replace(/\D/g, "") };
      }
      return { ...prev, [name]: value };
    });
  };

  // Manejo del switch activa
  const handleToggleActiva = () => {
    setForm((prev) => ({ ...prev, activa: !prev.activa }));
  };

  // ── Subida de Archivos ──────────────────────────────────────────────────

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten imágenes (JPG, PNG, WEBP).");
      setUploadState("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 5 MB.");
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setUploadProgress(10);
    setUploadError(null);

    const progressTimer = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 15, 85));
    }, 150);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      clearInterval(progressTimer);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error ?? "Error al subir la imagen.");
      }

      setUploadProgress(100);
      setUploadState("done");
      setForm((prev) => ({ ...prev, imagen_url: result.url }));

    } catch (err: unknown) {
      clearInterval(progressTimer);
      setUploadState("error");
      setUploadProgress(0);
      const message = err instanceof Error ? err.message : "Error al subir la imagen.";
      setUploadError(message);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imagen_url: "" }));
    setUploadState("idle");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Enviar Formulario ───────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    await onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      orden: parseInt(form.orden, 10) || 0,
      activa: form.activa,
      imagen_url: form.imagen_url || null,
    });
  };

  // ── Estilos Inline Premium ──────────────────────────────────────────────

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(255, 255, 255, 0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "0.875rem",
    outline: "none",
    transition: "all 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" style={labelStyle}>Nombre de la Categoría *</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          placeholder="Ej: Hamburguesas, Micheladas, Alitas..."
          value={form.nombre}
          onChange={handleChange}
          style={inputStyle}
          className="focus:border-[#ea580c]/50 focus:bg-white/[0.05]"
        />
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" style={labelStyle}>Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          placeholder="Escribe una breve descripción para esta categoría..."
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
          className="focus:border-[#ea580c]/50 focus:bg-white/[0.05]"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Orden */}
        <div>
          <label htmlFor="orden" style={labelStyle}>Orden de Visualización</label>
          <input
            id="orden"
            name="orden"
            type="text"
            placeholder="0"
            value={form.orden}
            onChange={handleChange}
            style={inputStyle}
            className="focus:border-[#ea580c]/50 focus:bg-white/[0.05]"
          />
        </div>

        {/* Estado Activa */}
        <div>
          <label style={labelStyle}>Estado de Categoría</label>
          <div
            onClick={handleToggleActiva}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {/* Custom switch */}
            <div
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "999px",
                background: form.activa ? "#ea580c" : "rgba(255,255,255,0.1)",
                position: "relative",
                transition: "background 0.25s",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: "3px",
                  left: form.activa ? "19px" : "3px",
                  transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <span style={{ fontSize: "0.85rem", color: form.activa ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              {form.activa ? "Activa (Visible)" : "Inactiva (Oculta)"}
            </span>
          </div>
        </div>
      </div>

      {/* Imagen */}
      <div>
        <label style={labelStyle}>Imagen representativa</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        {uploadState === "idle" && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? "#ea580c" : "rgba(255,255,255,0.12)"}`,
              borderRadius: "14px",
              padding: "2.5rem 1.5rem",
              textAlign: "center",
              background: dragActive ? "rgba(234, 88, 12, 0.03)" : "rgba(255,255,255,0.01)",
              cursor: "pointer",
              transition: "all 0.25s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Upload style={{ width: "24px", height: "24px", color: "rgba(255,255,255,0.3)" }} />
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                Arrastra una imagen aquí
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "4px", margin: 0 }}>
                o haz clic para explorar tu dispositivo (Max. 5MB)
              </p>
            </div>
          </div>
        )}

        {uploadState === "uploading" && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "2rem 1.5rem",
              background: "rgba(255,255,255,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                Subiendo imagen...
              </span>
              <span style={{ fontSize: "0.8rem", color: "#ea580c", fontWeight: 700 }}>
                {uploadProgress}%
              </span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #d61f2c, #ea580c)",
                  width: `${uploadProgress}%`,
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
          </div>
        )}

        {uploadState === "done" && form.imagen_url && (
          <div
            style={{
              position: "relative",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              aspectRatio: "16/9",
              background: "#111",
            }}
          >
            <img
              src={form.imagen_url}
              alt="Categoría Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Overlay gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle style={{ width: "16px", height: "16px", color: "#22c55e" }} />
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                  Subida con éxito
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#ef4444",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <X style={{ width: "12px", height: "12px" }} /> Eliminar
              </button>
            </div>
          </div>
        )}

        {uploadState === "error" && (
          <div
            style={{
              border: "1px dashed #ef4444",
              borderRadius: "14px",
              padding: "2rem 1.5rem",
              background: "rgba(239, 68, 68, 0.02)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textAlign: "center",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <AlertCircle style={{ width: "24px", height: "24px", color: "#ef4444" }} />
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ef4444", margin: 0 }}>
                {uploadError || "Error al subir"}
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", margin: 0 }}>
                Haz clic aquí para reintentar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1.25rem",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending || uploadState === "uploading"}
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
          type="submit"
          disabled={isPending || uploadState === "uploading" || !form.nombre.trim()}
          style={{
            background: "linear-gradient(90deg, #d61f2c, #ea580c)",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(234, 88, 12, 0.2)",
            opacity: (!form.nombre.trim() || isPending || uploadState === "uploading") ? 0.6 : 1,
          }}
        >
          {isPending ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Categoría"}
        </button>
      </div>
    </form>
  );
}
