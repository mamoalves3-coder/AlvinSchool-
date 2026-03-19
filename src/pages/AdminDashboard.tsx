import React, { useEffect, useState } from 'react';
import { useAuth, User } from '../context/AuthContext';
import { useCourse, Course, Lesson } from '../context/CourseContext';
import { supabase, ExamResult, Ebook } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getEmbedUrl } from '../lib/utils';
import { 
  CheckCircle, 
  MessageCircle, 
  Search, 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  X,
  Save,
  PlayCircle,
  Award,
  Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard: React.FC = () => {
  const { user, getAllUsers, updateUserStatus } = useAuth();
  const { courses, addCourse, updateCourse, deleteCourse, addLesson, updateLesson, deleteLesson, announcementVideoUrl, updateAnnouncementVideo } = useCourse();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'students' | 'requests' | 'courses' | 'grades' | 'ebooks' | 'settings'>('students');
  const [users, setUsers] = useState<User[]>([]);
  const [examResults, setExamResults] = useState<Record<string, any[]>>({});
  const [allExamResults, setAllExamResults] = useState<ExamResult[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Course Management State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<{ title: string; description: string; thumbnail: string; category: string; lessons: any[] }>({ title: '', description: '', thumbnail: '', category: 'Geral', lessons: [] });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Ebook Management State
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [ebookForm, setEbookForm] = useState({ title: '', description: '', price: '', cover_url: '', active: true });
  
  // Lesson Management State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', duration: '', description: '', order: 1, is_free: false });
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  // Settings State
  const [announcementUrl, setAnnouncementUrl] = useState(announcementVideoUrl);

  useEffect(() => {
    setAnnouncementUrl(announcementVideoUrl);
  }, [announcementVideoUrl]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const loadData = async () => {
      // Load Users
      if (activeTab === 'students' || activeTab === 'requests') {
        const allUsers = await getAllUsers();
        setUsers(allUsers.filter(u => u.role !== 'admin'));
      }

      // Load Exam Results for Students Tab
      if (activeTab === 'students') {
        const { data: resultsData } = await supabase
          .from('exam_results')
          .select('*, courses(title)');
        
        if (resultsData) {
          const resultsMap: Record<string, any[]> = {};
          resultsData.forEach((result: any) => {
            if (!resultsMap[result.user_id]) {
              resultsMap[result.user_id] = [];
            }
            resultsMap[result.user_id].push(result);
          });
          setExamResults(resultsMap);
        }
      }

      // Load All Exam Results for Grades Tab
      if (activeTab === 'grades') {
        const { data, error } = await supabase
          .from('exam_results')
          .select('*, profiles(name, email), courses(title)')
          .order('created_at', { ascending: false });
        
        if (error) console.error('Error fetching exam results:', error);
        if (data) setAllExamResults(data);
      }

      // Load Ebooks for Ebooks Tab
      if (activeTab === 'ebooks') {
        const { data, error } = await supabase
          .from('ebooks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) console.error('Error fetching ebooks:', error);
        if (data) setEbooks(data);
      }
    };

    loadData();
  }, [user, getAllUsers, activeTab]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-red-900 mb-2">Acesso Restrito</h1>
        <p className="text-red-700">Apenas o Administrador Alvino pode entrar aqui.</p>
        <button onClick={() => navigate('/login')} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Voltar ao Login
        </button>
      </div>
    );
  }

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const handleApproveStudent = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('aprovar_aluno', { p_user_id: userId });
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'pago' } : u));
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Erro ao aprovar aluno. Tente novamente.');
    }
  };

  const handleConfirmPayment = (userId: string) => {
    updateUserStatus(userId, 'pago');
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'pago' } : u));
  };

  // Course Handlers
  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({ title: course.title, description: course.description, thumbnail: course.thumbnail || '', category: course.category || 'Geral', lessons: course.lessons || [] });
    } else {
      setEditingCourse(null);
      setCourseForm({ title: '', description: '', thumbnail: '', category: 'Geral', lessons: [] });
    }
    setIsCourseModalOpen(true);
  };

  const saveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse(editingCourse.id, courseForm);
    } else {
      addCourse(courseForm);
    }
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (id: string) => {
    confirmAction(
      'Excluir Curso',
      'Tem certeza que deseja excluir este curso?',
      () => {
        deleteCourse(id);
        closeConfirmModal();
      }
    );
  };

  // Lesson Handlers
  const openLessonModal = (courseId: string, lesson?: Lesson) => {
    setCurrentCourseId(courseId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({ 
        title: lesson.title, 
        videoUrl: lesson.videoUrl, 
        duration: lesson.duration || '', 
        description: lesson.description || '',
        order: lesson.order,
        is_free: lesson.is_free || false
      });
    } else {
      setEditingLesson(null);
      // Auto-increment order
      const course = courses.find(c => c.id === courseId);
      const nextOrder = course ? course.lessons.length + 1 : 1;
      setLessonForm({ title: '', videoUrl: '', duration: '', description: '', order: nextOrder, is_free: false });
    }
    setIsLessonModalOpen(true);
  };

  const saveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourseId) return;

    const formattedLesson = {
      ...lessonForm,
      videoUrl: getEmbedUrl(lessonForm.videoUrl)
    };

    if (editingLesson) {
      updateLesson(currentCourseId, editingLesson.id, formattedLesson);
    } else {
      addLesson(currentCourseId, formattedLesson);
    }
    setIsLessonModalOpen(false);
  };

  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    confirmAction(
      'Excluir Aula',
      'Tem certeza que deseja excluir esta aula?',
      () => {
        deleteLesson(courseId, lessonId);
        closeConfirmModal();
      }
    );
  };

  // Ebook Handlers
  const openEbookModal = (ebook?: Ebook) => {
    if (ebook) {
      setEditingEbook(ebook);
      setEbookForm({
        title: ebook.title,
        description: ebook.description || '',
        price: ebook.price.toString(),
        cover_url: ebook.cover_url,
        active: ebook.active
      });
    } else {
      setEditingEbook(null);
      setEbookForm({ title: '', description: '', price: '', cover_url: '', active: true });
    }
    setIsEbookModalOpen(true);
  };

  const saveEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    const ebookData = {
      title: ebookForm.title,
      description: ebookForm.description,
      price: parseFloat(ebookForm.price),
      cover_url: ebookForm.cover_url,
      active: ebookForm.active
    };

    if (editingEbook) {
      const { error } = await supabase.from('ebooks').update(ebookData).eq('id', editingEbook.id);
      if (!error) {
        setEbooks(ebooks.map(eb => eb.id === editingEbook.id ? { ...eb, ...ebookData } : eb));
      }
    } else {
      const { data, error } = await supabase.from('ebooks').insert([ebookData]).select();
      if (!error && data) {
        setEbooks([data[0], ...ebooks]);
      }
    }
    setIsEbookModalOpen(false);
  };

  const deleteEbook = async (id: string) => {
    confirmAction(
      'Excluir E-book',
      'Tem certeza que deseja excluir este e-book?',
      async () => {
        const { error } = await supabase.from('ebooks').delete().eq('id', id);
        if (!error) {
          setEbooks(ebooks.filter(eb => eb.id !== id));
        }
        closeConfirmModal();
      }
    );
  };

  const toggleEbookStatus = async (ebook: Ebook) => {
    const newStatus = !ebook.active;
    const { error } = await supabase.from('ebooks').update({ active: newStatus }).eq('id', ebook.id);
    if (!error) {
      setEbooks(ebooks.map(eb => eb.id === ebook.id ? { ...eb, active: newStatus } : eb));
    }
  };

  const handleSaveAnnouncement = async () => {
    const embedUrl = getEmbedUrl(announcementUrl);
    await updateAnnouncementVideo(embedUrl);
    alert('Vídeo de anúncio atualizado com sucesso!');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  const filteredGrades = allExamResults.filter(r => 
    r.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.courses?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'requests', label: 'Solicitações', icon: Users },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'grades', label: 'Notas', icon: Award },
    { id: 'ebooks', label: 'E-books', icon: Book },
    { id: 'settings', label: 'Configurações', icon: Save }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Painel do Administrador</h1>
            <p className="text-slate-400 font-mono text-sm">SISTEMA DE GESTÃO v2.4.0</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'students' && (
          <>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar aluno..."
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Exames</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((student) => (
                      <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-white">{student.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">{student.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {examResults[student.id]?.map((exam: any) => (
                              <div key={exam.id} className="text-[10px] font-mono">
                                <span className="text-slate-500">{exam.courses?.title}:</span>
                                <span className={`ml-1 font-bold ${exam.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {exam.score}/20
                                </span>
                              </div>
                            )) || <span className="text-slate-600 text-[10px] italic font-mono">Sem exames</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider ${
                            student.status === 'pago' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {student.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <a
                              href={`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${student.name}, aqui é o Administrador da AlvinSchool.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all"
                            >
                              <MessageCircle size={18} />
                            </a>
                            {student.status === 'pendente' && (
                              <button 
                                onClick={() => handleConfirmPayment(student.id)} 
                                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                              >
                                <CheckCircle size={14} /> Confirmar
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-mono">Nenhum aluno encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar solicitação..."
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.filter(u => u.status === 'pendente').map((student) => (
                      <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-white">{student.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">{student.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                            Pendente
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <a
                              href={`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${student.name}, aqui é o Administrador da AlvinSchool.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all"
                            >
                              <MessageCircle size={18} />
                            </a>
                            <button 
                              onClick={() => handleApproveStudent(student.id)} 
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                            >
                              <CheckCircle size={14} /> Aprovar Acesso
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredUsers.filter(u => u.status === 'pendente').length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-mono">Nenhuma solicitação pendente.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'grades' && (
          <>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar por aluno ou curso..."
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Curso</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nota</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredGrades.map((result) => (
                      <motion.tr key={result.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
                              {result.profiles?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-white">{result.profiles?.name || 'Desconhecido'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{result.profiles?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {result.courses?.title || 'Curso Removido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-mono font-bold ${result.score >= 10 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.score} / 20
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider ${
                            result.passed 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {result.passed ? 'Aprovado' : 'Reprovado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                          {new Date(result.created_at).toLocaleDateString('pt-PT')}
                        </td>
                      </motion.tr>
                    ))}
                    {filteredGrades.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-mono">Nenhum resultado encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ebooks' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => openEbookModal()} className="tech-button flex items-center gap-2 px-6 py-2.5">
                <Plus size={20} /> Novo E-book
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ebooks.map(ebook => (
                <motion.div key={ebook.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden flex flex-col group">
                  <div className="h-48 bg-slate-900 relative overflow-hidden">
                    {ebook.cover_url ? (
                      <img src={ebook.cover_url} alt={ebook.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Book size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEbookModal(ebook)} className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-full text-blue-400 hover:text-blue-300 border border-slate-700">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteEbook(ebook.id)} className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-full text-rose-400 hover:text-rose-300 border border-slate-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2">{ebook.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{ebook.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-mono font-bold text-blue-400">{new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(ebook.price)}</span>
                      <button
                        onClick={() => toggleEbookStatus(ebook)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          ebook.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {ebook.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {ebooks.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 font-mono">
                  Nenhum e-book cadastrado.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Video className="text-blue-400" />
                </div>
                Vídeo de Anúncio (Home)
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    URL do Vídeo (YouTube)
                  </label>
                  <input
                    type="text"
                    value={announcementUrl}
                    onChange={(e) => setAnnouncementUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                  />
                  <p className="mt-2 text-[10px] text-slate-500 font-mono uppercase tracking-tight">
                    ESTE VÍDEO APARECERÁ EM DESTAQUE NO TOPO DA PÁGINA INICIAL PARA TODOS OS ALUNOS.
                  </p>
                </div>

                {announcementUrl && (
                  <div className="monitor-frame">
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                      <iframe
                        src={getEmbedUrl(announcementUrl)}
                        className="w-full h-full"
                        allowFullScreen
                        title="Preview do Anúncio"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleSaveAnnouncement}
                    className="tech-button w-full flex items-center justify-center gap-2 py-4"
                  >
                    <Save size={20} />
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Visualização em Grade"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    <span className="text-sm font-medium hidden sm:inline">Grade</span>
                  </div>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Visualização em Lista"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    <span className="text-sm font-medium hidden sm:inline">Lista</span>
                  </div>
                </button>
              </div>

              <button onClick={() => openCourseModal()} className="tech-button flex items-center gap-2 px-4 py-2">
                <Plus size={20} /> Novo Curso
              </button>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden flex flex-col group">
                    <div className="h-40 bg-slate-800 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <BookOpen size={48} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 flex gap-2 translate-y-[-10px] group-hover:translate-y-0 transition-transform">
                        <button onClick={() => openCourseModal(course)} className="p-2 bg-slate-900/90 rounded-full text-slate-300 hover:text-blue-400 border border-slate-700 backdrop-blur-sm">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-slate-900/90 rounded-full text-slate-300 hover:text-red-400 border border-slate-700 backdrop-blur-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{course.lessons.length} Aulas</span>
                          <button onClick={() => openLessonModal(course.id)} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                            <Plus size={16} /> Adicionar Aula
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {course.lessons.sort((a, b) => a.order - b.order).map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 group/lesson hover:border-slate-600 transition-colors">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-xs font-mono text-slate-500 w-4">{lesson.order}.</span>
                                <span className="text-sm text-slate-300 truncate">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                <button onClick={() => openLessonModal(course.id, lesson)} className="p-1 text-slate-400 hover:text-blue-400">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteLesson(course.id, lesson.id)} className="p-1 text-slate-400 hover:text-red-400">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {course.lessons.length === 0 && (
                            <p className="text-xs text-center text-slate-500 py-2 italic">Nenhuma aula cadastrada</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider w-1/3">Curso / Aula</th>
                        <th className="px-6 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Vídeo URL</th>
                        <th className="px-6 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Duração</th>
                        <th className="px-6 py-3 text-right text-xs font-mono text-slate-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {courses.map(course => (
                        <React.Fragment key={course.id}>
                          {/* Course Header Row */}
                          <tr className="bg-slate-800/30">
                            <td className="px-6 py-4 whitespace-nowrap" colSpan={3}>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                  <BookOpen size={16} />
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-white">{course.title}</span>
                                  <span className="ml-2 text-xs font-mono text-slate-500 uppercase">({course.lessons.length} aulas)</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => openLessonModal(course.id)}
                                  className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-1.5 rounded-md transition-colors border border-blue-500/20"
                                  title="Adicionar Aula"
                                >
                                  <Plus size={16} />
                                </button>
                                <button 
                                  onClick={() => openCourseModal(course)}
                                  className="text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 p-1.5 rounded-md transition-colors border border-yellow-500/20"
                                  title="Editar Curso"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded-md transition-colors border border-red-500/20"
                                  title="Excluir Curso"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Lessons Rows */}
                          {course.lessons.sort((a, b) => a.order - b.order).map(lesson => (
                            <tr key={lesson.id} className="hover:bg-slate-800/20 transition-colors group">
                              <td className="px-6 py-3 whitespace-nowrap pl-12">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-slate-600 w-6">{lesson.order.toString().padStart(2, '0')}</span>
                                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{lesson.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors">
                                  <Video size={12} /> Link
                                </a>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-slate-500">
                                {lesson.duration}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => openLessonModal(course.id, lesson)}
                                    className="text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 p-1.5 rounded-md transition-colors border border-yellow-500/20"
                                    title="Editar Aula"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLesson(course.id, lesson.id)}
                                    className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded-md transition-colors border border-red-500/20"
                                    title="Excluir Aula"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {course.lessons.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-3 text-center text-xs text-slate-500 italic bg-slate-800/10">
                                Nenhuma aula cadastrada neste curso.
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card max-w-md w-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">{editingCourse ? 'Editar Curso' : 'Novo Curso'}</h2>
                <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={saveCourse} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Título do Curso</label>
                  <input type="text" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                  <textarea required rows={3} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Categoria</label>
                  <select 
                    required 
                    value={courseForm.category} 
                    onChange={e => setCourseForm({...courseForm, category: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Informática">Informática</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Estética">Estética</option>
                    <option value="Gastronomia">Gastronomia</option>
                    <option value="Pintura">Pintura</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">URL da Thumbnail (Imagem)</label>
                  <input type="url" value={courseForm.thumbnail} onChange={e => setCourseForm({...courseForm, thumbnail: e.target.value})} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                  <button type="submit" className="tech-button px-6 py-2 flex items-center gap-2">
                    <Save size={18} /> Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {isLessonModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card max-w-md w-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">{editingLesson ? 'Editar Aula' : 'Nova Aula'}</h2>
                <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={saveLesson} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Título da Aula</label>
                  <input type="text" required value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">URL do Vídeo</label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input type="url" required value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} placeholder="https://youtube.com/..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Duração (ex: 10:00)</label>
                    <input type="text" value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Ordem</label>
                    <input type="number" required min="1" value={lessonForm.order} onChange={e => setLessonForm({...lessonForm, order: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Conteúdo da Aula (usado para gerar exercícios)</label>
                  <textarea required rows={4} value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Descreva o conteúdo da aula detalhadamente para que a IA possa gerar as perguntas corretamente." />
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <input type="checkbox" id="is_free" checked={lessonForm.is_free} onChange={e => setLessonForm({...lessonForm, is_free: e.target.checked})} className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                  <label htmlFor="is_free" className="text-sm text-slate-300">Aula Gratuita (Acesso liberado para todos)</label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                  <button type="submit" className="tech-button px-6 py-2 flex items-center gap-2">
                    <Save size={18} /> Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card max-w-md w-full overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h2>
                <p className="text-slate-400">{confirmModal.message}</p>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={closeConfirmModal} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                  <button onClick={confirmModal.onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 font-medium">Confirmar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ebook Modal */}
      <AnimatePresence>
        {isEbookModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingEbook ? 'Editar E-book' : 'Novo E-book'}
                </h2>
                <button onClick={() => setIsEbookModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={saveEbook} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Título</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={ebookForm.title}
                    onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    rows={3}
                    value={ebookForm.description}
                    onChange={(e) => setEbookForm({ ...ebookForm, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">Preço (MT)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={ebookForm.price}
                    onChange={(e) => setEbookForm({ ...ebookForm, price: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-slate-400 uppercase tracking-wider mb-1">URL da Capa</label>
                  <input
                    type="url"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={ebookForm.cover_url}
                    onChange={(e) => setEbookForm({ ...ebookForm, cover_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    checked={ebookForm.active}
                    onChange={(e) => setEbookForm({ ...ebookForm, active: e.target.checked })}
                  />
                  <label htmlFor="active" className="text-sm font-medium text-slate-300">Ativo no site</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEbookModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="tech-button px-6 py-2 flex items-center gap-2">
                    <Save size={18} /> Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
