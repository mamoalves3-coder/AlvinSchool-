import React, { createContext, useContext, useState, useEffect } from 'react';
import { cursosIniciais } from '../data/courses';
import { supabase } from '../lib/supabase';
import { generateAssessmentsForLesson } from '../services/geminiService';

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
  order: number;
  is_free?: boolean;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
  description: string;
  lessons: Lesson[];
}

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addLesson: (courseId: string, lesson: Omit<Lesson, 'id'>) => Promise<void>;
  updateLesson: (courseId: string, lessonId: string, lesson: Partial<Lesson>) => Promise<void>;
  deleteLesson: (courseId: string, lessonId: string) => Promise<void>;
  reorderLessons: (courseId: string, newOrder: Lesson[]) => Promise<void>;
  announcementVideoUrl: string;
  updateAnnouncementVideo: (url: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcementVideoUrl, setAnnouncementVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'announcement_video_url')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching settings:', error);
      }

      if (data) {
        setAnnouncementVideoUrl(data.value);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    }
  };

  const updateAnnouncementVideo = async (url: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'announcement_video_url', value: url }, { onConflict: 'key' });

      if (error) throw error;
      setAnnouncementVideoUrl(url);
    } catch (error) {
      console.error('Error updating announcement video:', error);
      alert('Erro ao atualizar vídeo de anúncio. Verifique se a tabela app_settings existe.');
    }
  };

  const fetchCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*, lessons(*)');

      if (coursesError) throw coursesError;

      if (!coursesData || coursesData.length === 0) {
        // Seed initial courses
        await seedCourses();
      } else {
        // Transform data to match Course interface
        const formattedCourses: Course[] = coursesData.map((c: any) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          thumbnail: c.thumbnail,
          description: c.description,
          lessons: (c.lessons || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((l: any) => ({
              id: l.id,
              title: l.title,
              videoUrl: l.video_url,
              duration: l.duration,
              description: l.description,
              order: l.order,
              is_free: l.is_free
            }))
        }));
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedCourses = async () => {
    try {
      for (const course of cursosIniciais) {
        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: course.title,
            category: course.category,
            thumbnail: course.thumbnail,
            description: course.description
          })
          .select()
          .single();

        if (courseError) throw courseError;

        if (newCourse) {
          const lessonsToInsert = course.lessons.map((l, index) => ({
            course_id: newCourse.id,
            title: l.title,
            video_url: l.videoUrl,
            duration: l.duration,
            description: l.description,
            order: index + 1
          }));

          const { error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsToInsert);

          if (lessonsError) throw lessonsError;
        }
      }
      // Re-fetch after seeding
      await fetchCourses();
    } catch (error) {
      console.error('Error seeding courses:', error);
    }
  };

  const addCourse = async (course: Omit<Course, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: course.title,
          category: course.category,
          thumbnail: course.thumbnail,
          description: course.description
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const updateCourse = async (id: string, course: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: course.title,
          category: course.category,
          thumbnail: course.thumbnail,
          description: course.description
        })
        .eq('id', id);

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const addLesson = async (courseId: string, lesson: Omit<Lesson, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: lesson.title,
          video_url: lesson.videoUrl,
          duration: lesson.duration,
          description: lesson.description,
          order: lesson.order,
          is_free: lesson.is_free
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data && data.description) {
        // Generate assessments in the background
        generateAssessmentsForLesson(data.id, data.description);
      }
      
      await fetchCourses();
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  const updateLesson = async (courseId: string, lessonId: string, lesson: Partial<Lesson>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: lesson.title,
          video_url: lesson.videoUrl,
          duration: lesson.duration,
          description: lesson.description,
          order: lesson.order,
          is_free: lesson.is_free
        })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      if (data && data.description && lesson.description) {
        // Generate assessments in the background
        generateAssessmentsForLesson(data.id, data.description);
      }

      await fetchCourses();
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const deleteLesson = async (courseId: string, lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const reorderLessons = async (courseId: string, newOrder: Lesson[]) => {
    try {
      const updates = newOrder.map((lesson, index) => 
        supabase
          .from('lessons')
          .update({ order: index + 1 })
          .eq('id', lesson.id)
      );

      await Promise.all(updates);
      await fetchCourses();
    } catch (error) {
      console.error('Error reordering lessons:', error);
    }
  };

  return (
    <CourseContext.Provider value={{ 
      courses, 
      loading,
      addCourse, 
      updateCourse, 
      deleteCourse, 
      addLesson, 
      updateLesson, 
      deleteLesson, 
      reorderLessons,
      announcementVideoUrl,
      updateAnnouncementVideo
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
