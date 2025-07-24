
import React from 'react';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpCenter = () => {
  const faqs = [
    {
      question: "¿Cómo puedo consultar los horarios de mi terminal?",
      answer: "Puedes buscar tu terminal usando el buscador principal en la página de inicio, o navegando por la lista de todas las terminales disponibles."
    },
    {
      question: "¿Los horarios están actualizados?",
      answer: "Sí, trabajamos constantemente para mantener los horarios actualizados. Sin embargo, recomendamos verificar con la terminal antes de viajar."
    },
    {
      question: "¿Puedo reservar pasajes a través de esta plataforma?",
      answer: "No, somos un servicio de información de horarios. Para reservar pasajes debes contactar directamente con las empresas de transporte."
    },
    {
      question: "¿Cómo reporto un error en los horarios?",
      answer: "Puedes reportar errores a través de nuestro formulario de contacto o enviando un email a info@terminalesmisiones.com"
    },
    {
      question: "¿La aplicación funciona sin internet?",
      answer: "Necesitas conexión a internet para acceder a la información más actualizada de horarios y terminales."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra respuestas a las preguntas más frecuentes y obtén ayuda 
            para usar nuestra plataforma de horarios de terminales.
          </p>
        </div>

        {/* Preguntas Frecuentes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contacto Directo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Chat en Vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Habla con nuestro equipo de soporte en tiempo real.
              </p>
              <p className="text-sm text-gray-500">
                Lunes a Viernes: 9:00 - 18:00
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Soporte Telefónico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">
                Llámanos para obtener ayuda inmediata.
              </p>
              <p className="font-semibold">+54 376 443-0000</p>
              <p className="text-sm text-gray-500">
                Lunes a Viernes: 8:00 - 20:00
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">
                Envíanos tu consulta por email.
              </p>
              <p className="font-semibold">soporte@terminalesmisiones.com</p>
              <p className="text-sm text-gray-500">
                Respuesta en 24 horas
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
