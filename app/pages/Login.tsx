
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { deriveKEK, generateDEK, wrapDEK, unwrapDEK, createCanary, verifyDEK } from '../../shared/crypto';
import { Button, Input, Card } from '../../shared/ui';

export const LoginPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isSetup, config, lockUntil, setup, unlock, recordFailure, wipe } = useStore();
  
  const isTimeLocked = lockUntil && lockUntil > Date.now();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isTimeLocked) return;
    const timer = setInterval(() => {
      const remaining = Math.ceil((lockUntil! - Date.now()) / 1000);
      if (remaining <= 0) setTimeLeft(0);
      else setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimeLocked, lockUntil]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || isTimeLocked || loading) return;
    setLoading(true);
    setError('');

    try {
      if (!isSetup) {
        // SETUP INICIAL
        const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
        const iterations = 150000;
        const kek = await deriveKEK(pin, salt, iterations);
        const dek = await generateDEK();
        const wrapped = await wrapDEK(dek, kek);
        const canary = await createCanary(dek);
        setup({ salt, iterations, encryptedDEK: wrapped, canary }, dek);
      } else {
        // LOGIN
        const kek = await deriveKEK(pin, config!.salt, config!.iterations);
        const dek = await unwrapDEK(config!.encryptedDEK, kek);
        const isValid = await verifyDEK(dek, config!.canary);
        if (isValid) { unlock(dek); } 
        else { recordFailure(); setError('PIN incorrecto'); setPin(''); }
      }
    } catch (err) {
      setError('Error de seguridad. PIN inválido.');
      recordFailure();
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm space-y-6 border-blue-600/30">
        <header className="text-center space-y-2">
          <span className="text-5xl">🛡️</span>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Bóveda Personal</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Local-Only Security</p>
        </header>

        {isTimeLocked ? (
          <div className="text-center py-4 space-y-2 bg-red-900/10 rounded-xl border border-red-500/20">
            <p className="text-red-500 text-sm font-bold">Demasiados intentos</p>
            <p className="text-4xl font-mono text-white">{timeLeft}s</p>
          </div>
        ) : (
          <form onSubmit={handleAction} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{isSetup ? 'Introduzca su PIN' : 'Establezca un PIN de acceso'}</label>
              <Input 
                type="password" 
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="text-center text-4xl font-mono tracking-[0.5em]"
                maxLength={12}
                disabled={loading}
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-500/10 p-2 rounded uppercase">{error}</p>}
            <Button className="w-full" size="lg" disabled={loading}>{loading ? 'Cifrando...' : (isSetup ? 'Desbloquear' : 'Comenzar')}</Button>
          </form>
        )}

        <footer className="pt-6 border-t border-dark-border space-y-4 text-center">
          <p className="text-[9px] text-gray-600 italic leading-relaxed">Sus datos nunca salen de este dispositivo.<br/>Si olvida su PIN, sus datos serán IRRECUPERABLES.</p>
          <button onClick={() => confirm("¿Desea borrar TODOS los datos?") && wipe()} className="text-[9px] text-red-900 font-bold uppercase hover:text-red-500 transition-colors">Wipe de Emergencia</button>
        </footer>
      </Card>
    </div>
  );
};
