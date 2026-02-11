
import { useState, useCallback } from 'react';
// Fix: Import correct cryptographic functions from shared/crypto instead of non-existent members
import { decryptRaw, encryptRaw, deriveKEK } from '../../shared/crypto';
import { useStore } from '../store';

/**
 * Hook para gestionar operaciones criptográficas con el PIN de sesión
 */
export const useCrypto = () => {
  const [sessionPin, setSessionPin] = useState<string | null>(null);
  // Fix: useStore provides 'config' which contains security parameters like salt and iterations
  const { config } = useStore();

  // Fix: Re-implemented encrypt logic using correct shared/crypto functions and store state
  const encryptData = useCallback(async (text: string) => {
    if (!sessionPin || !config?.salt) throw new Error('Sesión no autorizada');
    const key = await deriveKEK(sessionPin, config.salt, config.iterations);
    return encryptRaw(text, key);
  }, [sessionPin, config]);

  // Fix: Re-implemented decrypt logic using correct shared/crypto functions and store state
  const decryptData = useCallback(async (ciphertext: string, iv: string) => {
    if (!sessionPin || !config?.salt) throw new Error('Sesión no autorizada');
    const key = await deriveKEK(sessionPin, config.salt, config.iterations);
    return decryptRaw(ciphertext, iv, key);
  }, [sessionPin, config]);

  return { setSessionPin, encrypt: encryptData, decrypt: decryptData, hasSession: !!sessionPin };
};
