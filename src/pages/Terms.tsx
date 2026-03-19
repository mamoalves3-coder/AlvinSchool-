import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const Terms: React.FC = () => {
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
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Termos e Condições</h1>
            </div>
            
            <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
              <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao aceder e utilizar a plataforma AlvinSchool, concorda em cumprir e ficar vinculado aos seguintes
                termos e condições de utilização. Se não concordar com qualquer parte destes termos, não deverá
                utilizar o nosso serviço.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Uso da Plataforma</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>O acesso aos cursos é pessoal e intransmissível.</li>
                <li>É estritamente proibida a partilha de credenciais de acesso.</li>
                <li>O conteúdo disponibilizado (vídeos, e-books, testes) está protegido por direitos de autor.</li>
                <li>Não é permitida a reprodução, distribuição ou venda do material didático.</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Pagamentos e Reembolsos</h2>
              <p>
                Os pagamentos dos cursos e e-books são processados de forma segura. O acesso ao conteúdo é
                libertado após a confirmação do pagamento pelo administrador. Em caso de insatisfação, o
                reembolso pode ser solicitado no prazo de 7 dias após a compra, sujeito a análise.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Certificados</h2>
              <p>
                Os certificados de conclusão são emitidos automaticamente após a aprovação no exame final de
                cada curso (nota mínima exigida). O certificado é digital e pode ser validado através da nossa
                plataforma.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Privacidade e Dados</h2>
              <p>
                A AlvinSchool compromete-se a proteger a privacidade dos seus utilizadores. Os dados pessoais
                recolhidos são utilizados exclusivamente para fins de faturação, emissão de certificados e
                comunicação relacionada com os cursos. Não partilhamos dados com terceiros sem consentimento.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Alterações aos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em
                vigor imediatamente após a sua publicação na plataforma. O uso continuado do serviço constitui
                a aceitação dos novos termos.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
