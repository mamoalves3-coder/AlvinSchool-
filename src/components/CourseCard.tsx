import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { Course } from '../context/CourseContext';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-primary-electric/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          {course.category}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{course.title}</h3>
        <p className="text-text-muted text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">{course.description}</p>
        
        <Link 
          to={`/class/${course.id}`}
          className="tech-button w-full flex items-center justify-center gap-2 text-sm"
        >
          <PlayCircle size={18} />
          Aceder Aula
        </Link>
      </div>
    </motion.div>
  );
};
