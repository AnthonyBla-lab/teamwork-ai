import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Tesseract from 'tesseract.js';
import math from 'mathjs';

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
    setMessages([...newMessages, { role: 'ai', content: data.]()
