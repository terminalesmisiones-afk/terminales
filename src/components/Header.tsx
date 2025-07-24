
import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="main-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Bus className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-gray-900">
              Terminales Misiones
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors flex items-center"
            >
              <Home className="h-4 w-4 mr-1" />
              Inicio
            </Link>
            <Link 
              to="/terminales" 
              className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              Terminales
            </Link>
            <Link 
              to="/empresas" 
              className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              Empresas
            </Link>
            <Link 
              to="/rutas" 
              className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              Rutas
            </Link>
            <Link 
              to="/contacto" 
              className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary p-2 transition-colors"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation - Sliding Panel */}
        <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 md:hidden mobile-menu-slide ${
          isMenuOpen ? 'open' : ''
        }`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Menú</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-primary p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <nav className="p-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary px-3 py-3 text-base font-medium transition-colors flex items-center border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Inicio
              </Link>
              <Link 
                to="/terminales" 
                className="text-gray-700 hover:text-primary px-3 py-3 text-base font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Terminales
              </Link>
              <Link 
                to="/empresas" 
                className="text-gray-700 hover:text-primary px-3 py-3 text-base font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Empresas
              </Link>
              <Link 
                to="/rutas" 
                className="text-gray-700 hover:text-primary px-3 py-3 text-base font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Rutas
              </Link>
              <Link 
                to="/contacto" 
                className="text-gray-700 hover:text-primary px-3 py-3 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
