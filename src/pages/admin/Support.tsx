import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import SupportChat from '@/components/admin/SupportChat';

interface Conversation {
    user_id: string;
    user_name: string;
    user_email: string;
    terminal: string;
    unread_count: number;
    last_message: string;
    last_message_at: string;
}

const Support = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchConversations();
        // Poll for updates every 15 seconds
        const interval = setInterval(fetchConversations, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const data = await api.getSupportConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las conversaciones",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);

        // Mark messages as read
        if (conversation.unread_count > 0) {
            try {
                await api.markMessagesAsRead(conversation.user_id);
                // Refresh conversations to update unread count
                await fetchConversations();
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Ahora';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;

        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Soporte</h2>
                <p className="text-gray-600">Conversaciones con usuarios</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Conversaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                Cargando...
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No hay conversaciones</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.user_id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation?.user_id === conv.user_id ? 'bg-gray-100' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-sm">{conv.user_name}</span>
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">{conv.terminal}</p>
                                        <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(conv.last_message_at)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Chat View */}
                <div className="lg:col-span-2">
                    {selectedConversation ? (
                        <SupportChat
                            userId={selectedConversation.user_id}
                            userName={selectedConversation.user_name}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">Selecciona una conversación</p>
                                <p className="text-sm">Elige un usuario de la lista para ver el chat</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Support;
