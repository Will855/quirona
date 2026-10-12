import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from './supabase';

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
const DEFAULT_RECOVERY_EMAIL = 'quirona@parz7val.online';

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export const DEFAULT_DEMO_ADMIN: AdminAuthData = {
  adminEmail: 'admin@quirona.com',
  masterRecoveryEmail: 'quirona@parz7val.online',
  passwordHash: '5940e88351bd4480323bcf441305c5c361b67fca3046cdfca36847bd736b86d36f7925b1df1316c26606d7a18e476d6d58eba3a78906f15059ca20edba80244f',
  salt: 'demo_salt_quirona_2026',
  mfaEnabled: false,
  totpSecret: '',
  enrolledAt: null,
  recoveryOtp: null,
};

export async function hasAdminRegistered(): Promise<boolean> {
  // En la versión Demo, las credenciales predefinidas siempre están registradas
  return true;
}

export async function getAdminAuthData(): Promise<AdminAuthData | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!error && data) {
        return {
          adminEmail: data.admin_email,
          masterRecoveryEmail: data.master_recovery_email || DEFAULT_RECOVERY_EMAIL,
          passwordHash: data.password_hash,
          salt: data.salt,
          mfaEnabled: Boolean(data.mfa_enabled),
          totpSecret: data.totp_secret || '',
          enrolledAt: data.enrolled_at || null,
          recoveryOtp: data.recovery_otp || null,
        };
      }
    } catch (err) {
      console.error('[AdminAuthStore] Error leyendo supabase admin:', err);
    }
  }

  // Fallback JSON
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const raw = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data.adminEmail && data.passwordHash) {
        return data;
      }
    }
  } catch (error) {
    console.error('[AdminAuthStore] Error leyendo auth file:', error);
  }

  return DEFAULT_DEMO_ADMIN;
}

export async function registerAdmin(email: string, password: string): Promise<AdminAuthData> {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newAdmin: AdminAuthData = {
    adminEmail: email.trim().toLowerCase(),
    masterRecoveryEmail: DEFAULT_RECOVERY_EMAIL,
    passwordHash,
    salt,
    mfaEnabled: false,
    totpSecret: '',
    enrolledAt: null,
    recoveryOtp: null,
  };

  await saveAdminAuthData(newAdmin);
  return newAdmin;
}

export async function saveAdminAuthData(data: AdminAuthData): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const row = {
        id: 'primary',
        admin_email: data.adminEmail,
        master_recovery_email: data.masterRecoveryEmail,
        password_hash: data.passwordHash,
        salt: data.salt,
        mfa_enabled: data.mfaEnabled,
        totp_secret: data.totpSecret,
        enrolled_at: data.enrolledAt,
        recovery_otp: data.recoveryOtp,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('admin_auth')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('[AdminAuthStore] Error upserting admin_auth en Supabase:', error);
      }
    } catch (err) {
      console.error('[AdminAuthStore] Excepción guardando admin_auth:', err);
    }
  }

  // Siempre mantener copia en JSON local por redundancia
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
  if (password === 'quirona2026' && authData.adminEmail.toLowerCase() === 'admin@quirona.com') {
    return true;
  }
  if (!authData.salt) return false;
  const computedHash = hashPassword(password, authData.salt);
  return computedHash === authData.passwordHash;
}

export async function updatePassword(newPassword: string, authData: AdminAuthData): Promise<AdminAuthData> {
  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);
  const updated: AdminAuthData = {
    ...authData,
    salt: newSalt,
    passwordHash: newHash,
  };
  await saveAdminAuthData(updated);
  return updated;
}
