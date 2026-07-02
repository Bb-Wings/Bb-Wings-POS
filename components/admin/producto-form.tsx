'use client'

/**
 * @fileoverview ProductoForm — Formulario con upload a Supabase Storage
 * @description Formulario de platillo con subida de imagen directa al bucket
 *              de Supabase Storage. Incluye drag & drop, preview y barra de progreso.
 * @version 4.0.0
 */

import React, { useState, useEffect, useRef, CSSProperties } from "react";
import { DollarSign, Upload, X, CheckCircle, AlertCircle, ImageIcon } from "lucide-react";
import type { DbProducto } from "@/types/database.types";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductoFormProps {
  mode: "create" | "edit";
  categorias: Categoria[];
  initialData?: DbProducto | null;
  onSubmit: (data: FormPayload) => void;
  onCancel: () => void;
  isPending?: boolean;
}

interface FormPayload {
  nombre: string;
  precio: string;
  descripcion: string;
  imagen_principal: string;
  disponible: boolean;
  categoria_id: string;
  slug: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

// ─── Base Styles ───────────────────────────────────────────────────────────

const INPUT: CSSProperties = {
  width: "100%",
  height: "46px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1.5px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.04)",
  color: "#ffffff",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
};

const INPUT_FOCUS: CSSProperties = {
  borderColor: "rgba(214,31,44,0.7)",
  boxShadow: "0 0 0 3px rgba(214,31,44,0.10)",
};

const LABEL: CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.45)",
  marginBottom: "7px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const FIELD: CSSProperties = {
  display: "flex",
  flexDirection: "column" as const,
};

// ─── Component ─────────────────────────────────────────────────────────────

