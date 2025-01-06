import {
  Alert,
  Button,
  Collapse,
  Rating,
  Snackbar,
  SnackbarContent,
  TextField,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function FeedbackPopup() {
  const [open, setOpen] = useState(false);

  //Open after 60 seconds if not already asked/close (based on localStorage)
  useEffect(() => {
    const previous = localStorage.getItem('feedback');
    let ask = previous === null;
    if (previous !== null) {
      const parsed = JSON.parse(previous);
      if (parsed !== null && parsed.value === 'error') {
        ask = true;
      }
    }
    if (ask) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000 * 60); //60 seconds
      return () => clearTimeout(timer);
    }
  }, []);
  const cacheIndex = 0; //Increment this to request feedback from all users on next deployment

  //Error submitting control
  const [errorOpen, setErrorOpen] = useState(false);
  function handleErrorClose(
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setErrorOpen(false);
  }

  //Survey answer storage
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackExtra, setFeedbackExtra] = useState('');

  //Send response to API, store result in localStorage
  function sendFeedback() {
    fetch('/api/postFeedback', {
      method: 'POST',
      body: JSON.stringify({
        rating: feedbackRating,
        extra: feedbackExtra,
        env: process.env.NEXT_PUBLIC_VERCEL_ENV,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        localStorage.setItem(
          'feedback',
          JSON.stringify({
            value: 'submitted',
            cacheIndex: cacheIndex,
          }),
        );
      })
      .catch((error) => {
        setErrorOpen(true);
        localStorage.setItem(
          'feedback',
          JSON.stringify({
            value: 'error',
            cacheIndex: cacheIndex,
          }),
        );
        console.error('Feedback', error);
      });
  }

  return (
    <>
      <Snackbar open={open}>
        <SnackbarContent
          className="bg-white dark:bg-haiti text-haiti dark:text-white"
          sx={{
            '& .MuiSnackbarContent-message ': {
              width: '100%',
            },
          }}
          message={
            <div className="flex flex-col items-center gap-2">
              <p className="text-base self-start">
                How would you rate your experience with Trends?
              </p>
              <Rating
                value={feedbackRating}
                size="large"
                onChange={(event, newValue) => {
                  setFeedbackRating(newValue);
                }}
              />
              <Collapse in={feedbackRating !== null} className="w-full">
                <div className="w-full flex flex-col items-center gap-2">
                  <p className="text-base self-start">
                    Do you have anything else you&apos;d like to add?
                  </p>
                  <TextField
                    className="w-full"
                    multiline
                    value={feedbackExtra}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFeedbackExtra(event.target.value);
                    }}
                  />
                  <p className="text-xs">
                    Visit our{' '}
                    <Link
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                      href="https://github.com/UTDNebula/utd-trends/issues/new/choose"
                      target="_blank"
                    >
                      GitHub
                    </Link>{' '}
                    for more detailed issue reporting.
                  </p>
                </div>
              </Collapse>
              <div className="self-end flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setOpen(false);
                    localStorage.setItem(
                      'feedback',
                      JSON.stringify({
                        value: 'closed',
                        cacheIndex: cacheIndex,
                      }),
                    );
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="[&:not(:hover):not(:disabled)]:bg-royal"
                  size="small"
                  variant="contained"
                  disabled={feedbackRating === null}
                  onClick={() => {
                    setOpen(false);
                    sendFeedback();
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          }
        />
      </Snackbar>
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
      >
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          There was an error submitting your response. Please try again later.
        </Alert>
      </Snackbar>
    </>
  );
}
