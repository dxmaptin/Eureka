import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Eureka's AI assistant. I can answer questions about his background, projects, and experience. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey] = useState('sk-47UYUxBCMR1g30UTmk3bt9XJrqTmrgxAA64XohDz4WT3BlbkFJnRdn0HiFTxNFxIXKlOLWCNgD0GNRDynHgmJNg0zRUA');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show scroll-to-bottom button if not at bottom
  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (el) {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
      setShowScrollToBottom(!atBottom);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!apiKey) {
      alert('Please enter your OpenAI API key first.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant representing *Eureka*, the Web3 evolution of Toutix — a next-gen ticketing platform that eliminates scalping, 
              restores revenue to event creators, and transforms tickets into on-chain digital credentials. Eureka mints every ticket as an NFT, enforces programmable 
              royalties, and verifies ownership at the gate using dynamic QR and NFC codes. Fans onboard seamlessly via email or wallet, with fiat and crypto payments 
              supported. Under the hood, Eureka runs on Solana for speed and low fees, but presents a frictionless experience that feels Web2. Beyond ticketing, Eureka 
              unlocks a new monetization layer: turning fan identity and attendance into the foundation for digital IP, loyalty, and community ownership. It's not just a 
              ticket — it's infrastructure for the future of entertainment.
            Be helpful, professional, and knowledgeable about his work. If asked about something not in his background, politely redirect to his actual experience.`
            },
            {
              role: 'user',
              content: inputMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const data = await response.json();
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact Eureka directly.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-slate-900 hover:bg-slate-800 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-slate-900 text-white rounded-t-lg flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <CardTitle className="text-lg">Chat with Eureka's AI</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-slate-800"
        >
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* API key is hard-coded, so no need to show the input */}
        
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 relative"
          onScroll={handleScroll}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-slate-600" />
                </div>
              )}
              <div
                className={`break-words max-w-[80%] p-3 rounded-lg whitespace-pre-wrap overflow-hidden` +
                  (message.sender === 'user'
                    ? ' bg-slate-900 text-white'
                    : ' bg-gray-100 text-slate-900')
                }
                style={{ wordBreak: 'break-word' }}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-slate-600" />
              </div>
              <div className="bg-gray-100 text-slate-900 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute right-4 bottom-4 bg-slate-900 text-white rounded-full p-2 shadow-lg hover:bg-slate-800 transition"
              aria-label="Scroll to bottom"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Eureka's experience..."
              disabled={isLoading || !apiKey}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim() || !apiKey}
              size="icon"
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;