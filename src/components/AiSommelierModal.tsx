import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Check, ShoppingBag } from 'lucide-react';
import { Product, PRODUCTS } from '../data/botenzData';
import { useI18n } from '../utils/i18nContext';

interface AiSommelierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestedProduct?: Product;
}



export const AiSommelierModal: React.FC<AiSommelierModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { t, formatPrice } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: t('sommelier_welcome', "Greetings! I am your Kampot Harvest AI Sommelier. Ask me anything about our artisan cashews, Kampot terroir, flavor profiles, or gourmet culinary pairings."),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const quickPrompts = [
    t('sommelier_prompt_1'),
    t('sommelier_prompt_2'),
    t('sommelier_prompt_3'),
    t('sommelier_prompt_4'),
  ];

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'ai',
            text: t('sommelier_welcome', "Greetings! I am your Kampot Harvest AI Sommelier. Ask me anything about our artisan cashews, Kampot terroir, flavor profiles, or gourmet culinary pairings."),
          },
        ];
      }
      return prev;
    });
  }, [t]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await res.json();
      let matchedProduct: Product | undefined;

      if (data.suggestedProduct) {
        matchedProduct = PRODUCTS.find((p) => p.id === data.suggestedProduct);
      } else if (/honey|sweet|butter/i.test(textToSend)) {
        matchedProduct = PRODUCTS.find((p) => p.id.includes('honey'));
      } else if (/chili|spicy|lime|beer/i.test(textToSend)) {
        matchedProduct = PRODUCTS.find((p) => p.id.includes('chili'));
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.recommendation || "Our artisan cashews are roasted to golden perfection. Both our Honey Butter and Chili Lime selections offer remarkable culinary synergy!",
        suggestedProduct: matchedProduct,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: t('sommelier_fallback_reply'),
        suggestedProduct: PRODUCTS[0],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (prod: Product) => {
    onAddToCart(prod);
    setAddedProductId(prod.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#F2F0E3] text-[#384A22] rounded-[24px] max-w-xl w-full flex flex-col h-[600px] max-h-[90vh] shadow-2xl overflow-hidden border border-[#384A22]/20"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Kampot Harvest AI Sommelier"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#384A22] text-[#F2F0E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8B6D3B] flex items-center justify-center text-[#F2F0E3]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{t('sommelier_title', 'Kampot AI Sommelier')}</h3>
              <p className="text-[11px] text-[#F2F0E3]/70 font-medium">{t('sommelier_subtitle', 'Artisan Flavor & Pairing Assistant')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sommelier"
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#768E5C] text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#384A22] text-[#F2F0E3] rounded-tr-xs'
                    : 'bg-white text-[#384A22] shadow-xs border border-[#384A22]/10 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.suggestedProduct && (
                  <div className="mt-3 p-2.5 bg-[#F7F5E9] rounded-xl border border-[#384A22]/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={m.suggestedProduct.image}
                        alt={m.suggestedProduct.name}
                        className="w-10 h-10 object-contain shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#384A22] truncate">
                          {m.suggestedProduct.name.includes('Chili')
                            ? t('product_chili_lime_name', m.suggestedProduct.name)
                            : t('product_honey_butter_name', m.suggestedProduct.name)}
                        </div>
                        <div className="text-[11px] text-[#768E5C] font-semibold">
                          {formatPrice(m.suggestedProduct.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(m.suggestedProduct!)}
                      className="px-3 py-1.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] text-white text-xs font-semibold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {addedProductId === m.suggestedProduct.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> {t('btn_added')}
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> {t('btn_add_to_cart')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#8B6D3B] text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[#768E5C] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-2 text-xs text-[#384A22]/70 italic border border-[#384A22]/10">
                {t('sommelier_loading', 'Consulting Kampot culinary sommelier...')}
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2.5 bg-[#EFECE0] border-t border-[#384A22]/10 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-xs whitespace-nowrap bg-white hover:bg-[#F7F5E9] text-[#384A22] px-3 py-1.5 rounded-full border border-[#384A22]/15 transition-colors cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-[#384A22]/15 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={t('sommelier_placeholder', 'Ask about pairings, recipes, or flavor notes...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-full bg-[#F2F0E3] text-sm text-[#384A22] placeholder:text-[#384A22]/50 border border-[#384A22]/20 focus:outline-none focus:border-[#384A22]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#384A22] hover:bg-[#314B1C] disabled:opacity-50 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
