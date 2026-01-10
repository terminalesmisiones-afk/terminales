import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { api } from '@/services/api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface GoogleSheetsSyncProps {
    onSyncSuccess?: () => void;
}

const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ onSyncSuccess }) => {
    const [csvUrl, setCsvUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSync = async () => {
        if (!csvUrl) {
            toast({
                title: "Error",
                description: "Por favor ingresa la URL del CSV",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await api.syncTerminals(csvUrl);
            toast({
                title: "Sincronización iniciada",
                description: "Los datos se están procesando. Actualiza la lista en unos instantes.",
            });
            setCsvUrl('');
            if (onSyncSuccess) onSyncSuccess();
        } catch (error: any) {
            console.error('Sync error:', error);
            toast({
                title: "Error de sincronización",
                description: error.message || "No se pudo conectar con el archivo CSV",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Sincronizar con Google Sheets</CardTitle>
                </div>
                <CardDescription>
                    Pega el enlace público CSV de tu hoja de cálculo para actualizar las terminales masivamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-end space-x-3">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="csv-url">URL del CSV Publicado</Label>
                        <Input
                            id="csv-url"
                            placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                            value={csvUrl}
                            onChange={(e) => setCsvUrl(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sincronizando...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Sincronizar
                            </>
                        )}
                    </Button>
                </div>
                <div className="mt-2 text-xs text-green-700">
                    Asegúrate de publicar la hoja desde: <strong>Archivo {'>'} Compartir {'>'} Publicar en la web {'>'} (CSV)</strong>
                </div>
            </CardContent>
        </Card>
    );
};

export default GoogleSheetsSync;
