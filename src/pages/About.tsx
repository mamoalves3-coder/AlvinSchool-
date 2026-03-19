import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  return (
    <div className="w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 h-full">
      <div className="max-w-3xl mx-auto">
        <Link to="/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o Login
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre a AlvinSchool</h1>
            
            <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
              <p className="text-lg leading-relaxed">
                A AlvinSchool é uma plataforma de ensino dedicada a transformar o futuro dos nossos alunos
                através de educação de excelência. Oferecemos cursos práticos e atualizados nas áreas de
                Informática, Estética, Gastronomia e muito mais.
              </p>

              <div className="grid sm:grid-cols-3 gap-6 py-8">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Nossa Missão</h3>
                  <p className="text-sm">Democratizar o acesso ao ensino técnico de qualidade.</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Nossa Comunidade</h3>
                  <p className="text-sm">Apoio contínuo e networking entre alunos e professores.</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Excelência</h3>
                  <p className="text-sm">Certificados de reconhecimento e conteúdo sempre atualizado.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Nossa História</h2>
              <p>
                Fundada com o objetivo de preencher a lacuna entre o ensino tradicional e as necessidades
                reais do mercado de trabalho, a AlvinSchool nasceu da paixão por ensinar e transformar vidas.
              </p>
              <p>
                Hoje, contamos com centenas de alunos formados e inseridos no mercado, provando que a
                educação prática e acessível é o melhor caminho para o sucesso profissional.
              </p>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-600" />
                  Certificados de Verificação
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm flex flex-col gap-4">
                    <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Award className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Certificado Digital Verificado</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Cada certificado emitido pela AlvinSchool possui um identificador único e um QR Code para verificação instantânea de autenticidade por empresas e recrutadores.
                      </p>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm flex flex-col gap-4">
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Target className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Conteúdo Atualizado</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        O nosso currículo é revisto trimestralmente para garantir que os alunos aprendem as ferramentas e técnicas mais recentes exigidas pelo mercado de trabalho.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <p className="text-amber-800 font-medium text-sm mb-2">
                    Nota Importante:
                  </p>
                  <p className="text-amber-700 text-sm italic">
                    "Os nossos certificados são de reconhecimento profissional para enriquecimento do currículo, não sendo destinados a concursos públicos, mas sim para destacar as suas competências no mercado de trabalho."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
