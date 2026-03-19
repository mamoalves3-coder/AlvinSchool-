import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, BookOpen, GraduationCap, ArrowRight, UserPlus, Loader2, Code, Palette, Cpu, Globe, Zap } from 'lucide-react';

const FloatingIcon = ({ icon: Icon, delay, x, y, size = 24 }: { icon: any, delay: number, x: string, y: string, size?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.1, 0.3, 0.1],
      y: ['0%', '-20%', '0%'],
      x: ['0%', '10%', '0%'],
    }}
    transition={{ 
      duration: 5 + Math.random() * 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute text-indigo-400/20"
    style={{ left: x, top: y }}
  >
    <Icon size={size} />
  </motion.div>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        if (email === 'mamoalves3@gmail.com' || result.role === 'admin') {
          window.location.replace('/admin');
        } else {
          window.location.replace('/dashboard');
        }
      } else {
        setError('E-mail ou senha incorretos. Por favor, tente novamente.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('E-mail ou senha incorretos. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white flex h-screen overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[520px] z-10 bg-white shadow-2xl">
        <div className="flex-1 flex flex-col justify-center mx-auto w-full max-w-sm lg:w-96">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                Aprender não ocupa espaço <span className="text-indigo-600 block sm:inline">AlvinSchool</span>
              </span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="mt-3 text-gray-500">
              Aceda à sua conta para continuar a sua jornada de aprendizagem.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Endereço de e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  <Link to="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                    Esqueceu a senha?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-red-50 p-4 border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Entrar na Plataforma
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Ainda não tem uma conta?
                <Link to="/register" className="ml-2 font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Registe-se agora
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-auto pt-8 flex items-center justify-center gap-6 text-xs font-medium text-gray-400 uppercase tracking-widest">
          <Link to="/about" className="hover:text-indigo-600 transition-colors">Sobre</Link>
          <Link to="/terms" className="hover:text-indigo-600 transition-colors">Termos</Link>
        </div>
      </div>

      {/* Right Side - Dark Animated Experience */}
      <div className="hidden lg:block relative flex-1 bg-[#0a0a0f] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Floating Icons Grid */}
          <FloatingIcon icon={Code} delay={0} x="15%" y="20%" size={32} />
          <FloatingIcon icon={Palette} delay={1} x="75%" y="15%" size={28} />
          <FloatingIcon icon={Cpu} delay={2} x="45%" y="40%" size={40} />
          <FloatingIcon icon={Globe} delay={3} x="20%" y="70%" size={24} />
          <FloatingIcon icon={Zap} delay={4} x="80%" y="65%" size={36} />
          <FloatingIcon icon={BookOpen} delay={1.5} x="60%" y="80%" size={20} />
          <FloatingIcon icon={GraduationCap} delay={2.5} x="10%" y="45%" size={30} />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap size={14} className="text-indigo-400" />
              Futuro da Educação
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Domine as <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Tecnologias</span> do Amanhã
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed mb-12">
              Uma experiência de aprendizagem imersiva, desenhada para transformar a sua carreira com cursos práticos e certificados reconhecidos.
            </p>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
              <div>
                <div className="text-2xl font-bold text-white">+20</div>
                <div className="text-xs text-gray-500 uppercase tracking-tighter">Cursos Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-gray-500 uppercase tracking-tighter">Online & Flexível</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Suporte</div>
                <div className="text-xs text-gray-500 uppercase tracking-tighter">Especializado</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};
