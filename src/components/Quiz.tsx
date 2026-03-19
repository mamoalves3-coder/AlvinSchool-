import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, BrainCircuit, RefreshCw, Timer } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

interface QuizProps {
  lessonId: string;
  onComplete: (passed: boolean, score: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({ lessonId, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(false);
      setShowResults(false);
      setSelectedAnswers({});
      setTimeLeft(120);
      setIsTimeUp(false);
      
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('lesson_id', lessonId);

        if (error) throw error;

        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchQuestions();
    }
  }, [lessonId]);

  // Timer logic
  useEffect(() => {
    if (!loading && questions.length > 0 && !showResults && !isTimeUp) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimeUp(true);
            handleVerify(true); // Auto-verify when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length, showResults, isTimeUp]);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (showResults || isTimeUp) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleVerify = (timeFinished = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResults(true);
    
    const score = questions.reduce((acc, q, idx) => {
      const selectedIdx = selectedAnswers[idx];
      if (selectedIdx === undefined) return acc;
      const selectedOption = q.options[selectedIdx];
      return acc + (selectedOption === q.correct_answer ? 1 : 0);
    }, 0);
    
    // Pass if score is at least 60%
    const passingScore = Math.ceil(questions.length * 0.6);
    const passed = score >= passingScore;
    onComplete(passed, score);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="mt-10 p-16 flex flex-col items-center justify-center bg-card-dark rounded-2xl border border-border-dark shadow-2xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary-electric mb-6" />
        </motion.div>
        <p className="text-text-muted font-mono uppercase tracking-widest animate-pulse">A carregar exercícios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 p-10 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
        <p className="text-red-400 mb-6 font-bold text-lg">Ocorreu um erro ao carregar os exercícios.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all flex items-center gap-2 mx-auto shadow-lg"
        >
          <RefreshCw size={20} />
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mt-10 p-12 bg-card-dark rounded-2xl border border-border-dark text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-electric/10 rounded-full border border-primary-electric/20">
            <BrainCircuit className="w-10 h-10 text-primary-electric" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Exercícios não disponíveis</h3>
        <p className="text-text-muted mb-8 max-w-md mx-auto text-lg">
          Os exercícios para esta aula ainda estão a ser gerados. Por favor, aguarde alguns instantes e recarregue a página.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="tech-button px-10 py-4 text-lg flex items-center gap-3 mx-auto"
        >
          <RefreshCw size={22} />
          Recarregar
        </button>
      </div>
    );
  }

  const percentage = (timeLeft / 120) * 100;

