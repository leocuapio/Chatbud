'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import FeedbackForm from '../components/FeedbackForm';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userMessages = docSnap.data().messages || [];
          setMessages([
            {
              role: 'assistant',
              content: "Welcome back, I am here to help you with any question",
            },
            ...userMessages
          ]);
        } else {
          await setDoc(userDocRef, { messages: [] });
        }
      } else {
        setUser(null);
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = { role: 'user', content: message };
    const assistantMessage = { role: 'assistant', content: '' };

    setMessage('');
    setIsThinking(true);
    setMessages((messages) => [
      ...messages,
      newMessage,
      assistantMessage,
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, newMessage]),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        fullResponse += text;
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: fullResponse },
          ];
        });
      }
      setIsThinking(false);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { messages: [...messages, newMessage, { role: 'assistant', content: fullResponse }] }, { merge: true });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
      setIsThinking(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor={isDarkMode ? '#333' : '#f7f7f7'}
      p={2}
    >
      <Box
        width={{ xs: '95%', md: '600px' }}
        height="700px"
        borderRadius={4}
        boxShadow={3}
        bgcolor={isDarkMode ? '#1c1c1c' : 'white'}
        p={3}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          overflow="auto"
          sx={{ 
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: isDarkMode ? '#555' : '#bdbdbd', borderRadius: '8px' }
          }}
        >
          <Typography variant="h6" color={isDarkMode ? 'white' : 'textPrimary'} textAlign="center">
            Headstarter Support
          </Typography>
          <Stack
            direction={'column'}
            spacing={2}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? (isDarkMode ? '#444' : '#e0f7fa')
                      : (isDarkMode ? '#333' : '#1976d2')
                  }
                  color={message.role === 'assistant' ? (isDarkMode ? 'white' : 'black') : 'white'}
                  borderRadius={8}
                  boxShadow={1}
                  p={2}
                  maxWidth="80%"
                  sx={{
                    animation: isThinking && index === messages.length - 1 ? 'bounce 2s infinite' : 'none',
                  }}
                >
                  {index === messages.length - 1 && isThinking ? '...' : message.content}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
        <Stack direction={'row'} spacing={2} mt={2}>
        <TextField
  label="Type a message"
  fullWidth
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  variant="outlined"
  InputProps={{
    style: {
      color: isDarkMode ? 'white' : 'black', // Set text color based on dark mode
    },
    // Set placeholder text color using the inputProps
    inputProps: {
      style: {
        color: isDarkMode ? 'white' : 'black',
      },
    },
  }}
  InputLabelProps={{
    style: {
      color: isDarkMode ? 'white' : 'black', // Set label color based on dark mode
    },
  }}
  sx={{
    borderRadius: '8px',
    backgroundColor: isDarkMode ? '#424242' : 'white',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: isDarkMode ? '#555' : '#ccc',
      },
      '& input::placeholder': {
        color: isDarkMode ? '#bdbdbd' : '#9e9e9e', // Set placeholder color based on dark mode
      },
    },
  }}
/>
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#115293' },
              borderRadius: '8px',
              boxShadow: 2,
            }}
          >
            Send
          </Button>
        </Stack>
      </Box>
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        width={{ xs: '95%', md: '600px' }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setFeedbackOpen(true)} // Open feedback form popup
          >
            Feedback
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsDarkMode(prev => !prev)}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button variant="outlined" color="error" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Stack>
      </Box>

      {/* Feedback Form Popup */}
      <FeedbackForm open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
}