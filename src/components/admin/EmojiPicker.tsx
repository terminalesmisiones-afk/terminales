import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = {
    'Caras': ['😊', '😂', '🥰', '😍', '🤗', '🙏', '👍', '👏', '🎉', '✨'],
    'Gestos': ['👋', '🤝', '💪', '🙌', '👌', '✌️', '🤞', '🤙', '👊', '✊'],
    'Objetos': ['📱', '💻', '📧', '📞', '🔔', '⏰', '📅', '📝', '✅', '❌'],
    'Símbolos': ['❤️', '💙', '💚', '💛', '🧡', '💜', '⭐', '🌟', '💫', '🔥']
};

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" type="button">
                    <Smile className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-3">
                    {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                        <div key={category}>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
                            <div className="grid grid-cols-10 gap-1">
                                {emojis.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => onEmojiSelect(emoji)}
                                        className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default EmojiPicker;
