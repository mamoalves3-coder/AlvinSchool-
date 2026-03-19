import React, { useState, useEffect, useRef } from 'react';
import { generateFinalExam } from '../services/aiService';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
}

interface FinalExamProps {
  courseId: string;
  courseTitle: string;
  lessonDescriptions: string[];
  onClose: () => void;
  onExamSubmit: (score: number) => Promise<void>;
  onShowCertificate: () => void;
}

export const FinalExam: React.FC<FinalExamProps> = ({ 
  courseId, 
  courseTitle, 
  lessonDescriptions, 
  onClose,
  onExamSubmit,
  onShowCertificate
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      const generatedQuestions = await generateFinalExam(courseTitle, lessonDescriptions);
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setAnswers(new Array(generatedQuestions.length).fill(-1));
      } else {
        // Fallback or error handling
        console.error("Failed to generate questions");
      }
      setLoading(false);
    };

    loadExam();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [courseTitle, lessonDescriptions]);

  useEffect(() => {
    if (!loading && !submitted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, submitted, questions]);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.respostaCorreta) {
        correctCount++;
      }
    });

    // Calculate score: (Correct * 2) + 2 bonus
    // Max score = (9 * 2) + 2 = 20
    const calculatedScore = (correctCount * 2) + 2;
    const isPassed = calculatedScore >= 10;

    setScore(calculatedScore);
    setPassed(isPassed);
    setSubmitted(true);
    
    // Save result via callback
    onExamSubmit(calculatedScore);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary-electric animate-spin mb-6" />
        <h3 className="text-2xl font-bold text-white tracking-tight">Gerando Exame Final...</h3>
        <p className="text-text-muted mt-2 text-lg">A IA está criando perguntas baseadas no conteúdo do curso.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="glass-card p-10 max-w-2xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-electric/5 blur-3xl -mr-16 -mt-16"></div>
        <div className="mb-8 flex justify-center">
          {passed ? (
            <div className="w-24 h-24 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Award className="w-12 h-12 text-neon-green" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          )}
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
          {passed ? 'Aprovado!' : 'Reprovado'}
        </h2>
        
        <p className="text-text-muted mb-10 text-xl leading-relaxed">
          {passed 
            ? 'Parabéns! Você completou o curso com sucesso e demonstrou domínio técnico.' 
            : 'Estude mais os conceitos técnicos e tente novamente para obter a sua certificação.'}
        </p>

        <div className="bg-bg-dark rounded-2xl p-8 mb-10 inline-block min-w-[240px] border border-border-dark">
          <span className="block text-xs font-mono text-text-muted uppercase tracking-[0.3em] mb-3">Nota Final</span>
          <span className={cn(
            "text-5xl font-black tracking-tighter",
            passed ? "text-neon-green" : "text-red-500"
          )}>
            {score} / 20
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white/5 text-text-muted rounded-xl hover:bg-white/10 hover:text-white transition-all font-bold border border-border-dark"
          >
            Voltar ao Curso
          </button>
          
          {passed && (
            <button
              onClick={onShowCertificate}
              className="tech-button px-8 py-4 text-lg flex items-center justify-center gap-3"
            >
              <Award className="w-6 h-6" />
              Gerar Certificado
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden max-w-4xl mx-auto border border-border-dark shadow-2xl">
      {/* Header */}
      <div className="bg-card-dark p-8 border-b border-border-dark flex flex-col gap-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Exame Final: {courseTitle}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-primary-electric font-mono text-xs font-bold uppercase tracking-widest">10 Questões</span>
              <span className="w-1 h-1 bg-border-dark rounded-full"></span>
              <span className="text-text-muted font-mono text-xs font-bold uppercase tracking-widest">20 Minutos</span>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-xl font-black border transition-all",
            timeLeft < 60 
              ? "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse" 
              : "bg-primary-electric/10 text-primary-electric border-primary-electric/20"
          )}>
            <Clock className="w-6 h-6" />
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Thermometer / Progress Bar */}
        <div className="w-full h-3 bg-bg-dark rounded-full overflow-hidden border border-border-dark p-[2px]">
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / (20 * 60)) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={cn(
              "h-full rounded-full transition-all duration-500",
              (timeLeft / (20 * 60)) > 0.5 ? "bg-gradient-to-r from-primary-electric to-neon-green" : (timeLeft / (20 * 60)) > 0.2 ? "bg-yellow-400" : "bg-red-500"
            )}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="p-8 md:p-12 space-y-12">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border-b border-border-dark/30 pb-12 last:border-0">
            <h3 className="text-xl font-bold text-white mb-6 tracking-tight flex gap-4">
              <span className="text-primary-electric font-mono">{String(qIndex + 1).padStart(2, '0')}.</span>
              {q.pergunta}
            </h3>
            <div className="space-y-4">
              {q.opcoes.map((option, oIndex) => (
                <label 
                  key={oIndex}
                  className={cn(
                    "flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all group",
                    answers[qIndex] === oIndex 
                      ? "border-primary-electric bg-primary-electric/5 text-white" 
                      : "border-border-dark bg-bg-dark/50 text-text-muted hover:border-primary-electric/50 hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all",
                    answers[qIndex] === oIndex 
                      ? "border-primary-electric bg-primary-electric" 
                      : "border-border-dark group-hover:border-primary-electric/50"
                  )}>
                    {answers[qIndex] === oIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={oIndex}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswerSelect(qIndex, oIndex)}
                    className="hidden"
                  />
                  <span className="text-lg font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-8 bg-card-dark border-t border-border-dark flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-sm font-mono text-text-muted uppercase tracking-widest">
          Respondidas: <span className="text-primary-electric font-bold">{answers.filter(a => a !== -1).length}</span> de <span className="text-white font-bold">{questions.length}</span>
        </div>
        <button
          onClick={handleSubmit}
          className="tech-button px-12 py-4 text-lg w-full sm:w-auto"
        >
          Submeter Exame Final
        </button>
      </div>
    </div>
  );
};
