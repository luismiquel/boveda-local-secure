
import { useCallback } from 'react';
import { useStore } from '../store';
// Fix: Import correct cryptographic functions from shared/crypto instead of non-existent members
import { encryptRaw, decryptRaw } from '../../shared/crypto';

export const useEncryption = () => {
  // Fix: useStore provides 'dek' (Master Key) which should be used for operations when unlocked
  const { dek, lock } = useStore();

  const encryptData = useCallback(async (text: string) => {
    if (!dek) {
      lock();
      throw new Error("Sesión expirada");
    }
    return await encryptRaw(text, dek);
  }, [dek, lock]);

  const decryptData = useCallback(async (ciphertext: string, iv: string) => {
    if (!dek) {
      lock();
      throw new Error("Sesión expirada");
    }
    return await decryptRaw(ciphertext, iv, dek);
  }, [dek, lock]);

  return { encryptData, decryptData, isReady: !!dek };
};
