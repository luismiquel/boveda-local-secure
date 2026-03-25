
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20',
    secondary: 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest',
    md: 'px-5 py-2.5 text-xs font-black uppercase tracking-widest',
    lg: 'px-8 py-4 text-sm font-black uppercase tracking-widest'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-500 ${className} ${onClick ? 'cursor-pointer hover:bg-white/[0.05] hover:border-blue-500/30 hover:-translate-y-1' : ''}`}
  >
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-600"
  />
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ 
  isOpen, onClose, title, children 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)] animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-white/5">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all">&times;</button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
