import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { Quiz } from '../components/Quiz';
import { LessonSidebar } from '../components/LessonSidebar';
import { FinalExam } from '../components/FinalExam';
import { Certificate } from '../components/Certificate';
import { ArrowLeft, BookOpen, Menu, ChevronRight, ChevronLeft, Lock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Classroom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses } = useCourse();
  const course = courses.find(c => c.id === id);
  const { user } = useAuth();
  
  // State
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lessonPassed, setLessonPassed] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [examDate, setExamDate] = useState<string>('');
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  // Load progress and exam results from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (course && user) {
        try {
          // Load progress
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('course_id', course.id);

          if (progressError) throw progressError;

          if (progressData) {
            setCompletedLessons(progressData.map(p => p.lesson_id));
          }

          // Load exam result
          const { data: examData, error: examError } = await supabase
            .from('exam_results')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (examData) {
            if (examData.passed) {
              setExamScore(examData.score);
              setExamDate(new Date(examData.created_at).toLocaleDateString('pt-PT'));
            } else {
              // If failed, we might want to show the score but allow retake
              setExamScore(examData.score);
            }
          }
        } catch (error) {
          console.error('Error loading classroom data:', error);
        }
      }
    };

    loadData();
  }, [course, user]);

  // Initialize with first lesson or last completed + 1
  useEffect(() => {
    if (course && course.lessons.length > 0 && !currentLessonId) {
      // Find the first uncompleted lesson, or the last lesson if all are completed
      const firstUncompletedIndex = course.lessons.findIndex(l => !completedLessons.includes(l.id));
      
      let initialLessonId = '';
      if (firstUncompletedIndex !== -1) {
        initialLessonId = course.lessons[firstUncompletedIndex].id;
      } else if (completedLessons.length > 0) {
        // All lessons completed, go to the last one
        initialLessonId = course.lessons[course.lessons.length - 1].id;
      } else {
        // No progress, start at the beginning
        initialLessonId = course.lessons[0].id;
      }
      setCurrentLessonId(initialLessonId);
      setIsVideoCompleted(completedLessons.includes(initialLessonId));
    }
  }, [course, currentLessonId, completedLessons]);

  if (!course) {
    return <Navigate to="/dashboard" replace />;
  }

  const currentLessonIndex = course.lessons.findIndex(l => l.id === currentLessonId);
  const currentLesson = course.lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === course.lessons.length - 1;
  const isFirstLesson = currentLessonIndex === 0;
  
  // Payment Logic
  const isPending = user?.status === 'pendente';
  // Lock if pending AND not the first lesson (index > 0)
  // This ensures Lesson 01 is always free.
  const isLocked = isPending && !currentLesson.is_free;

  const allLessonsCompleted = course.lessons.every(l => completedLessons.includes(l.id));

  const handleLessonComplete = async (passed: boolean, score: number) => {
    if (user) {
      try {
        // Save the result to student_results
        const { error: resultError } = await supabase
          .from('student_results')
          .insert({
            user_id: user.id,
            lesson_id: currentLessonId,
            score: score,
            passed: passed,
            created_at: new Date().toISOString()
          });

        if (resultError) console.error('Error saving student result:', resultError);
      } catch (error) {
        console.error('Error saving student result:', error);
      }
    }

    if (passed) {
      setLessonPassed(true);
      if (!completedLessons.includes(currentLessonId) && user) {
        try {
          const { error } = await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              course_id: course.id,
              lesson_id: currentLessonId,
              completed_at: new Date().toISOString()
            });

          if (error) throw error;
          setCompletedLessons(prev => [...prev, currentLessonId]);
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentLessonIndex + 1];
      setCurrentLessonId(nextLesson.id);
      setLessonPassed(false);
      setIsVideoCompleted(completedLessons.includes(nextLesson.id));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = course.lessons[currentLessonIndex - 1];
      setCurrentLessonId(prevLesson.id);
      setLessonPassed(completedLessons.includes(prevLesson.id));
      setIsVideoCompleted(completedLessons.includes(prevLesson.id));
      window.scrollTo(0, 0);
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setLessonPassed(completedLessons.includes(lessonId));
    setIsVideoCompleted(completedLessons.includes(lessonId));
    window.scrollTo(0, 0);
  };

  const handleExamSubmit = async (score: number) => {
    if (user) {
      try {
        const passed = score >= 10;
        const { error } = await supabase
          .from('exam_results')
          .insert({
            user_id: user.id,
            course_id: course.id,
            score: score,
            passed: passed,
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        setExamScore(score);
        setExamDate(new Date().toLocaleDateString('pt-PT'));
      } catch (error) {
        console.error('Error saving exam result:', error);
      }
    }
  };

  const handleShowCertificate = () => {
    setShowExam(false);
    setShowCertificate(true);
  };

  if (showCertificate && examScore !== null) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <div className="p-4">
          <button 
            onClick={() => setShowCertificate(false)}
            className="flex items-center gap-2 text-text-muted hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao Curso
          </button>
        </div>
        <Certificate 
          studentName={user?.name || 'Estudante'}
          courseName={course.title}
          score={examScore}
          date={examDate}
        />
      </div>
    );
  }

  if (showExam) {
    return (
      <div className="min-h-screen bg-bg-dark p-4 md:p-8">
        <div className="max-w-4xl mx-auto mb-6">
          <button 
            onClick={() => setShowExam(false)}
            className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Cancelar e Voltar
          </button>
        </div>
        <FinalExam 
          courseId={course.id}
          courseTitle={course.title}
          lessonDescriptions={course.lessons.map(l => l.description || '')}
          onClose={() => setShowExam(false)}
          onExamSubmit={handleExamSubmit}
          onShowCertificate={handleShowCertificate}
        />
      </div>
    );
  }

  if (!currentLesson) return null;

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      {/* Header */}
      <header className="glass-nav h-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-all"
              title="Voltar ao Catálogo"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white leading-tight">{course.title}</h1>
              <span className="text-[10px] font-mono text-primary-electric uppercase tracking-widest">{course.category}</span>
            </div>
            <div className="sm:hidden">
               <h1 className="text-sm font-bold text-white leading-tight truncate max-w-[150px]">{course.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-primary-electric font-bold text-xs bg-primary-electric/10 px-4 py-2 rounded-full border border-primary-electric/20">
              <BookOpen size={16} />
              <span className="uppercase tracking-wider">Sala de Aula</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-text-muted"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Pending Payment Banner */}
      {isPending && (
        <div className="bg-primary-electric text-white px-4 py-3 text-center shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <Lock size={18} className="text-white/80" />
            <p className="text-sm font-semibold">
              Amostra Grátis: Você está visualizando apenas as aulas gratuitas. Para desbloquear o curso completo, realize o pagamento.
            </p>
            <a 
              href={`https://wa.me/258864218815?text=${encodeURIComponent(`Olá Alvino, sou o ${user?.name} e gostaria de enviar o comprovativo de pagamento.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 sm:mt-0 px-6 py-1.5 bg-white text-primary-electric rounded-full text-xs font-bold hover:bg-gray-100 transition-all shadow-md"
            >
              Enviar Comprovativo
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:mr-80">
          {/* Video Section */}
          {isLocked ? (
            <div className="mb-10 bg-card-dark aspect-video rounded-2xl flex flex-col items-center justify-center text-white p-10 text-center shadow-2xl relative overflow-hidden border border-border-dark">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] z-0"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-bg-dark rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-border-dark">
                  <Lock className="w-12 h-12 text-primary-electric" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">Acesso Restrito</h2>
                <p className="text-text-muted mb-10 max-w-md text-lg leading-relaxed">
                  Acesso exclusivo para alunos aprovados. Entre em contacto com o Administrador via WhatsApp para ativar o seu curso.
                </p>
                <a 
                  href={`https://wa.me/258864218815?text=${encodeURIComponent(`Olá Alvino, sou o ${user?.name} e gostaria de enviar o comprovativo de pagamento para liberar o meu acesso ao curso.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tech-button px-10 py-4 text-lg flex items-center gap-3"
                >
                  <Lock size={20} />
                  Liberar Acesso Agora
                </a>
              </div>
            </div>
          ) : (
            <motion.div 
              key={currentLesson.videoUrl} // Force re-render on url change
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10"
            >
              <VideoPlayer 
                url={currentLesson.videoUrl} 
                title={currentLesson.title} 
                onEnded={() => setIsVideoCompleted(true)}
              />
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={handlePrevLesson}
              disabled={isFirstLesson}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                isFirstLesson 
                  ? "text-gray-700 cursor-not-allowed" 
                  : "text-text-muted hover:bg-white/5 hover:text-white border border-transparent hover:border-border-dark"
              )}
            >
              <ChevronLeft size={22} />
              Aula Anterior
            </button>

            <button
              onClick={handleNextLesson}
              disabled={isLastLesson}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg",
                isLastLesson
                  ? "bg-card-dark text-gray-700 cursor-not-allowed border border-border-dark"
                  : "tech-button"
              )}
            >
              Próxima Aula
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Content Section */}
          <motion.div
            key={currentLesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{currentLesson.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-primary-electric font-mono text-xs font-bold uppercase tracking-widest">{currentLesson.duration}</span>
                  <span className="w-1 h-1 bg-border-dark rounded-full"></span>
                  <span className="text-text-muted text-xs font-mono uppercase tracking-widest">ID: {currentLesson.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none text-text-muted leading-relaxed text-lg">
              <p>{currentLesson.description}</p>
            </div>

            <div className="my-12 border-t border-border-dark/50"></div>

            {/* Dynamic Quiz - Only show if not locked and video is completed */}
            {!isLocked && isVideoCompleted ? (
              <Quiz 
                lessonId={currentLesson.id} 
                onComplete={handleLessonComplete}
              />
            ) : !isLocked && !isVideoCompleted ? (
              <div className="mt-10 bg-bg-dark/50 rounded-2xl p-10 border border-border-dark text-center">
                <div className="w-20 h-20 bg-primary-electric/5 text-primary-electric/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-electric/10">
                  <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Exercício de Treino</h3>
                <p className="text-text-muted text-lg leading-relaxed max-w-md mx-auto">
                  Assista ao vídeo até o final para desbloquear o exercício de treino desta aula.
                </p>
              </div>
            ) : null}

            {/* Final Exam Section - Only show if all lessons completed */}
            {allLessonsCompleted && !isLocked && (
              <div className="mt-16 bg-gradient-to-br from-primary-electric/10 to-neon-green/10 rounded-3xl p-10 md:p-16 border border-primary-electric/20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-electric/5 blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-primary-electric/20 text-primary-electric rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-primary-electric/30">
                    <Award className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Parabéns! Você completou todas as aulas.</h3>
                  <p className="text-text-muted mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                    Você está pronto para realizar o Exame Final e obter o seu certificado. 
                    O exame contém 10 perguntas e você precisa de pelo menos 10 pontos para ser aprovado.
                  </p>
                  
                  {examScore !== null ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="text-2xl font-bold text-white">
                        Sua nota final: <span className={examScore >= 10 ? "text-neon-green" : "text-red-400"}>{examScore} / 20</span>
                      </div>
                      {examScore >= 10 ? (
                        <button
                          onClick={() => setShowCertificate(true)}
                          className="tech-button px-12 py-4 text-lg flex items-center gap-3 !bg-emerald-600 hover:!bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        >
                          <Award className="w-6 h-6" />
                          Ver Certificado
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowExam(true)}
                          className="tech-button px-12 py-4 text-lg"
                        >
                          Tentar Novamente
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowExam(true)}
                      className="tech-button px-12 py-4 text-lg flex items-center gap-3 mx-auto"
                    >
                      <BookOpen className="w-6 h-6" />
                      Realizar Exame Final
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </main>

        {/* Sidebar */}
        <LessonSidebar 
          lessons={course.lessons}
          currentLessonId={currentLessonId}
          completedLessons={completedLessons}
          onSelectLesson={handleSelectLesson}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isPending={isPending}
        />
      </div>
    </div>
  );
};
