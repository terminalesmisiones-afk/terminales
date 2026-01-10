import React from 'react';
import { sanitizeHtml } from '@/utils/sanitizer';

interface PageRendererProps {
    title: string;
    featured_image?: string;
    content: string; // JSON string of sections
}

const PageRenderer: React.FC<PageRendererProps> = ({ title, featured_image, content }) => {
    return (
        <div className="bg-gray-50 min-h-full">
            {/* FEATURED IMAGE BANNER */}
            {featured_image && (
                <div className="w-full h-[300px] md:h-[400px] relative group overflow-hidden">
                    <img src={featured_image} alt={title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                        <div className="container mx-auto px-4 pb-8 md:pb-12">
                            <h1 className="text-3xl md:text-5xl font-bold text-white shadow-sm leading-tight">{title}</h1>
                        </div>
                    </div>
                </div>
            )}

            {!featured_image && (
                <div className="bg-white border-b py-12 px-4 shadow-sm">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
                    </div>
                </div>
            )}

            {/* SECTIONS RENDERER */}
            <div className="w-full">
                {(() => {
                    try {
                        const sections = JSON.parse(content);
                        if (!Array.isArray(sections)) throw new Error('Not blocks');

                        return (
                            <div className="flex flex-col gap-0">
                                {sections.map((section: any) => {
                                    // HERO BLOCK
                                    if (section.type === 'hero') {
                                        return (
                                            <div key={section.id} className="relative bg-gray-900 text-white py-20 px-4 overflow-hidden">
                                                {section.data.image && (
                                                    <div className="absolute inset-0 z-0">
                                                        <img src={section.data.image} alt="Hero" className="w-full h-full object-cover opacity-60" />
                                                    </div>
                                                )}
                                                <div className="relative z-10 max-w-4xl mx-auto text-center">
                                                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg">{section.data.title}</h2>
                                                    <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-md">{section.data.subtitle}</p>
                                                    {section.data.ctaText && (
                                                        <a href={section.data.ctaLink || '#'} className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl">
                                                            {section.data.ctaText}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // RICH TEXT BLOCK
                                    if (section.type === 'richtext') {
                                        return (
                                            <div key={section.id} className="w-full bg-white">
                                                <div className="max-w-4xl mx-auto px-4 py-12">
                                                    <div className="prose prose-lg max-w-none text-gray-700">
                                                        <div dangerouslySetInnerHTML={{ __html: section.data.content }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // FEATURES BLOCK
                                    if (section.type === 'features') {
                                        return (
                                            <div key={section.id} className="bg-gray-50 py-16 px-4">
                                                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {section.data.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary font-bold text-2xl overflow-hidden">
                                                                {item.icon ? <img src={item.icon} alt={item.title} className="w-full h-full object-cover" /> : (idx + 1)}
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-1 text-gray-900">{item.title}</h3>
                                                            {item.subtitle && <h4 className="text-md font-medium text-gray-500 mb-3">{item.subtitle}</h4>}
                                                            <div className="text-gray-600 leading-relaxed [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_h1]:!text-4xl [&_h1]:!font-bold [&_h1]:!mb-2 [&_h2]:!text-3xl [&_h2]:!font-bold [&_h2]:!mb-2 [&_h3]:!text-2xl [&_h3]:!font-bold [&_h3]:!mb-1">
                                                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        );
                    } catch (e) {
                        // Fallback Legacy HTML
                        return (
                            <div className="max-w-4xl mx-auto px-4 py-12 w-full">
                                <article className="bg-white p-8 rounded-lg shadow-sm border">
                                    <div className="prose prose-lg max-w-none text-gray-700">
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
                                    </div>
                                </article>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    );
};

export default PageRenderer;
