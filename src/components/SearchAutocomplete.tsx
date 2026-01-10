import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Bus, Building2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

import { useNavigate } from 'react-router-dom';

interface Suggestion {
    id: string;
    text: string;
    type: 'terminal' | 'city' | 'company' | 'page';
    subtext?: string;
    data?: any; // Store raw data (like terminal ID or slug)
}

interface SearchAutocompleteProps {
    onSearch: (query: string, city: string) => void;
    className?: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ onSearch, className }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [allData, setAllData] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Terminals, Companies AND Pages (CMS)
                const [terminals, companies, pages] = await Promise.all([
                    api.getTerminals(),
                    api.getCompanies(),
                    api.getPages().catch(() => []) // Handle error if auth fails or endpoint issues
                ]);

                const data: Suggestion[] = [];

                // Process Terminals & Cities
                const uniqueCities = new Set<string>();
                terminals.forEach((t: any) => {
                    // Terminal
                    data.push({
                        id: `term-${t.id}`,
                        text: t.name,
                        type: 'terminal',
                        subtext: t.city,
                        data: { id: t.id }
                    });
                    // City (deduplicated)
                    if (t.city && !uniqueCities.has(t.city)) {
                        uniqueCities.add(t.city);
                        data.push({
                            id: `city-${t.city}`,
                            text: t.city,
                            type: 'city',
                            subtext: 'Ciudad/Localidad'
                        });
                    }
                });

                // Process Companies
                companies.forEach((c: any) => {
                    data.push({
                        id: `comp-${c.id}`,
                        text: c.name,
                        type: 'company',
                        subtext: 'Empresa de Transporte'
                    });
                });

                // Process Pages
                if (Array.isArray(pages)) {
                    pages.filter((p: any) => p.is_published).forEach((p: any) => {
                        data.push({
                            id: `page-${p.id}`,
                            text: p.title,
                            type: 'page',
                            subtext: 'Página',
                            data: { slug: p.slug }
                        });
                    });
                }

                setAllData(data);
            } catch (error) {
                console.error('Error fetching search data:', error);
            }
        };
        fetchData();

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter Suggestions
    useEffect(() => {
        if (query.trim().length > 1) {
            const lowerQuery = query.toLowerCase();
            const filtered = allData.filter(item =>
                item.text.toLowerCase().includes(lowerQuery) ||
                (item.subtext && item.subtext.toLowerCase().includes(lowerQuery))
            ).slice(0, 8); // Limit to 8
            setSuggestions(filtered);
            setIsOpen(filtered.length > 0);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query, allData]);

    const handleSelect = (item: Suggestion) => {
        setQuery(item.text);
        setIsOpen(false);

        // Log Search
        api.logSearch(item.text, item.type);

        if (item.type === 'terminal') {
            navigate(`/terminal/${item.data.id}`);
        } else if (item.type === 'page') {
            navigate(`/${item.data.slug}`);
        } else if (item.type === 'city') {
            onSearch('', item.text); // Filter by City
        } else {
            onSearch(item.text, ''); // Generic Search
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (query.trim()) {
            api.logSearch(query, 'unknown');
            onSearch(query, '');
        }
    };

    return (
        <div ref={wrapperRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Buscar terminal, ciudad o empresa..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 h-12 w-full bg-white/95 backdrop-blur-sm border-0 shadow-lg text-lg text-gray-900 rounded-xl focus-visible:ring-primary"
                    />
                </div>
                <Button type="submit" className="ml-2 h-12 px-6 rounded-xl hidden sm:flex">
                    Buscar
                </Button>
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100">
                    <ul>
                        {suggestions.map((item) => (
                            <li
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-b-0 border-gray-50 transition-colors"
                            >
                                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                                    {item.type === 'terminal' && <Bus className="h-4 w-4" />}
                                    {item.type === 'city' && <MapPin className="h-4 w-4" />}
                                    {item.type === 'company' && <Building2 className="h-4 w-4" />}
                                    {item.type === 'page' && <FileText className="h-4 w-4" />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{item.text}</div>
                                    <div className="text-xs text-gray-500">{item.subtext}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
