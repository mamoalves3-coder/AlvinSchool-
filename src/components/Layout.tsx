import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show header on login/register/about/terms pages
  const isAuthPage = ['/login', '/register', '/about', '/terms'].includes(location.pathname);

  // WhatsApp Support Button
  const WhatsAppButton = () => (
    <motion.a
      href={`https://wa.me/258864218815?text=${encodeURIComponent(`Olá Alvino, sou o ${user?.name || 'Visitante'} e preciso de ajuda.`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center gap-2 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle size={24} fill="white" className="text-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
        Falar com o Administrador
      </span>
    </motion.a>
  );

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-dark">
        <main className="flex-grow flex flex-col">
          <Outlet />
        </main>
        <footer className="bg-bg-dark border-t border-border-dark py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} AlvinSchool. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-sm text-text-muted hover:text-primary-electric transition-colors">
                Sobre Nós
              </Link>
              <Link to="/terms" className="text-sm text-text-muted hover:text-primary-electric transition-colors">
                Termos e Condições
              </Link>
            </div>
          </div>
        </footer>
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <header className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-bold text-white">
              Alvin<span className="text-primary-electric">School</span>
            </Link>

            {user && user.role !== 'admin' && (
              <nav className="hidden md:flex gap-6">
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' ? 'text-primary-electric' : 'text-text-muted hover:text-white'
                  }`}
                >
                  Meus Cursos
                </Link>
                <Link 
                  to="/biblioteca" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/biblioteca' ? 'text-primary-electric' : 'text-text-muted hover:text-white'
                  }`}
                >
                  Biblioteca
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className="text-xs text-text-muted capitalize">{user.role === 'admin' ? 'Administrador' : 'Estudante'}</span>
                </div>
                <div className="h-8 w-8 bg-primary-electric/20 rounded-full flex items-center justify-center text-primary-electric font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-bg-dark border-t border-border-dark py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} AlvinSchool. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-text-muted hover:text-primary-electric transition-colors">
              Sobre Nós
            </Link>
            <Link to="/terms" className="text-sm text-text-muted hover:text-primary-electric transition-colors">
              Termos e Condições
            </Link>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
};
