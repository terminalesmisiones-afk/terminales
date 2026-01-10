
import React, { useState, useEffect } from 'react';
import { Save, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const PaymentSettings = () => {
    const { toast } = useToast();
    const [config, setConfig] = useState({
        accessToken: '',
        publicKey: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await api.getSettings('mercadopago_config');
            if (data) setConfig(data);
        };
        load();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.saveSettings('mercadopago_config', config);
            toast({ title: 'Configuración guardada', description: 'Credenciales de MercadoPago actualizadas.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Error al guardar.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pagos y Monetización</h2>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        MercadoPago
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Access Token (Production)</Label>
                        <Input
                            type="password"
                            value={config.accessToken}
                            onChange={e => setConfig({ ...config, accessToken: e.target.value })}
                            placeholder="APP_USR-..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Public Key</Label>
                        <Input
                            value={config.publicKey}
                            onChange={e => setConfig({ ...config, publicKey: e.target.value })}
                            placeholder="APP_USR-..."
                        />
                    </div>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Credenciales'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSettings;
