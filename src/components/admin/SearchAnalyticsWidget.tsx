import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/services/api';

const SearchAnalyticsWidget = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        api.getSearchStats()
            .then(setStats)
            .catch(err => console.error('Failed to load search stats', err));
    }, []);

    if (!stats) return <div className="p-4 text-center">Cargando análisis...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lo más buscado</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Término</TableHead>
                                <TableHead className="text-right">Busquedas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.topQueries.map((item: any, i: number) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{item.query}</TableCell>
                                    <TableCell className="text-right">{item.count}</TableCell>
                                </TableRow>
                            ))}
                            {stats.topQueries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-gray-500">Sin datos aún</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.topCategories.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="capitalize">{item.category === 'unknown' ? 'General' : item.category}</span>
                                <span className="font-bold">{item.count}</span>
                            </div>
                        ))}
                        {stats.topCategories.length === 0 && (
                            <div className="text-center text-gray-500">Sin datos aún</div>
                        )}
                        <div className="pt-4 mt-4 border-t">
                            <div className="text-sm text-gray-500">Búsquedas últimas 24h: <span className="text-gray-900 font-bold">{stats.last24h}</span></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SearchAnalyticsWidget;
