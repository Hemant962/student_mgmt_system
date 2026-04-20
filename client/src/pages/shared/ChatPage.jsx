import React, { useEffect, useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import { chatService } from '../../services/api';
import { io } from 'socket.io-client';

const ROOMS = [
  { id: 'general', name: 'General Channel', icon: '🌐' },
  { id: 'class-10a', name: 'Class 10-A', icon: '🏫' },
  { id: 'class-10b', name: 'Class 10-B', icon: '🏫' },
  { id: 'class-11a', name: 'Class 11-A', icon: '🏫' },
  { id: 'announcements', name: 'Announcements', icon: '📢' },
];

let socket;

export default function ChatPage() {
  const { user } = useAuthStore();
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io('/', { transports: ['websocket'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    socket?.emit('join_room', room);
    chatService.getMessages(room).then(r => setMessages(r.data.messages || [])).catch(() => setMessages([]));
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg = {
      room,
      content: text,
      sender: { _id: user._id, name: user.name, role: user.role },
      createdAt: new Date().toISOString(),
    };
    socket.emit('send_message', msg);
    chatService.sendMessage({ room, content: text }).catch(() => {});
    setMessages(prev => [...prev, msg]);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const roleColors = { admin: 'bg-violet-500', teacher: 'bg-primary-500', student: 'bg-emerald-500', parent: 'bg-orange-500' };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Room list */}
      <div className="w-56 flex-shrink-0 space-y-1 hidden md:block">
        <div className="font-semibold text-slate-500 text-xs uppercase tracking-wide px-3 mb-3">Channels</div>
        {ROOMS.map((r) => (
          <button key={r.id} onClick={() => setRoom(r.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${room === r.id ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            <span>{r.icon}</span>
            <span className="truncate">{r.name}</span>
          </button>
        ))}
        <div className="pt-3 px-3">
          <div className={`flex items-center gap-1.5 text-xs ${connected ? 'text-emerald-500' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-400'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <span className="text-xl">{ROOMS.find(r => r.id === room)?.icon}</span>
          <div>
            <div className="font-semibold">{ROOMS.find(r => r.id === room)?.name}</div>
            <div className="text-xs text-slate-400">{messages.length} messages</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 py-16">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((m, i) => {
            const isMe = m.sender?._id === user._id || m.sender === user._id;
            const senderName = m.sender?.name || user.name;
            const senderRole = m.sender?.role || user.role;
            return (
              <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${roleColors[senderRole] || 'bg-slate-500'}`}>
                  {senderName?.charAt(0)}
                </div>
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`text-xs text-slate-400 mb-1 ${isMe ? 'text-right' : ''}`}>
                    {!isMe && <span className="font-medium text-slate-600 dark:text-slate-300">{senderName} · </span>}
                    {formatTime(m.createdAt)}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex gap-3">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message ${ROOMS.find(r => r.id === room)?.name}...`}
              className="input-field flex-1"
            />
            <button onClick={sendMessage} disabled={!text.trim()} className="btn-primary px-5 disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
