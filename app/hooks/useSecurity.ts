
import { useCallback } from 'react';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { EncryptedData } from '../../domain/types';

export const useSecurity = () => {
  const { dek, lock } = useStore();

  const encrypt = useCallback(async (text: string): Promise<EncryptedData> => {
    if (!dek) { lock(); throw new Error("Sesión caducada"); }
    return await encryptRaw(text, dek);
  }, [dek, lock]);

  const decrypt = useCallback(async (data: EncryptedData): Promise<string> => {
    if (!dek) { lock(); throw new Error("Sesión caducada"); }
    return await decryptRaw(data.ciphertext, data.iv, dek);
  }, [dek, lock]);

  return { encrypt, decrypt, isReady: !!dek };
};
