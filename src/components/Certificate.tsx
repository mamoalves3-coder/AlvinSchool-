import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Award, Download, Share2 } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  score: number;
  date: string;
}

export const Certificate: React.FC<CertificateProps> = ({ 
  studentName, 
  courseName, 
  score, 
  date 
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado - ${courseName} - ${studentName}`,
  });

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-bg-dark min-h-screen">
      <div className="mb-8 flex gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="tech-button px-8 py-3 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Baixar PDF
        </button>
        <button
          className="flex items-center gap-2 px-8 py-3 bg-white/5 text-text-muted border border-border-dark rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-sm font-bold"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar
        </button>
      </div>

      <div className="relative group">
        {/* Glow Effect for Preview */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-electric to-neon-green rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 print:hidden"></div>
        
        <div 
          ref={componentRef}
          className="w-[1123px] h-[794px] bg-white shadow-2xl relative overflow-hidden print:shadow-none print:w-full print:h-full"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Border Design */}
          <div className="absolute inset-8 border-4 border-primary-electric pointer-events-none" />
          <div className="absolute inset-10 border border-primary-electric/20 pointer-events-none" />

          {/* Corner Tech Accents */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary-electric" />
          <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary-electric" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary-electric" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary-electric" />

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center h-full text-center px-32 py-20 z-10 relative">
            
            {/* Logo / Icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-primary-electric blur-2xl opacity-20"></div>
              <Award className="w-24 h-24 text-primary-electric relative z-10" />
            </div>

            <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">
              Certificado de Conclusão
            </h1>
            
            <p className="text-xl text-gray-500 mb-12 font-mono uppercase tracking-[0.3em]">
              Este documento certifica que
            </p>

            <h2 className="text-6xl font-black text-primary-electric mb-8 border-b-4 border-gray-100 pb-4 px-12 min-w-[600px] tracking-tight">
              {studentName}
            </h2>

            <p className="text-xl text-gray-500 mb-6 font-mono uppercase tracking-[0.3em]">
              Concluiu com êxito o curso de
            </p>

            <h3 className="text-4xl font-bold text-gray-800 mb-12 tracking-tight">
              {courseName}
            </h3>

            <div className="flex justify-between w-full max-w-4xl mt-12 px-12">
              <div className="text-center">
                <p className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Nota Final</p>
                <p className="text-4xl font-black text-gray-900">{score} / 20</p>
              </div>

              <div className="text-center">
                <p className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Data de Conclusão</p>
                <p className="text-3xl font-bold text-gray-900">{date}</p>
              </div>

              <div className="text-center">
                <div className="w-48 border-b-2 border-primary-electric mb-4" />
                <p className="text-lg font-black text-gray-900 uppercase tracking-tighter italic">Alvino Alves Mamo</p>
                <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest">Administrador AlvinSchool</p>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-gray-200 font-mono text-[10px] tracking-[0.5em] uppercase">
              ID de Autenticação: {Math.random().toString(36).substr(2, 9).toUpperCase()} • ALVINSCHOOL TECH VERIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
