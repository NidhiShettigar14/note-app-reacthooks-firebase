import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import firebase from '../firebase';
import { askAIAboutNotes } from '../utils/ai';

const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: var(--accent-color);
  color: white;
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.1) translateY(-4px);
    background: var(--accent-hover);
    box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.4);
  }
`;

const ChatWindow = styled.div`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 400px;
  height: 600px;
  max-height: calc(100vh - 120px);
  background: var(--surface-color);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
  transform-origin: bottom right;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @media (max-width: 480px) {
    width: calc(100% - 40px);
    right: 20px;
    bottom: 90px;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid var(--border-color);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
`;

const MessageBubble = styled.div`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14.5px;
  line-height: 1.5;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background: var(--accent-color);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.7);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
    border: 1px solid var(--border-color);
  `}

  p {
    margin-top: 0;
    margin-bottom: 8px;
    &:last-child { margin-bottom: 0; }
  }

  ul, ol {
    margin-top: 4px;
    margin-bottom: 4px;
    padding-left: 20px;
  }
  
  code {
    background: rgba(0,0,0,0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: inherit;
    font-size: 13px;
  }
`;

const ChatInputArea = styled.form`
  display: flex;
  padding: 16px;
  gap: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid var(--border-color);
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  outline: none;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-hover);
    transform: scale(1.05);
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;

  span {
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI Notes Assistant. Ask me anything about the contents of your saved notes!", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userQuery = inputValue.trim();
    const newMessage = { id: Date.now(), text: userQuery, isUser: true };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. Fetch all raw notes from Firebase
      const snapshot = await firebase.firestore().collection("notes").get();
      const allNotes = snapshot.docs.map(doc => doc.data());
      
      // 2. Query Gemini with the context of all notes (RAG)
      const aiResponseText = await askAIAboutNotes(userQuery, allNotes);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error connecting to AI. Please try again.", isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <FloatingButton onClick={() => setIsOpen(true)}>
          <FiMessageSquare size={24} />
        </FloatingButton>
      )}

      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <h3>✨ AI Study Partner</h3>
            <CloseButton onClick={() => setIsOpen(false)}>
              <FiMinimize2 size={20} />
            </CloseButton>
          </ChatHeader>
          
          <ChatMessages>
            {messages.map(msg => (
              <MessageBubble key={msg.id} isUser={msg.isUser}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </MessageBubble>
            ))}
            {isTyping && (
              <MessageBubble isUser={false}>
                <LoadingDots>
                  <span></span><span></span><span></span>
                </LoadingDots>
              </MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInputArea onSubmit={handleSend}>
            <Input 
              placeholder="Ask about your notes..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <SendButton type="submit" disabled={!inputValue.trim() || isTyping}>
              <FiSend size={18} />
            </SendButton>
          </ChatInputArea>
        </ChatWindow>
      )}
    </>
  );
};

export default ChatInterface;
