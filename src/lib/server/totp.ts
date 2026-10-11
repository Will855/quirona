import crypto from 'crypto';
import QRCode from 'qrcode';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodifica una clave secreta Base32 a Buffer binario
 */
function base32Decode(base32: string): Buffer {
  const clean = base32.replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Codifica un Buffer a Base32
 */
function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Genera una nueva clave secreta Base32 aleatoria de 20 bytes (160 bits)
 */
export function generateBase32Secret(): string {
  const randomBytes = crypto.randomBytes(20);
  return base32Encode(randomBytes);
}

/**
 * Construye la URI otpauth estándar para Google Authenticator
 */
export function buildOtpauthUri(email: string, secret: string, issuer = 'Quirona Store'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Genera el código QR como imagen DataURL (PNG base64) para renderizar en el navegador
 */
export async function generateQrCodeDataUrl(otpauthUri: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#661716', // Vino tinto oficial de Quirona
      light: '#FFECB9', // Soft butter cream oficial de Quirona
    },
  });
}

/**
 * Calcula el código TOTP actual para una clave secreta dada (RFC 6238)
 */
export function computeTotp(secret: string, timeStepOffset = 0): string {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / 30) + timeStepOffset;

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(counter));

  const keyBuffer = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', keyBuffer).update(timeBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Valida un código de 6 dígitos contra la clave secreta con ventana de tolerancia ±1 intervalo (±30s)
 */
export function verifyTotp(token: string, secret: string, windowSteps = 1): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6) return false;

  for (let error = -windowSteps; error <= windowSteps; error++) {
    if (computeTotp(secret, error) === cleanToken) {
      return true;
    }
  }

  return false;
}
