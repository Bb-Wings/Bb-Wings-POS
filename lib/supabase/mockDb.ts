import fs from "fs";
import path from "path";

const MOCK_DB_PATH = path.join(process.cwd(), "db_mock.json");

export interface MockUser {
  id: string;
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol_id: number;
  roles?: { nombre: string; permisos: any };
}

function getMockDb() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const defaultDb = {
      users: [
        {
          id: "default-admin-id",
          email: "admin@bbwings.com",
          password: "Password123",
          nombre: "Admin",
          apellido: "BB Wings",
          rol_id: 1,
          roles: { nombre: "super_admin", permisos: { "*": true } }
        }
      ]
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultDb, null, 2), "utf8");
    return defaultDb;
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
  } catch {
    return { users: [] };
  }
}

function saveMockDb(db: any) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function getMockUserByEmail(email: string): MockUser | undefined {
  const db = getMockDb();
  return db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
}

export function getMockUserById(id: string): MockUser | undefined {
  const db = getMockDb();
  return db.users.find((u: any) => u.id === id);
}

export function addMockUser(user: MockUser) {
  const db = getMockDb();
  // Avoid duplicate
  if (!db.users.some((u: any) => u.email.toLowerCase() === user.email.toLowerCase())) {
    db.users.push(user);
    saveMockDb(db);
  }
}

export function getMockUsersCount(): number {
  const db = getMockDb();
  return db.users.length;
}
