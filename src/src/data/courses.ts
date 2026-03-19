export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string; // General course description
  lessons: Lesson[];
}

export const cursosIniciais: Course[] = [
  // Informática
  {
    id: 'info-basic',
    title: 'Informática Básica',
    category: 'Informática',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    description: 'Aprenda os conceitos fundamentais da computação, desde o hardware até o sistema operacional.',
    lessons: [
      {
        id: 'info-01',
        title: 'Aula 01: Introdução ao Hardware',
        description: 'Nesta aula introdutória, vamos explorar como o computador processa informações, o que é CPU, RAM e armazenamento.',
        videoUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
        duration: '15 min'
      },
      {
        id: 'info-02',
        title: 'Aula 02: Sistemas Operativos',
        description: 'Entenda a diferença entre Windows, macOS e Linux e como gerir ficheiros e pastas.',
        videoUrl: 'https://www.youtube.com/watch?v=p3q5zWCw8J4', // Placeholder
        duration: '20 min'
      },
      {
        id: 'info-03',
        title: 'Aula 03: Navegação Segura',
        description: 'Dicas essenciais para navegar na internet com segurança e evitar vírus e golpes.',
        videoUrl: 'https://www.youtube.com/watch?v=yrT5t05dZAI', // Placeholder
        duration: '18 min'
      }
    ]
  },
  {
    id: 'excel-pro',
    title: 'Microsoft Excel Profissional',
    category: 'Informática',
    thumbnail: 'https://images.unsplash.com/photo-1543286386-713df548e9cc?w=800&q=80',
    description: 'Domine as planilhas eletrônicas do básico ao avançado.',
    lessons: [
      {
        id: 'excel-01',
        title: 'Aula 01: Interface e Fórmulas Básicas',
        description: 'Conheça a interface do Excel e aprenda a fazer somas, médias e subtrações.',
        videoUrl: 'https://www.youtube.com/watch?v=Vl0H-qTclOg',
        duration: '25 min'
      },
      {
        id: 'excel-02',
        title: 'Aula 02: Tabelas Dinâmicas',
        description: 'Aprenda a resumir grandes quantidades de dados com tabelas dinâmicas.',
        videoUrl: 'https://www.youtube.com/watch?v=9pZ5Q_Z5x4w', // Placeholder
        duration: '30 min'
      }
    ]
  },
  // Estética
  {
    id: 'beauty-course',
    title: 'Curso de Beleza',
    category: 'Estética',
    thumbnail: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    description: 'Introdução aos cuidados com a pele e maquiagem.',
    lessons: [
      {
        id: 'beauty-01',
        title: 'Aula 01: Tipos de Pele',
        description: 'Descubra os tipos de pele e como identificar o seu para escolher os produtos certos.',
        videoUrl: 'https://www.youtube.com/watch?v=3w_O4d7h6jI',
        duration: '12 min'
      }
    ]
  },
  {
    id: 'texture-tech',
    title: 'Técnicas de Textura',
    category: 'Estética',
    thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
    description: 'Aprofunde-se em tratamentos capilares e texturização.',
    lessons: [
      {
        id: 'texture-01',
        title: 'Aula 01: Introdução a Texturas',
        description: 'Conceitos básicos sobre texturas capilares.',
        videoUrl: 'https://www.youtube.com/watch?v=lJ_1WjKj-iE',
        duration: '15 min'
      }
    ]
  },
  // Gastronomia
  {
    id: 'cooking-general',
    title: 'Culinária Geral',
    category: 'Gastronomia',
    thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80',
    description: 'Os segredos da cozinha profissional.',
    lessons: [
      {
        id: 'cooking-01',
        title: 'Aula 01: Cortes Básicos',
        description: 'Aprenda os cortes clássicos da culinária francesa: Julienne, Brunoise e mais.',
        videoUrl: 'https://www.youtube.com/watch?v=kRjC_rG_y9w',
        duration: '22 min'
      }
    ]
  },
  // Pintura
  {
    id: 'drawing-free',
    title: 'Desenho Livre e Visual',
    category: 'Pintura',
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    description: 'Liberte sua criatividade com técnicas de desenho livre.',
    lessons: [
      {
        id: 'drawing-01',
        title: 'Aula 01: Luz e Sombra',
        description: 'Como dar volume aos seus desenhos usando técnicas de sombreamento.',
        videoUrl: 'https://www.youtube.com/watch?v=ewMksAbgdBI',
        duration: '18 min'
      }
    ]
  },
  // Técnico
  {
    id: 'mobile-repair',
    title: 'Software de Telemóveis',
    category: 'Técnico',
    thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800&q=80',
    description: 'Manutenção e reparação de software mobile.',
    lessons: [
      {
        id: 'mobile-01',
        title: 'Aula 01: Diagnóstico Inicial',
        description: 'Como identificar problemas de software em smartphones Android e iOS.',
        videoUrl: 'https://www.youtube.com/watch?v=u1Qy5hWqYv8',
        duration: '20 min'
      }
    ]
  }
];

export const getCourseById = (id: string) => cursosIniciais.find(c => c.id === id);