  return (
    <div className="mt-12 space-y-10">
      {/* Timer Section (Thermometer) */}
      {!showResults && (
        <div className="bg-card-dark p-6 rounded-2xl border border-border-dark shadow-2xl sticky top-20 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-white font-bold">
              <Timer className={cn("w-6 h-6", timeLeft < 30 ? "text-red-500 animate-pulse" : "text-primary-electric")} />
              <span className="uppercase tracking-widest text-sm font-mono">Tempo Restante:</span>
            </div>
            <span className={cn("font-mono text-2xl font-black", timeLeft < 30 ? "text-red-500" : "text-white")}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="h-3 w-full bg-bg-dark rounded-full overflow-hidden border border-border-dark p-[2px]">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "linear" }}
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentage > 50 ? "bg-gradient-to-r from-primary-electric to-neon-green" : percentage > 20 ? "bg-yellow-500" : "bg-red-500"
              )}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-white tracking-tight">Exercícios de Fixação</h3>
        {showResults && (
          <span className={cn(
            "px-6 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-widest border",
            Object.keys(selectedAnswers).length === questions.length && 
            questions.every((q, i) => q.options[selectedAnswers[i]] === q.correct_answer)
              ? "bg-neon-green/10 text-neon-green border-neon-green/20"
              : "bg-primary-electric/10 text-primary-electric border-primary-electric/20"
          )}>
            Pontuação: {questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0)}/{questions.length}
          </span>
        )}
      </div>

      {isTimeUp && !showResults && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-center animate-pulse">
          O tempo acabou! Suas respostas estão sendo avaliadas.
        </div>
      )}

      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <motion.div
            key={q.id || qIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIdx * 0.1 }}
            className="glass-card p-8 border border-border-dark shadow-2xl"
          >
            <h4 className="text-xl font-bold text-white mb-6 tracking-tight flex gap-4">
              <span className="text-primary-electric font-mono">{String(qIdx + 1).padStart(2, '0')}.</span>
              {q.question}
            </h4>
            <div className="space-y-4">
              {q.options.map((option, oIdx) => {
                const isSelected = selectedAnswers[qIdx] === oIdx;
                const isCorrect = q.correct_answer === option;
                const showCorrectness = showResults;

                // Animation variants
                const pulse = { scale: [1, 1.02, 1], transition: { duration: 0.3 } };
                const shake = { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } };

                let animate = {};
                if (showCorrectness) {
                  if (isCorrect) animate = pulse;
                  else if (isSelected && !isCorrect) animate = shake;
                }

                return (
                  <motion.button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(qIdx, oIdx)}
                    disabled={showResults || isTimeUp}
                    animate={animate}
                    className={cn(
                      "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                      showCorrectness
                        ? isCorrect
                          ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                          : isSelected
                            ? "bg-red-500/10 border-red-500/30 text-red-500"
                            : "bg-bg-dark/50 border-border-dark text-gray-600"
                        : isSelected
                          ? "bg-primary-electric/10 border-primary-electric text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          : "bg-bg-dark/50 border-border-dark hover:bg-white/5 hover:border-primary-electric/50 text-text-muted"
                    )}
                  >
                    <span className="relative z-10 text-lg font-medium">{option}</span>
                    {showCorrectness && isCorrect && <CheckCircle className="w-6 h-6 text-neon-green relative z-10" />}
                    {showCorrectness && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 relative z-10" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {!showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-6"
        >
          <button
            onClick={() => handleVerify()}
            className="tech-button px-12 py-4 text-lg"
          >
            Verificar Respostas
          </button>
        </motion.div>
      )}

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-10 rounded-3xl border text-center shadow-2xl relative overflow-hidden",
            questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0) >= Math.ceil(questions.length * 0.6)
              ? "bg-neon-green/10 border-neon-green/20"
              : "bg-red-500/10 border-red-500/20"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16"></div>
          <h4 className={cn(
            "text-3xl font-bold mb-3 tracking-tight",
            questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0) >= Math.ceil(questions.length * 0.6)
              ? "text-neon-green"
              : "text-red-400"
          )}>
            {questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0) >= Math.ceil(questions.length * 0.6)
              ? "Parabéns! Você passou."
              : "Você não atingiu a pontuação mínima."}
          </h4>
          <p className={cn(
            "mb-8 text-lg leading-relaxed",
            questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0) >= Math.ceil(questions.length * 0.6)
              ? "text-neon-green/80"
              : "text-red-400/80"
          )}>
            {questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0) >= Math.ceil(questions.length * 0.6)
              ? "A aula foi marcada como concluída. Você já pode avançar para a próxima."
              : "Revise o conteúdo e tente novamente para concluir a aula."}
          </p>
          
          {questions.reduce((acc, q, idx) => acc + (q.options[selectedAnswers[idx]] === q.correct_answer ? 1 : 0), 0) < Math.ceil(questions.length * 0.6) && (
            <button
              onClick={() => {
                setShowResults(false);
                setSelectedAnswers({});
                setTimeLeft(120);
                setIsTimeUp(false);
                window.scrollTo(0, 0);
              }}
              className="px-10 py-4 bg-white/5 text-white border border-border-dark rounded-xl font-bold hover:bg-white/10 transition-all shadow-lg"
            >
              Tentar Novamente
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
