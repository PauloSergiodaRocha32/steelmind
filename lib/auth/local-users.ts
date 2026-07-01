import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import type { LocalUserRecord, UserRole } from "@/types/auth";
import { DEFAULT_TENANT_ID } from "@/types/auth";

const USERS_PATH = resolve(process.cwd(), "data/steelmind/users.json");

const SEED_USERS: Array<{
  email: string;
  password: string;
  name: string;
  role: UserRole;
}> = [
  {
    email: "admin@inglesametais.com",
    password: "admin123",
    name: "Administrador",
    role: "admin",
  },
  {
    email: "almoxarifado@inglesametais.com",
    password: "almox123",
    name: "Operador Almoxarifado",
    role: "warehouse",
  },
  {
    email: "compras@inglesametais.com",
    password: "compras123",
    name: "Analista Compras",
    role: "purchasing",
  },
  {
    email: "engenharia@inglesametais.com",
    password: "eng123",
    name: "Engenheiro Projetos",
    role: "engineering",
  },
];

function getSeedUsers() {
  const users = [...SEED_USERS];
  const gestioEmail = process.env.GESTIO_EMAIL?.trim();
  const gestioPassword = process.env.GESTIO_PASSWORD?.trim();
  if (gestioEmail && gestioPassword) {
    users.push({
      email: gestioEmail,
      password: gestioPassword,
      name: gestioEmail.split("@")[0] ?? "Administrador",
      role: "admin",
    });
  }
  return users;
}

function ensureUsersFile(): LocalUserRecord[] {
  const dir = resolve(process.cwd(), "data/steelmind");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (!existsSync(USERS_PATH)) {
    const users: LocalUserRecord[] = getSeedUsers().map((u) => ({
      id: crypto.randomUUID(),
      email: u.email.toLowerCase(),
      name: u.name,
      role: u.role,
      tenantId: DEFAULT_TENANT_ID,
      passwordHash: bcrypt.hashSync(u.password, 10),
    }));
    writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    return users;
  }

  return JSON.parse(readFileSync(USERS_PATH, "utf-8")) as LocalUserRecord[];
}

export function getLocalUsers(): LocalUserRecord[] {
  return ensureUsersFile();
}

export function findLocalUserByEmail(
  email: string,
): LocalUserRecord | undefined {
  return getLocalUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
}

export async function verifyLocalPassword(
  email: string,
  password: string,
): Promise<LocalUserRecord | null> {
  const user = findLocalUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export function createLocalUser(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): LocalUserRecord {
  const users = getLocalUsers();
  if (users.some((u) => u.email === input.email.toLowerCase())) {
    throw new Error("E-mail já cadastrado");
  }
  const user: LocalUserRecord = {
    id: crypto.randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    tenantId: DEFAULT_TENANT_ID,
    passwordHash: bcrypt.hashSync(input.password, 10),
  };
  users.push(user);
  writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  return user;
}

export function listLocalUsersPublic(): Array<Omit<LocalUserRecord, "passwordHash">> {
  return getLocalUsers().map(({ passwordHash, ...user }) => {
    void passwordHash;
    return user;
  });
}