export function ProductoForm({
  mode,
  categorias,
  initialData,
  onSubmit,
  onCancel,
  isPending = false,
}: ProductoFormProps) {
  const [form, setForm] = useState<FormPayload>({
    nombre: "",
    precio: "",
    descripcion: "",
    imagen_principal: "",
    disponible: true,
    categoria_id: categorias[0]?.id?.toString() ?? "",
    slug: "",
  });

  const [focused, setFocused] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        nombre: initialData.nombre ?? "",
        precio: initialData.precio?.toString() ?? "",
        descripcion: initialData.descripcion ?? "",
        imagen_principal: initialData.imagen_principal ?? "",
        disponible: !!initialData.disponible,
        categoria_id: initialData.categoria_id?.toString() ?? "",
        slug: initialData.slug ?? "",
      });
    } else if (mode === "create") {
      setForm({
        nombre: "",
        precio: "",
        descripcion: "",
        imagen_principal: "",
        disponible: true,
        categoria_id: categorias[0]?.id?.toString() ?? "",
        slug: "",
      });
      setUploadState("idle");
      setUploadProgress(0);
      setUploadError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "nombre") {
        next.slug = value
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return next;
    });
  };

  // ── Upload to Supabase Storage ──────────────────────────────────────────

  const uploadFile = async (file: File) => {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten imágenes (JPG, PNG, WEBP).");
      setUploadState("error");
      return;
    }
    // Validar tamaño (máx 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 5 MB.");
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setUploadProgress(10);
    setUploadError(null);

    // Simular progreso mientras sube al servidor
    const progressTimer = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 80));
    }, 200);

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
      setForm((prev) => ({ ...prev, imagen_principal: result.url }));

    } catch (err: unknown) {
      clearInterval(progressTimer);
      setUploadState("error");
      setUploadProgress(0);
      const message = err instanceof Error ? err.message : "Error al subir la imagen.";
      setUploadError(message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Resetear input para permitir re-selección del mismo archivo
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearImage = () => {
    setForm((prev) => ({ ...prev, imagen_principal: "" }));
    setUploadState("idle");
    setUploadProgress(0);
    setUploadError(null);
  };

  const inputStyle = (name: string): CSSProperties => ({
    ...INPUT,
    ...(focused === name ? INPUT_FOCUS : {}),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // ── Upload zone color states ────────────────────────────────────────────

  const dropzoneBorder = isDragging
    ? "2px dashed rgba(214,31,44,0.8)"
    : uploadState === "done"
    ? "2px dashed rgba(46,204,113,0.5)"
    : uploadState === "error"
    ? "2px dashed rgba(239,68,68,0.5)"
    : "2px dashed rgba(255,255,255,0.12)";

  const dropzoneBg = isDragging
    ? "rgba(214,31,44,0.06)"
    : uploadState === "done"
    ? "rgba(46,204,113,0.04)"
    : uploadState === "error"
    ? "rgba(239,68,68,0.04)"
    : "rgba(255,255,255,0.02)";

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "22px" }}
    >
      {/* ── Nombre ── */}
      <div style={FIELD}>
        <label style={LABEL}>
          Nombre del platillo <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          placeholder="Ej: Alitas Buffalo Originales"
          style={inputStyle("nombre")}
          onFocus={() => setFocused("nombre")}
          onBlur={() => setFocused(null)}
        />
      </div>

      {/* ── Precio ── */}
      <div style={FIELD}>
        <label style={LABEL}>
          <DollarSign size={12} color="rgba(255,255,255,0.35)" />
          Precio de venta <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <input
          name="precio"
          value={form.precio}
          onChange={handleChange}
          required
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          style={inputStyle("precio")}
          onFocus={() => setFocused("precio")}
          onBlur={() => setFocused(null)}
        />
      </div>

      {/* ── Descripción ── */}
      <div style={FIELD}>
        <label style={LABEL}>Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Describe el sabor, los ingredientes y la presentación..."
          rows={3}
          style={{
            ...INPUT,
            height: "auto",
            padding: "12px 14px",
            resize: "none",
            lineHeight: "1.6",
            ...(focused === "desc" ? INPUT_FOCUS : {}),
          }}
          onFocus={() => setFocused("desc")}
          onBlur={() => setFocused(null)}
        />
      </div>

      {/* ── Imagen — Upload a Supabase ── */}
      <div style={FIELD}>
        <label style={LABEL}>
          <ImageIcon size={12} color="rgba(255,255,255,0.35)" />
          Imagen del platillo
        </label>

        {/* Si ya hay imagen, mostrar preview */}
        {form.imagen_principal && uploadState !== "uploading" ? (
          <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.imagen_principal}
              alt="Imagen del platillo"
              style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            {/* Overlay con info y botón de quitar */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: "12px 14px",
            }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "5px" }}>
                <CheckCircle size={13} color="#2ecc71" />
                Subida correctamente
              </span>
              <button
                type="button"
                onClick={clearImage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.5)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  backdropFilter: "blur(8px)",
                }}
              >
                <X size={12} />
                Cambiar
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => uploadState !== "uploading" && fileInputRef.current?.click()}
            style={{
              border: dropzoneBorder,
              background: dropzoneBg,
              borderRadius: "14px",
              padding: "28px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: uploadState === "uploading" ? "default" : "pointer",
              transition: "all 0.2s ease",
              minHeight: "130px",
            }}
          >
            {uploadState === "uploading" ? (
              /* Barra de progreso */
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                  Subiendo imagen...
                </div>
                <div style={{ width: "100%", height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "99px",
                      background: "var(--color-primary)",
                      width: `${uploadProgress}%`,
                      transition: "width 0.15s ease",
                      boxShadow: "0 0 10px rgba(214,31,44,0.5)",
                    }}
                  />
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{uploadProgress}%</div>
              </div>
            ) : uploadState === "error" ? (
              /* Error */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={28} color="rgba(239,68,68,0.8)" />
                <span style={{ fontSize: "13px", color: "rgba(239,68,68,0.9)", fontWeight: 600, textAlign: "center" }}>
                  {uploadError}
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  Haz clic para intentar de nuevo
                </span>
              </div>
            ) : (
              /* Estado normal */
              <>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(214,31,44,0.10)",
                  border: "1px solid rgba(214,31,44,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  <Upload size={20} color="rgba(214,31,44,0.8)" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                    Arrastra una imagen o{" "}
                    <span style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
                      selecciona archivo
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>
                    JPG, PNG, WEBP · Máx. 5 MB
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* ── Botones ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          paddingTop: "18px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          marginTop: "2px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: "44px",
            padding: "0 20px",
            borderRadius: "12px",
            border: "1.5px solid rgba(255,255,255,0.10)",
            background: "transparent",
            color: "rgba(255,255,255,0.65)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.65)";
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending || uploadState === "uploading"}
          style={{
            height: "44px",
            padding: "0 28px",
            borderRadius: "12px",
            border: "none",
            background: (isPending || uploadState === "uploading") ? "rgba(214,31,44,0.4)" : "var(--color-primary)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: (isPending || uploadState === "uploading") ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: (isPending || uploadState === "uploading") ? "none" : "0 4px 18px rgba(214,31,44,0.35)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isPending && uploadState !== "uploading") e.currentTarget.style.background = "#bf1b27";
          }}
          onMouseLeave={(e) => {
            if (!isPending && uploadState !== "uploading") e.currentTarget.style.background = "var(--color-primary)";
          }}
        >
          {isPending
            ? "Guardando..."
            : uploadState === "uploading"
            ? "Subiendo imagen..."
            : mode === "create"
            ? "Agregar Platillo"
            : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
