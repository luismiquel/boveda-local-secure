import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, Logger } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input } from '../../shared/ui';
import { VoiceNote, ID } from '../../domain/types';
import { Mic, Square, Play, Trash2, Volume2, Clock, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VoiceNotesPage: React.FC = () => {
  const { dek } = useStore();
  const [notes, setNotes] = useState<(VoiceNote & { decTitle?: string })[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [tempTitle, setTempTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const loadNotes = useCallback(async () => {
    if (!dek) return;
    setLoading(true);
    try {
      const all = await db.voiceNotes.orderBy('createdAt').reverse().toArray();
      const decrypted = await Promise.all(all.map(async vn => {
        try {
          return {
            ...vn,
            decTitle: await decryptRaw(vn.title.ciphertext, vn.title.iv, dek)
          };
        } catch (e) {
          return { ...vn, decTitle: '[Error]' };
        }
      }));
      setNotes(decrypted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dek]);

  useEffect(() => {
    loadNotes();
  }, [dek, loadNotes]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (!tempTitle) {
          alert("Por favor, ponle un nombre a la nota antes de guardar.");
          return;
        }
        
        const encTitle = await encryptRaw(tempTitle, dek!);
        const newNote: VoiceNote = {
          id: crypto.randomUUID(),
          title: encTitle,
          audioBlob: blob,
          duration: recordingTime,
          createdAt: Date.now()
        };

        await db.voiceNotes.add(newNote);
        await Logger.log("SISTEMA", `Nota de voz guardada: ${tempTitle}`);
        setTempTitle('');
        setRecordingTime(0);
        loadNotes();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteNote = async (id: ID) => {
    if (!confirm("¿Borrar esta nota de voz?")) return;
    await db.voiceNotes.delete(id);
    await Logger.log("SISTEMA", "Nota de voz eliminada");
    loadNotes();
  };

  const playNote = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className={`absolute inset-0 bg-blue-500/20 blur-3xl rounded-full ${isRecording ? 'animate-pulse scale-150' : ''}`} />
          <div className={`p-6 rounded-full transition-all ${isRecording ? 'bg-red-500/20' : 'bg-blue-500/10'}`}>
            <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500 animate-bounce' : 'text-blue-500'}`} />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Notas de Voz</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">Dictado Seguro y Cifrado Local</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            const notesHtml = notes.map(note => `
              <div style="padding: 10px; border-bottom: 1px solid #eee; font-family: sans-serif; display: flex; justify-between; align-items: center;">
                <div>
                  <div style="font-size: 14px; font-weight: bold;">${note.decTitle}</div>
                  <div style="font-size: 10px; color: #666;">${new Date(note.createdAt).toLocaleString()}</div>
                </div>
                <div style="font-size: 12px; font-weight: bold;">${formatTime(note.duration)}</div>
              </div>
            `).join('');
            printWindow.document.write(`
              <html>
                <head><title>Notas de Voz - Bóveda Personal</title></head>
                <body onload="window.print();window.close();" style="padding: 40px;">
                  <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 2px;">Notas de Voz</h1>
                  <div style="margin-top: 20px;">${notesHtml}</div>
                  <footer style="margin-top: 40px; text-align: center; font-size: 8px; color: #999; font-family: sans-serif;">Generado localmente desde Bóveda Personal</footer>
                </body>
              </html>
            `);
            printWindow.document.close();
          }}
        >
          <Printer className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <Card className="p-6 space-y-4 border-blue-500/20 bg-blue-500/5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título de la Grabación</label>
          <Input 
            value={tempTitle} 
            onChange={e => setTempTitle(e.target.value)} 
            placeholder="Ej: Ideas para el proyecto, Recordatorio..." 
            disabled={isRecording}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
            <span className="font-mono text-xl text-white">{formatTime(recordingTime)}</span>
          </div>
          
          {!isRecording ? (
            <Button onClick={startRecording} className="px-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500">
              <Mic className="w-4 h-4" />
              Grabar
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="danger" className="px-8 flex items-center gap-2">
              <Square className="w-4 h-4" />
              Detener y Guardar
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-2">Grabaciones Guardadas</h3>
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <Card className="p-12 text-center border-dashed opacity-50">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No hay grabaciones</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence>
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => playNote(note.audioBlob)}
                        className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <div>
                        <h4 className="font-bold text-white text-sm">{note.decTitle}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase">
                            <Clock className="w-3 h-3" /> {formatTime(note.duration)}
                          </span>
                          <span className="text-[9px] text-gray-600 font-bold uppercase">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <footer className="text-center opacity-20 pt-8">
        <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em] flex items-center justify-center gap-2">
          <Volume2 className="w-3 h-3" /> Audio procesado localmente en el navegador
        </p>
      </footer>
    </div>
  );
};
