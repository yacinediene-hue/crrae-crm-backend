import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.ENCRYPTION_KEY || 'crrae-default-key-must-be-changed';
    this.key = createHash('sha256').update(secret).digest();
  }

  encrypt(text: string): string {
    if (!text) return text;
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(value: string): string {
    if (!value || !value.startsWith('enc:')) return value;
    try {
      const [, ivHex, tagHex, dataHex] = value.split(':');
      const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(ivHex, 'hex'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      return decipher.update(Buffer.from(dataHex, 'hex')).toString('utf8') + decipher.final('utf8');
    } catch {
      return value;
    }
  }

  isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith('enc:');
  }
}
