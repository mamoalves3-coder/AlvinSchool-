import React, { useEffect, useState } from 'react';
import { supabase, Ebook } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ShoppingCart, Book, Loader2 } from 'lucide-react';

export const Library: React.FC = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary-electric" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white sm:text-5xl tracking-tight"
          >
            Biblioteca Digital <span className="text-primary-electric">AlvinSchool</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-text-muted"
          >
            Enriqueça o seu conhecimento com os nossos e-books exclusivos.
          </motion.p>
        </div>

        {ebooks.length === 0 ? (
          <div className="text-center py-20 bg-card-dark rounded-3xl border border-border-dark">
            <Book className="mx-auto h-16 w-16 text-text-muted opacity-20" />
            <h3 className="mt-4 text-lg font-medium text-white">Nenhum e-book disponível</h3>
            <p className="mt-2 text-text-muted">Volte mais tarde para novidades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {ebooks.map((ebook) => (
              <motion.div
                key={ebook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card flex flex-col group"
              >
                <div className="aspect-w-3 aspect-h-4 bg-gray-900 relative overflow-hidden">
                  {ebook.cover_url ? (
                    <img
                      src={ebook.cover_url}
                      alt={ebook.title}
                      className="w-full h-72 object-cover object-center group-hover:scale-110 transition-transform duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    />
                  ) : (
                    <div className="w-full h-72 flex items-center justify-center bg-primary-electric/5 text-primary-electric/20">
                      <Book size={64} />
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                    {ebook.title}
                  </h3>
                  {ebook.description && (
                    <p className="text-sm text-text-muted mb-6 line-clamp-3 flex-1 leading-relaxed">
                      {ebook.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-6 border-t border-border-dark">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-2xl font-bold text-primary-electric font-mono">
                        {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(ebook.price)}
                      </span>
                    </div>
                    
                    <a
                      href={`https://wa.me/258864218815?text=${encodeURIComponent(`Olá Alvin! Tenho interesse no e-book: ${ebook.title}. Como posso fazer o pagamento?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tech-button w-full flex items-center justify-center gap-2 !bg-emerald-600 hover:!bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    >
                      <ShoppingCart size={20} />
                      Comprar via WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
