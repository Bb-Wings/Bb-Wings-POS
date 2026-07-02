'use client'

/**
 * @fileoverview Clientes & Usuarios Manager — BB Wings Admin Panel
 * @description Gestor de usuarios y clientes del sistema con edición de rol, contraseña y alta de usuarios por email.
 * @version 1.0.0
 */

import { useState, useTransition } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  Users,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import type { DbUsuario, DbRol } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, StatCard } from "@/components/ui/card";
import { useToast } from "@/lib/store/ui.store";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface ClientesManagerProps {
  initialUsuarios: (DbUsuario & { roles: DbRol | null })[];
  roles: DbRol[];
}

export function ClientesManager({ initialUsuarios, roles }: ClientesManagerProps) {
  const [usuarios, setUsuarios] = useState(initialUsuarios || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSendCredentialsOpen, setIsSendCredentialsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Estados de formularios
  const [selectedUser, setSelectedUser] = useState<(DbUsuario & { roles: DbRol | null }) | null>(null);

  // Form de Creación
  const [createForm, setCreateForm] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rol_id: roles[0]?.id ? String(roles[0].id) : "7", // default to 'cliente' or first role
    password: "",
    enviar_correo: true, // enviar credenciales al correo
  });

  // Form de Edición
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    rol_id: "",
    activo: true,
  });

  // Form de Password
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  // ─── Handlers de Apertura ──────────────────────────────────────────────────

  const handleAddClick = () => {
    setCreateForm({
      email: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol_id: roles.find((r) => r.nombre === "cliente")?.id ? String(roles.find((r) => r.nombre === "cliente")?.id) : String(roles[0]?.id || "7"),
      password: "",
      enviar_correo: true,
    });
    setIsCreateOpen(true);
  };

  const handleEditClick = (user: DbUsuario & { roles: DbRol | null }) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      telefono: user.telefono || "",
      rol_id: String(user.rol_id),
      activo: user.activo ?? true,
    });
    setIsEditOpen(true);
  };

  const handlePasswordClick = (user: DbUsuario & { roles: DbRol | null }) => {
    setSelectedUser(user);
    setPasswordForm({ password: "", confirmPassword: "" });
    setIsPasswordOpen(true);
  };

  const handleSendCredentialsClick = (user: DbUsuario & { roles: DbRol | null }) => {
    setSelectedUser(user);
    setIsSendCredentialsOpen(true);
  };

  const handleDeleteClick = (user: DbUsuario & { roles: DbRol | null }) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Toggle Activo rápido
  const handleToggleActivo = async (user: DbUsuario & { roles: DbRol | null }) => {
    const nextActivo = !user.activo;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, activo: nextActivo } : u))
    );

    try {
      const response = await fetch(`/api/clientes/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nextActivo }),
      });
      const result = await response.json();

      if (!result.success) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, activo: user.activo } : u))
        );
        toast.error("Error", result.error || "No se pudo actualizar el estado.");
      } else {
        toast.success("Estado actualizado", `Usuario "${user.nombre}" ahora está ${nextActivo ? "Activo" : "Bloqueado"}.`);
      }
    } catch {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, activo: user.activo } : u))
      );
      toast.error("Error", "Error de conexión al actualizar estado.");
    }
  };

  // ─── CRUD Actions ─────────────────────────────────────────────────────────

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.nombre || !createForm.apellido || !createForm.rol_id) return;
    if (!createForm.enviar_correo && (!createForm.password || createForm.password.length < 6)) {
      toast.error("Contraseña inválida", "La contraseña es requerida y debe tener al menos 6 caracteres.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createForm),
        });
        const result = await response.json();

        if (result.success) {
          setUsuarios((prev) => [result.data, ...prev]);
          toast.success(
            "Usuario creado",
            createForm.enviar_correo
              ? `Se ha enviado la invitación al correo "${createForm.email}".`
              : `Usuario "${createForm.nombre}" registrado exitosamente.`
          );
          setIsCreateOpen(false);
        } else {
          toast.error("Error al crear", result.error || "No se pudo crear el usuario.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/clientes/${selectedUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        const result = await response.json();

        if (result.success) {
          setUsuarios((prev) =>
            prev.map((u) => (u.id === selectedUser.id ? result.data : u))
          );
          toast.success("Usuario actualizado", `Los datos de "${editForm.nombre}" se guardaron con éxito.`);
          setIsEditOpen(false);
          setSelectedUser(null);
        } else {
          toast.error("Error al actualizar", result.error || "No se pudo actualizar el usuario.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  const handleSendCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/clientes/${selectedUser.id}/credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Credenciales enviadas", `Se generó y envió la contraseña temporal a ${selectedUser.email}.`);
          setIsSendCredentialsOpen(false);
          setSelectedUser(null);
        } else {
          toast.error("Error al enviar", result.error || "No se pudieron enviar las credenciales.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Error", "Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/clientes/${selectedUser.id}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordForm.password }),
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Contraseña actualizada", `Contraseña de "${selectedUser.nombre}" cambiada correctamente.`);
          setIsPasswordOpen(false);
          setSelectedUser(null);
        } else {
          toast.error("Error al actualizar", result.error || "No se pudo cambiar la contraseña.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  const handleDeleteUserSubmit = async () => {
    if (!selectedUser) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/clientes/${selectedUser.id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          setUsuarios((prev) => prev.filter((u) => u.id !== selectedUser.id));
          toast.success("Usuario eliminado", "El usuario y su perfil se eliminaron del sistema.");
          setIsDeleteOpen(false);
          setSelectedUser(null);
        } else {
          toast.error("Error al eliminar", result.error || "No se pudo eliminar el usuario.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  // ─── Filters & Stats ──────────────────────────────────────────────────────

  const filteredUsers = usuarios.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telefono && user.telefono.includes(searchTerm));

    const matchesRole = roleFilter === "all" || String(user.rol_id) === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = usuarios.length;
  const adminUsers = usuarios.filter((u) => u.roles?.nombre === "admin" || u.roles?.nombre === "super_admin").length;
  const staffUsers = usuarios.filter((u) => u.roles?.nombre !== "cliente" && u.roles?.nombre !== "admin" && u.roles?.nombre !== "super_admin").length;
  const clientUsers = usuarios.filter((u) => u.roles?.nombre === "cliente").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <StatCard title="Total Usuarios" value={String(totalUsers)} icon={<Users />} iconColor="primary" />
        <StatCard title="Administradores" value={String(adminUsers)} icon={<ShieldCheck />} iconColor="secondary" />
        <StatCard title="Empleados / Staff" value={String(staffUsers)} icon={<UserCheck />} iconColor="warning" />
        <StatCard title="Clientes Registrados" value={String(clientUsers)} icon={<UserCheck />} iconColor="success" />
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
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px", height: "40px", background: "rgba(255, 255, 255, 0.02)" }}
            />
          </div>

          {/* Filtro Rol */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="all" style={{ background: "#111" }}>Todos los Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={String(r.id)} style={{ background: "#111" }}>
                {r.nombre.toUpperCase()}
              </option>
            ))}
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
          <Plus className="w-4 h-4" /> Registrar Usuario
        </Button>
      </div>

      {/* Grid de Tarjetas de Usuarios */}
      {filteredUsers.length === 0 ? (
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
          <Users style={{ width: "36px", height: "36px", color: "rgba(255,255,255,0.2)" }} />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              No se encontraron usuarios
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", margin: 0 }}>
              Intenta cambiar los parámetros de búsqueda o filtros
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {filteredUsers.map((user) => {
            const isSuperAdmin = user.roles?.nombre === "super_admin";
            const isAdmin = user.roles?.nombre === "admin";
            const isCliente = user.roles?.nombre === "cliente";

            // Custom inline styles for premium badges
            let badgeStyle: React.CSSProperties = {
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "0.65rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "1px solid rgba(234, 179, 8, 0.2)",
              background: "rgba(234, 179, 8, 0.08)",
              color: "#facc15",
            };

            if (isSuperAdmin) {
              badgeStyle = {
                ...badgeStyle,
                border: "1px solid rgba(239, 68, 68, 0.25)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#f87171",
              };
            } else if (isAdmin) {
              badgeStyle = {
                ...badgeStyle,
                border: "1px solid rgba(168, 85, 247, 0.25)",
                background: "rgba(168, 85, 247, 0.08)",
                color: "#c084fc",
              };
            } else if (isCliente) {
              badgeStyle = {
                ...badgeStyle,
                border: "1px solid rgba(34, 197, 94, 0.25)",
                background: "rgba(34, 197, 94, 0.08)",
                color: "#4ade80",
              };
            }

            return (
              <Card
                key={user.id}
                variant="glass"
                padding="none"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "hidden",
                }}
                className="hover:border-white/12 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
              >
                {/* Header de tarjeta */}
                <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Avatar Circle */}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #d61f2c, #ea580c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>
                      {user.nombre} {user.apellido}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
                      <span style={badgeStyle}>
                        {user.roles?.nombre.replace("_", " ") || "SIN ROL"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detalles del usuario */}
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  {/* Email */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail style={{ width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", wordBreak: "break-all" }}>
                      {user.email}
                    </span>
                  </div>

                  {/* Teléfono (Solo si está registrado) */}
                  {user.telefono && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone style={{ width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
                        {user.telefono}
                      </span>
                    </div>
                  )}

                  {/* Estado Activo */}
                  <div
                    onClick={() => handleToggleActivo(user)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.015)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      marginTop: "4px",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.2s",
                    }}
                    className="hover:bg-white/[0.03] hover:border-white/10"
                  >
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.05em" }}>
                      ESTADO DE CUENTA
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: user.activo ? "#22c55e" : "#ef4444",
                          boxShadow: user.activo ? "0 0 10px rgba(34, 197, 94, 0.6)" : "0 0 10px rgba(239, 68, 68, 0.6)",
                        }}
                      />
                      <span style={{ fontSize: "0.8rem", color: user.activo ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                        {user.activo ? "Activo" : "Bloqueado"}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "10px",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      paddingTop: "12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button
                        onClick={() => handlePasswordClick(user)}
                        style={{
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#ea580c",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "4px 0",
                          transition: "opacity 0.2s",
                        }}
                        className="hover:opacity-80"
                      >
                        <Key style={{ width: "13px", height: "13px" }} /> Contraseña
                      </button>

                      <button
                        onClick={() => handleSendCredentialsClick(user)}
                        style={{
                          background: "transparent",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "rgba(255, 255, 255, 0.4)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "4px 0",
                          transition: "color 0.2s",
                        }}
                        className="hover:text-white"
                      >
                        <Mail style={{ width: "13px", height: "13px" }} /> Enviar Accesos
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleEditClick(user)}
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
                        onClick={() => handleDeleteClick(user)}
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
            );
          })}
        </div>
      )}

      {/* ─── MODAL CREAR ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nuevo Usuario"
        description="Registra un nuevo usuario en la base de datos con rol específico."
      >
        <form onSubmit={handleCreateUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <Input
              label="Correo Electrónico"
              type="email"
              required
              placeholder="ejemplo@correo.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <Input
                label="Nombre"
                type="text"
                required
                placeholder="Nombre"
                value={createForm.nombre}
                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
            <div>
              <Input
                label="Apellido"
                type="text"
                required
                placeholder="Apellido"
                value={createForm.apellido}
                onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
              Rol de Usuario *
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={createForm.rol_id}
                onChange={(e) => setCreateForm({ ...createForm, rol_id: e.target.value })}
                style={{
                  width: "100%",
                  height: "40px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#fff",
                  padding: "0 12px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "16px",
                  paddingRight: "40px",
                }}
              >
                {roles.map((r) => (
                  <option key={r.id} value={String(r.id)} style={{ background: "#1a1a1a", color: "#fff" }}>
                    {r.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Enviar invitación por correo */}
          <div
            onClick={() => setCreateForm({ ...createForm, enviar_correo: !createForm.enviar_correo })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "999px",
                background: createForm.enviar_correo ? "#ea580c" : "rgba(255,255,255,0.1)",
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
                  left: createForm.enviar_correo ? "19px" : "3px",
                  transition: "left 0.25s",
                }}
              />
            </div>
            <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>
              Enviar invitación / credenciales al correo
            </span>
          </div>

          {!createForm.enviar_correo && (
            <div>
              <Input
                label="Contraseña Temporal"
                type="password"
                required={!createForm.enviar_correo}
                placeholder="Mínimo 6 caracteres"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          )}

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
              onClick={() => setIsCreateOpen(false)}
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
              type="submit"
              disabled={isPending}
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
              }}
            >
              {isPending ? "Registrando..." : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL EDITAR ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        title="Editar Perfil y Rol"
        description="Modifica los detalles del perfil o actualiza los permisos del usuario."
      >
        <form onSubmit={handleEditUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <Input
                label="Nombre"
                type="text"
                required
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
            <div>
              <Input
                label="Apellido"
                type="text"
                required
                value={editForm.apellido}
                onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
              Rol de Usuario
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={editForm.rol_id}
                onChange={(e) => setEditForm({ ...editForm, rol_id: e.target.value })}
                style={{
                  width: "100%",
                  height: "40px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#fff",
                  padding: "0 12px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "16px",
                  paddingRight: "40px",
                }}
              >
                {roles.map((r) => (
                  <option key={r.id} value={String(r.id)} style={{ background: "#1a1a1a", color: "#fff" }}>
                    {r.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Activo */}
          <div
            onClick={() => setEditForm({ ...editForm, activo: !editForm.activo })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "999px",
                background: editForm.activo ? "#ea580c" : "rgba(255,255,255,0.1)",
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
                  left: editForm.activo ? "19px" : "3px",
                  transition: "left 0.25s",
                }}
              />
            </div>
            <span style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>
              Cuenta habilitada / activa
            </span>
          </div>

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
              onClick={() => {
                setIsEditOpen(false);
                setSelectedUser(null);
              }}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.08)",
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
              disabled={isPending}
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
              }}
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL CONTRASEÑA ─── */}
      <Modal
        isOpen={isPasswordOpen}
        onClose={() => {
          setIsPasswordOpen(false);
          setSelectedUser(null);
        }}
        title="Cambiar Contraseña"
        description={selectedUser ? `Define una nueva contraseña para la cuenta de "${selectedUser.nombre}".` : ""}
      >
        <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", marginBottom: "8px" }}>
              Nueva Contraseña *
            </label>
            <Input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              style={{ background: "rgba(255,255,255,0.02)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", marginBottom: "8px" }}>
              Confirmar Nueva Contraseña *
            </label>
            <Input
              type="password"
              required
              placeholder="Escribe la contraseña de nuevo"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              style={{ background: "rgba(255,255,255,0.02)" }}
            />
          </div>

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
              onClick={() => {
                setIsPasswordOpen(false);
                setSelectedUser(null);
              }}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.08)",
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
              disabled={isPending || !passwordForm.password}
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
              }}
            >
              {isPending ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL ELIMINAR ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        title="¿Eliminar Cuenta de Usuario?"
        description="Esta acción eliminará de forma permanente al usuario de la base de datos y de la autenticación."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {selectedUser && (
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
                  Advertencia sobre "{selectedUser.nombre} {selectedUser.apellido}"
                </h4>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "4px", margin: 0, lineHeight: 1.4 }}>
                  Eliminar este usuario cancelará su acceso de inmediato. Si es un cliente con pedidos registrados, la base de datos mantendrá registros históricos del pedido pero desvinculará la cuenta de forma permanente.
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
                setSelectedUser(null);
              }}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.08)",
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
              onClick={handleDeleteUserSubmit}
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
              {isPending ? "Eliminando..." : "Eliminar Usuario"}
            </button>
          </div>
        </div>
      </Modal>
      {/* ─── MODAL ENVIAR CREDENCIALES ─── */}
      <Modal
        isOpen={isSendCredentialsOpen}
        onClose={() => {
          setIsSendCredentialsOpen(false);
          setSelectedUser(null);
        }}
        title="Enviar Credenciales de Acceso"
        description={selectedUser ? `Se enviará un correo con credenciales de acceso temporal a ${selectedUser.nombre}.` : ""}
      >
        <form onSubmit={handleSendCredentialsSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {selectedUser && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "1rem",
                borderRadius: "12px",
                background: "rgba(234, 88, 12, 0.04)",
                border: "1px solid rgba(234, 88, 12, 0.15)",
              }}
            >
              <AlertCircle style={{ width: "20px", height: "20px", color: "#ea580c", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                  Confirmar regeneración y envío de accesos
                </h4>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "4px", margin: 0, lineHeight: 1.4 }}>
                  Al confirmar, se generará una contraseña temporal automática y se enviará un correo electrónico a <strong>{selectedUser.email}</strong>. La contraseña actual del usuario será reemplazada y ya no podrá iniciar sesión con ella.
                </p>
              </div>
            </div>
          )}

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
              onClick={() => {
                setIsSendCredentialsOpen(false);
                setSelectedUser(null);
              }}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.08)",
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
              disabled={isPending}
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
              }}
            >
              {isPending ? "Enviando..." : "Generar y Enviar Accesos"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
