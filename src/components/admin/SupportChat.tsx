import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import EmojiPicker from './EmojiPicker';

interface Message {
    id: string;
    user_id: string;
    sender_role: string;
    message: string;
    created_at: string;
    is_read: number;
}

interface SupportChatProps {
    userId?: string; // Para admin: ID del usuario con quien chatear
    userName?: string; // Para admin: Nombre del usuario
}

const SupportChat: React.FC<SupportChatProps> = ({ userId, userName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await api.getSupportMessages(userId);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        try {
            setSending(true);
            await api.sendSupportMessage(newMessage, isAdmin ? userId : undefined);
            setNewMessage('');
            await fetchMessages();

            toast({
                title: "Mensaje enviado",
                description: isAdmin ? "El usuario recibirá tu respuesta" : "El equipo de soporte recibirá tu mensaje"
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "No se pudo enviar el mensaje",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Ahora';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;

        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5" />
                    {isAdmin && userName ? `Chat con ${userName}` : 'Soporte'}
                </CardTitle>
                {!isAdmin && (
                    <p className="text-sm text-gray-500">
                        Envía un mensaje al equipo de soporte
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Messages List */}
                <div
                    ref={messagesContainerRef}
                    className="h-[600px] overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg"
                >
                    {loading && messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Cargando mensajes...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay mensajes aún</p>
                            <p className="text-sm">Inicia la conversación</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwnMessage = isAdmin
                                ? msg.sender_role === 'admin'
                                : msg.sender_role === 'user';

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-white border border-gray-200'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                        <p
                                            className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'
                                                }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        disabled={sending}
                        className="flex-1"
                    />
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SupportChat;
