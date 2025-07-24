
import React from 'react';
import { Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600">
            Tu privacidad es importante para nosotros. Conoce cómo recopilamos, 
            usamos y protegemos tu información.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Recopilamos información que nos proporcionas directamente, como cuando:
              </p>
              <ul>
                <li>Utilizas nuestros servicios de búsqueda de horarios</li>
                <li>Te pones en contacto con nosotros</li>
                <li>Permites el acceso a tu ubicación para encontrar terminales cercanas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Cómo Usamos tu Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Utilizamos la información recopilada para:
              </p>
              <ul>
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Responder a tus consultas y solicitudes</li>
                <li>Enviar actualizaciones importantes sobre el servicio</li>
                <li>Personalizar tu experiencia de usuario</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Compartir Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                No vendemos, intercambiamos ni transferimos tu información personal 
                a terceros sin tu consentimiento, excepto en los siguientes casos:
              </p>
              <ul>
                <li>Cuando sea requerido por ley</li>
                <li>Para proteger nuestros derechos y seguridad</li>
                <li>Con proveedores de servicios que nos ayudan a operar nuestro sitio</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Seguridad de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas 
                para proteger tu información personal contra acceso no autorizado, 
                alteración, divulgación o destrucción.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Tus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Tienes derecho a:
              </p>
              <ul>
                <li>Acceder a tu información personal</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al procesamiento de tu información</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Utilizamos cookies para mejorar tu experiencia de navegación. 
                Puedes configurar tu navegador para rechazar cookies, aunque 
                esto puede afectar la funcionalidad del sitio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos en:
              </p>
              <p>
                <strong>Email:</strong> privacidad@terminalesmisiones.com<br />
                <strong>Teléfono:</strong> +54 376 443-0000
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cambios en la Política</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Nos reservamos el derecho de actualizar esta Política de Privacidad. 
                Los cambios serán publicados en esta página con la fecha de última actualización.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Última actualización:</strong> 27 de junio de 2024
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
