
import React from 'react';
import { api } from '@/services/api';
import { Check, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const PricingCard = ({ title, price, features, onBuy }: any) => (
    <Card className="flex flex-col h-full border-2 hover:border-primary transition-colors">
        <CardHeader>
            <CardTitle className="text-xl font-bold text-center">{title}</CardTitle>
            <div className="text-center mt-4">
                <span className="text-4xl font-extrabold">${price}</span>
                <span className="text-gray-500">/mes</span>
            </div>
        </CardHeader>
        <CardContent className="flex-1">
            <ul className="space-y-3">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={() => onBuy(title, price)}>Contratar</Button>
        </CardFooter>
    </Card>
);

const Advertising = () => {
    const { toast } = useToast();

    const handleBuy = async (title: string, price: number) => {
        try {
            const data = await api.createPaymentPreference({
                title: `Publicidad: ${title}`,
                price: price,
                quantity: 1
            });

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                toast({ title: 'Error', description: 'No se pudo iniciar el pago. Configuración incompleta.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Fallo al conectar con el servidor.', variant: 'destructive' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero */}
            <section className="bg-gray-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Impulsa tu Marca en Misiones</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                        Llega a miles de pasajeros y turistas que recorren la provincia cada día. Tu anuncio en el lugar correcto.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">50,000+</h3>
                        <p className="text-gray-600">Usuarios Mensuales</p>
                    </div>
                    <div>
                        <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">High CTR</h3>
                        <p className="text-gray-600">Alta tasa de clics</p>
                    </div>
                    <div>
                        <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">100% Seguro</h3>
                        <p className="text-gray-600">Plataforma confiable</p>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="planes" className="py-20 container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Planes de Publicidad</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <PricingCard
                        title="Banner Home"
                        price="25000"
                        features={['Ubicación Premium (Inicio)', 'Visible en Móvil y PC', 'Reporte Mensual']}
                        onBuy={handleBuy}
                    />
                    <PricingCard
                        title="Banner Terminal"
                        price="15000"
                        features={['En página de Terminal específica', 'Ideal para negocios locales', 'Alta relevancia']}
                        onBuy={handleBuy}
                    />
                    <PricingCard
                        title="Pack Completo"
                        price="45000"
                        features={['Home + 3 Terminales', 'Diseño de Banner incluído', 'Soporte prioritario']}
                        onBuy={handleBuy}
                    />
                </div>
            </section>

            {/* Policies */}
            <section className="bg-gray-100 py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Políticas de Contratación</h2>
                    <div className="bg-white p-8 rounded-lg shadow-sm space-y-4 text-gray-600 text-sm leading-relaxed">
                        <p><strong>1. Duración del Servicio:</strong> Los planes se contratan por un periodo mínimo de 30 días renovables automáticamente salvo aviso previo de 72hs.</p>
                        <p><strong>2. Material Gráfico:</strong> El anunciante debe proveer los banners en las medidas solicitadas (JPG/PNG, máx 2MB). Ofrecemos servicio de diseño opcional.</p>
                        <p><strong>3. Contenido Permitido:</strong> No se aceptan anuncios de contenido adulto, apuestas ilegales, política partidaria ofensiva o cualquier material que infrinja leyes vigentes.</p>
                        <p><strong>4. Pagos:</strong> El servicio se activa una vez acreditado el pago vía MercadoPago. Se emite factura C o B según corresponda.</p>
                        <p><strong>5. Cancelación:</strong> Puede cancelar su suscripción en cualquier momento. No se realizan reembolsos por periodos parciales no utilizados.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Advertising;
