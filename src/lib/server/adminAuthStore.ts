import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AdminAuthData {
  adminEmail: string;
  masterRecoveryEmail: string;
  passwordHash: string;
  salt: string;
  mfaEnabled: boolean;
  totpSecret: string;
  enrolledAt: string | null;
  recoveryOtp: {
    code: string;
    expiresAt: number;
  } | null;
}

const AUTH_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'adminAuth.json');

// Credenciales por defecto si el archivo no existe
const DEFAULT_EMAIL = process.env.ADMIN_EMAIL || 'admin@quirona.com';
const DEFAULT_RECOVERY_EMAIL = 'quirona@parz7val.online';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'quirona2026';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function initializeDefaultAuth(): AdminAuthData {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(DEFAULT_PASSWORD, salt);

  return {
    adminEmail: DEFAULT_EMAIL,
    masterRecoveryEmail: DEFAULT_RECOVERY_EMAIL,
    passwordHash,
    salt,
    mfaEnabled: false,
    totpSecret: '',
    enrolledAt: null,
    recoveryOtp: null,
  };
}

export function getAdminAuthData(): AdminAuthData {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const raw = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (!data.masterRecoveryEmail) {
        data.masterRecoveryEmail = DEFAULT_RECOVERY_EMAIL;
      }
      return data;
    }
  } catch (error) {
    console.error('[AdminAuthStore] Error leyendo auth file:', error);
  }

  const initial = initializeDefaultAuth();
  saveAdminAuthData(initial);
  return initial;
}

export function saveAdminAuthData(data: AdminAuthData): void {
  try {
    const dir = path.dirname(AUTH_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[AdminAuthStore] Error guardando auth file:', error);
  }
}

export function verifyPassword(password: string, authData: AdminAuthData): boolean {
  // Soporte de compatibilidad con clave en texto plano inicial si no coincide
  if (!authData.salt) {
    return password === DEFAULT_PASSWORD;
  }
  const computedHash = hashPassword(password, authData.salt);
  return computedHash === authData.passwordHash;
}

export function updatePassword(newPassword: string, authData: AdminAuthData): AdminAuthData {
  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);
  const updated = {
    ...authData,
    salt: newSalt,
    passwordHash: newHash,
  };
  saveAdminAuthData(updated);
  return updated;
}
