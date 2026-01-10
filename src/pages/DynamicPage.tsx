import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { api } from '@/services/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import PageRenderer from '@/components/PageRenderer';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await api.getPageBySlug(slug);
                if (data) {
                    setPage(data);
                    document.title = `${data.title} | Mi Bus`;
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !page) {
        return <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600">Página no encontrada.</p>
                </div>
            </div>
            <Footer />
        </div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 w-full p-0">
                {page && <PageRenderer title={page.title} featured_image={page.featured_image} content={page.content} />}
            </main>
            <Footer />
        </div>
    );
};

export default DynamicPage;
