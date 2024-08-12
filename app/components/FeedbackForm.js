'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { useState } from 'react';

export default function FeedbackForm({ open, onClose }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://formspree.io/f/xrbzkoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, comment }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setName('');
      setComment('');
      onClose();
      alert('Feedback sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send feedback. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ timeout: 500 }}>
      <DialogTitle>Help us make our chatbot the best possible</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Comment"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <DialogActions>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? 'Sending...' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}