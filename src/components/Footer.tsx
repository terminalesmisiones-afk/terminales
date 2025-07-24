
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Terminales Misiones</h3>
                <p className="text-gray-400 text-sm">Horarios de colectivos</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Sistema integral para consultar horarios de colectivos en todas las 
              terminales de ómnibus de la Provincia de Misiones, Argentina.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Enlaces útiles</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => handleNavigation('/terminales')}
                  className="hover:text-white transition-colors text-left"
                >
                  Todas las terminales
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/empresas')}
                  className="hover:text-white transition-colors text-left"
                >
                  Empresas de transporte
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/rutas')}
                  className="hover:text-white transition-colors text-left"
                >
                  Rutas principales
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/contacto')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => handleNavigation('/ayuda')}
                  className="hover:text-white transition-colors text-left"
                >
                  Centro de ayuda
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/privacidad')}
                  className="hover:text-white transition-colors text-left"
                >
                  Política de privacidad
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025, Terminales de Misiones. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">
            Desarrollado por{' '}
            <a 
              href="https://guiapubli.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-300 transition-colors"
            >
              Guía Publi
            </a>
            {' '}para mejorar el transporte en la Provincia de Misiones
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
