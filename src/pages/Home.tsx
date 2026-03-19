import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { CourseCard } from '../components/CourseCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export const Home: React.FC = () => {
  const { courses, announcementVideoUrl } = useCourse();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  const categories = ['Todos', ...Array.from(new Set(courses.map(c => c.category)))];
  
  const filteredCourses = selectedCategory === 'Todos' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Announcement Video Section */}
      {announcementVideoUrl && (
        <section className="bg-bg-dark py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="monitor-frame bg-gray-900">
                <div className="aspect-video">
                  <iframe
                    src={announcementVideoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Anúncio Importante"
                  />
                </div>
              </div>
              <div className="absolute -top-4 left-6">
                <span className="bg-primary-electric text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  Destaque
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-bg-dark border-b border-border-dark py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
            >
              Bem-vindo à <span className="text-primary-electric">AlvinSchool</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-text-muted mb-10"
            >
              Aprenda novas habilidades com nossos cursos práticos e interativos.
              Da tecnologia à gastronomia, temos o conteúdo certo para si.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary-electric text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-card-dark text-text-muted hover:bg-border-dark border border-border-dark'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum curso encontrado nesta categoria.</p>
          </div>
        )}
      </section>
    </div>
  );
};
