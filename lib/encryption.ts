// lib/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

/**
 * Get encryption key from environment variable
 * The key should be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes in hex)')
  }
  
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a password using AES-256-GCM
 * Returns a base64 encoded string containing: salt + iv + auth tag + encrypted data
 */
export function encryptPassword(password: string): string {
  const key = getEncryptionKey()
  
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive key using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512')
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)
  
  // Encrypt the password
  const encrypted = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final(),
  ])
  
  // Get authentication tag
  const tag = cipher.getAuthTag()
  
  // Combine: salt + iv + tag + encrypted data
  const result = Buffer.concat([salt, iv, tag, encrypted])
  
  // Return as base64
  return result.toString('base64')
}

/**
 * Decrypt a password that was encrypted with encryptPassword
 */
export function decryptPassword(encryptedPassword: string): string {
  const key = getEncryptionKey()
  
  // Decode from base64
  const data = Buffer.from(encryptedPassword, 'base64')
  
  // Extract components
  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, TAG_POSITION)
  const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION)
  const encrypted = data.subarray(ENCRYPTED_POSITION)
  
  // Derive key using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512')
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
  decipher.setAuthTag(tag)
  
  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])
  
  return decrypted.toString('utf8')
}

/**
 * Generate a new encryption key (for initial setup)
 * Run this once and add the output to your .env.local file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}