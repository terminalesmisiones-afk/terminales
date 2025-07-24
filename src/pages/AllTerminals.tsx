
import React from 'react';
import { MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TerminalsGrid from '@/components/TerminalsGrid';

const AllTerminals = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Todas las Terminales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra todas las terminales de ómnibus de la Provincia de Misiones. 
            Información completa de horarios, ubicaciones y servicios disponibles.
          </p>
        </div>

        <TerminalsGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default AllTerminals;
