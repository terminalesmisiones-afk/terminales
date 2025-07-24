
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contacto
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes alguna consulta o sugerencia? Estamos aquí para ayudarte. 
            Contáctanos y te responderemos a la brevedad.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a 
                      href="mailto:info@terminalesmisiones.com"
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      info@terminalesmisiones.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-semibold">Teléfono</p>
                    <a 
                      href="tel:+543764430000"
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      +54 376 443-0000
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <p className="font-semibold">Dirección</p>
                    <p className="text-gray-600">
                      Av. Quaranta 2570<br />
                      Posadas, Misiones<br />
                      Argentina
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horarios de Atención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Lunes a Viernes</span>
                    <span className="font-semibold text-primary">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Sábados</span>
                    <span className="font-semibold text-primary">9:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Domingos</span>
                    <span className="font-semibold text-gray-500">Cerrado</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Para consultas urgentes fuera del horario de atención, 
                    puede escribirnos por email y le responderemos a la brevedad.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
