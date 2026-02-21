import React, { useState } from 'react';
import { tv } from '../utils/helpers';

interface FloatingChatbotProps {
  answerFn: (q: string, context?: string[]) => Promise<string>;
  isDark: boolean;
}

export function FloatingChatbot({ answerFn, isDark }: FloatingChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "¡Hola! 👋 ¡Bienvenido a StreamZone! 🎬✨ Soy tu asistente especializado en streaming. ¿En qué puedo ayudarte hoy?\n\n💡 Si necesitas ayuda directa, puedes preguntarme por 'agentes' o 'contacto' para hablar con nuestros especialistas." }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [showContactButtons, setShowContactButtons] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q) return;

    // Agregar mensaje del usuario
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput("");
    setIsTyping(true);

    // Actualizar contexto de conversación
    setConversationContext(prev => [...prev.slice(-3), q.toLowerCase()]); // Mantener últimas 3 preguntas

    // Detectar si el usuario pregunta por agentes o contacto
    const isAskingForAgents = q.toLowerCase().includes('agente') || 
                             q.toLowerCase().includes('contacto') || 
                             q.toLowerCase().includes('whatsapp') || 
                             q.toLowerCase().includes('hablar') ||
                             q.toLowerCase().includes('humano') ||
                             q.toLowerCase().includes('persona');

    try {
      // Obtener respuesta asíncrona
      const a = await answerFn(q, conversationContext);
      setMessages(m => [...m, { role: 'bot', text: a }]);
      
      // Mostrar botones de contacto si pregunta por agentes
      if (isAskingForAgents) {
        setShowContactButtons(true);
      }
    } catch (error) {
      console.error('Error en chatbot:', error);
      setMessages(m => [...m, { role: 'bot', text: '❌ Lo siento, hubo un error. Por favor intenta de nuevo.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (text: string) => {
    // Convertir saltos de línea en <br> y mantener emojis
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (<>
    <button
      data-chat-button
      onClick={() => setOpen(!open)}
      className={`fixed bottom-5 right-5 z-40 rounded-full px-6 py-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse ${tv(isDark, 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700', 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600')}`}
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl animate-bounce">💬</span>
        <div className="text-left">
          <div className="font-bold text-sm">¿Necesitas ayuda?</div>
          <div className="text-xs opacity-90">Chat en vivo</div>
        </div>
      </span>
    </button>

    {open && (
      <div className={`fixed bottom-20 right-5 z-40 w-96 rounded-2xl border shadow-2xl transition-all duration-300 ${tv(isDark, 'border-gray-300 bg-white shadow-gray-200', 'border-zinc-700 bg-zinc-900')}`}>
        <div className={`rounded-t-2xl border-b p-4 font-semibold flex items-center gap-2 ${tv(isDark, 'bg-gradient-to-r from-blue-100 to-purple-100 border-gray-300 text-gray-800', 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-zinc-700')}`}>
          <span className="text-xl">🤖</span>
          <span className={tv(isDark, 'text-gray-800', 'text-white')}>Asistente StreamZone</span>
          <div className={`ml-auto w-3 h-3 rounded-full ${tv(isDark, 'bg-green-500', 'bg-green-500')}`}></div>
        </div>

        <div className="p-4 h-96 overflow-y-auto flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'bot' ? 'self-start' : 'self-end'}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'bot' ?
                  tv(isDark, 'bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800 border border-blue-200 shadow-sm', 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 text-zinc-100 border border-blue-700/30') :
                  tv(isDark, 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md', 'bg-gradient-to-br from-purple-500 to-blue-600 text-white')
              }`}>
                {formatMessage(m.text)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="self-start">
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${tv(isDark, 'bg-gray-100 text-gray-700 border border-gray-200', 'bg-zinc-800 text-zinc-300')}`}>
                <span className="flex items-center gap-1">
                  <span>Escribiendo</span>
                  <span className="animate-pulse">...</span>
                </span>
              </div>
            </div>
          )}

          {/* Botones de Contacto con Agentes - Solo cuando se solicite */}
          {showContactButtons && (
            <div className={`mt-4 p-4 rounded-xl border border-dashed ${tv(isDark, 'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50', 'border-blue-600 bg-gradient-to-r from-blue-900/20 to-purple-900/20')}`}>
              <div className="text-center mb-3">
                <h4 className={`text-sm font-bold ${tv(isDark, 'text-gray-800', 'text-white')} mb-1`}>
                  📞 Nuestros Agentes Especializados
                </h4>
                <p className={`text-xs ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
                  Selecciona un agente para contactar directamente
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Agente 1 */}
                <a
                  href="https://wa.me/593984280334"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-105 ${tv(isDark, 'bg-white border border-green-200 hover:border-green-300 hover:shadow-md', 'bg-green-900/20 border border-green-600 hover:bg-green-800/30')}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <span className="text-white text-lg">👨‍💼</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-semibold ${tv(isDark, 'text-gray-800', 'text-white')}`}>
                      Agente Principal
                    </div>
                    <div className={`text-xs ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
                      593984280334
                    </div>
                  </div>
                  <div className="text-green-500 group-hover:scale-110 transition-transform">
                    <span className="text-lg">💬</span>
                  </div>
                </a>

                {/* Agente 2 */}
                <a
                  href="https://wa.me/593984280334"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-105 ${tv(isDark, 'bg-white border border-blue-200 hover:border-blue-300 hover:shadow-md', 'bg-blue-900/20 border border-blue-600 hover:bg-blue-800/30')}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <span className="text-white text-lg">👩‍💼</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-semibold ${tv(isDark, 'text-gray-800', 'text-white')}`}>
                      Agente Soporte
                    </div>
                    <div className={`text-xs ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
                      593984280334
                    </div>
                  </div>
                  <div className="text-blue-500 group-hover:scale-110 transition-transform">
                    <span className="text-lg">💬</span>
                  </div>
                </a>
              </div>

              <div className={`mt-3 text-center text-xs ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                ⏰ Disponibles 24/7 • Respuesta inmediata
              </div>
            </div>
          )}

          {/* Botones de sugerencias rápidas */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "🎯 Recomiéndame algo",
                "💰 Ver precios",
                "📺 ¿Qué hay en Netflix?",
                "🛒 ¿Cómo compro?",
                "👨‍💼 Hablar con agente"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 ${tv(isDark, 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200', 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600')}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 flex gap-2 border-t">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Escribe tu pregunta..."
            className={`flex-1 rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${tv(isDark, 'border-zinc-300 bg-white focus:ring-purple-500 focus:border-purple-500', 'border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-blue-500 focus:border-blue-500')}`}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isTyping}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tv(isDark, 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700', 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
          >
            {isTyping ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    )}
  </>);
}

