import React, { useState } from 'react';

interface ShareModalProps {
  onClose: () => void;
  activeStudentName?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose, activeStudentName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🏋️ *TRAINPRO* - Revisa el seguimiento y plan de entrenamiento de ${
      activeStudentName || 'tu alumno'
    } en TRAINPRO:\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#122131] border border-[#454932] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d2f000]">share</span>
            Compartir TRAINPRO
          </h3>
          <button onClick={onClose} className="text-[#c6c9ab] hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-xs text-[#c6c9ab] mb-6 leading-relaxed">
          Comparte el acceso rápido a rutinas, catálogo de ejercicios o el progreso de{' '}
          <strong className="text-white">{activeStudentName || 'tus alumnos'}</strong>.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <span className="material-symbols-outlined">send</span>
            Enviar por WhatsApp
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full bg-[#051424] border border-[#454932] text-white hover:border-[#d2f000] font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[#d2f000]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#454932]/40 text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#c6c9ab] hover:text-white font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
