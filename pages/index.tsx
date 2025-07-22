import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Tesseract from 'tesseract.js';
import math from 'mathjs';
import pdfjsLib from 'pdfjs-dist';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi there! I'm your homework buddy. What do you need help with today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [badge, setBadge] = useState('🔰 Beginner');
  const [subject, setSubject] = useState('general');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('/avatar1.png');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      synthRef.current.speak(utterance);
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'ai') speak(lastMessage.content);
  }, [messages]);

  useEffect(() => {
    if (points >= 100) setBadge('🥇 Homework Hero');
    else if (points >= 50) setBadge('🎖️ Rising Star');
    else setBadge('🔰 Beginner');
  }, [points]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, subject }),
    });

    const data = await res.json();
    setMessages([...newMessages, { role: 'ai', content: data.answer }]);
    setPoints(prev => prev + 10);
    setLoading(false);
  };

  const processText = (text: string) => {
    const cleanText = text.replace(/\n/g, ' ').trim();
    const mathMatch = cleanText.match(/([\d\s\+\-\*/=\.\(\)]+)(=\s*[\d\.]+)?/);

    if (mathMatch && mathMatch[1]) {
      const expression = mathMatch[1].replace(/=\s*[\d\.]+/, '').trim();
      try {
        const result = math.evaluate(expression);
        const response = `I found this math problem in your file: "${expression}". The answer is ${result}.`;
        setMessages(prev => [...prev, { role: 'user', content: expression }, { role: 'ai', content: response }]);
      } catch {
        setMessages(prev => [...prev, { role: 'ai', content: "Hmm, I saw your homework but couldn’t solve it. Can you tell me more?" }]);
      }
    } else {
      setMessages(prev => [...prev, { role: 'user', content: cleanText }, { role: 'ai', content: "Thanks! Let's work on this together." }]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = reader.result as string;
        setImagePreview(img);
        Tesseract.recognize(img, 'eng').then(({ data: { text } }) => {
          processText(text);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Head>
        <title>Team Work - AI Homework Helper</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-6 space-y-4">
        <h1 className="text-3xl font-bold text-blue-700">Team Work</h1>

        <input
          className="px-4 py-2 rounded border border-gray-300"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div>
          <label className="block mb-1">🎭 Avatar</label>
          <select
            className="p-2 rounded border border-gray-300"
            value={ava
