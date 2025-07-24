
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactInfoProps {
  terminal: {
    phone: string;
    email?: string;
    address: string;
  };
}

const ContactInfo: React.FC<ContactInfoProps> = ({ terminal }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Información de Contacto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <Phone className="h-4 w-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 break-words">{terminal.phone}</div>
            <div className="text-sm text-gray-500">Teléfono principal</div>
          </div>
        </div>
        {terminal.email && (
          <div className="flex items-start">
            <Mail className="h-4 w-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 break-words overflow-wrap-anywhere">{terminal.email}</div>
              <div className="text-sm text-gray-500">Email de contacto</div>
            </div>
          </div>
        )}
        <div className="flex items-start">
          <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 break-words">{terminal.address}</div>
            <div className="text-sm text-gray-500">Dirección</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;
