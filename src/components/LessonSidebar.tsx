import React from 'react';
import { Lesson } from '../context/CourseContext';
import { CheckCircle, Play, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  completedLessons: string[];
  onSelectLesson: (lessonId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isPending?: boolean;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  currentLessonId,
  completedLessons,
  onSelectLesson,
  isOpen,
  onClose,
  isPending = false
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        className={cn(
          "fixed top-16 right-0 bottom-0 w-80 bg-card-dark border-l border-border-dark z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] lg:block overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b border-border-dark">
          <h3 className="font-bold text-white">Conteúdo do Curso</h3>
          <div className="flex justify-between items-end mt-1">
            <p className="text-xs text-text-muted">
              {completedLessons.length} de {lessons.length} aulas concluídas
            </p>
            <span className="text-xs font-mono text-primary-electric font-bold">
              {Math.round((completedLessons.length / lessons.length) * 100)}%
            </span>
          </div>
          {/* Progress Bar (Termômetro) */}
          <div className="w-full bg-bg-dark h-2 rounded-full mt-3 overflow-hidden border border-border-dark">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary-electric to-neon-green animate-progress"
              style={{ 
                width: `${(completedLessons.length / lessons.length) * 100}%`,
                '--progress-width': `${(completedLessons.length / lessons.length) * 100}%`
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="py-2">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = completedLessons.includes(lesson.id);
            
            // Sequence Lock: Locked if previous lesson is NOT completed
            const isSequenceLocked = index > 0 && !completedLessons.includes(lessons[index - 1].id);
            
            // Payment Lock: Locked if user is pending and lesson is NOT free
            const isPaymentLocked = isPending && !lesson.is_free;
            
            // Show lock icon if either condition is true
            const showLockIcon = isSequenceLocked || isPaymentLocked;
            
            // Disable click ONLY if sequence locked AND NOT payment locked.
            // If payment locked, we WANT them to click to see the "Locked Content" screen.
            const isDisabled = isSequenceLocked && !isPaymentLocked;

            return (
              <button
                key={lesson.id}
                onClick={() => {
                  if (!isDisabled) {
                    onSelectLesson(lesson.id);
                    if (window.innerWidth < 1024) onClose();
                  }
                }}
                disabled={isDisabled}
                className={cn(
                  "w-full text-left px-6 py-5 border-b border-border-dark/30 transition-all relative group",
                  isCurrent ? "bg-primary-electric/10" : "hover:bg-white/5",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted && !isPaymentLocked ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      </motion.div>
                    ) : isCurrent ? (
                      <Play className="w-5 h-5 text-primary-electric fill-primary-electric/20" />
                    ) : showLockIcon ? (
                      <Lock className={cn("w-4 h-4", isPaymentLocked ? "text-primary-electric" : "text-text-muted")} />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-border-dark text-[10px] flex items-center justify-center text-text-muted font-mono">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-semibold mb-1 transition-colors",
                      isCurrent ? "text-white" : "text-text-muted group-hover:text-white"
                    )}>
                      {lesson.title}
                    </p>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{lesson.duration}</p>
                  </div>
                </div>
                {isCurrent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-electric shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};
