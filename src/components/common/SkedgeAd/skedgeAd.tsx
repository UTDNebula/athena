import { Backdrop, Card, Fade, Modal } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function SkedgeAd() {
  const [open, setOpen] = useState(false);

  //Open after 5 minutes if not already close (based on localStorage)
  useEffect(() => {
    const previous = localStorage.getItem('skedgeAd');
    let ask = previous === null;
    if (previous !== null) {
      const parsed = JSON.parse(previous);
      if (parsed !== null && parsed.value === 'closed') {
        ask = true;
      }
    }
    if (ask) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000 * 5);
      ///}, 1000 * 60 * 5); //5 minutes
      return () => clearTimeout(timer);
    }
  }, []);
  const cacheIndex = 0; //Increment this to open the popup for all users on next deployment

  function linkOpened() {
    setOpen(false);
    localStorage.setItem(
      'skedgeAd',
      JSON.stringify({
        value: 'opened',
        cacheIndex: cacheIndex,
      }),
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
        localStorage.setItem(
          'skedgeAd',
          JSON.stringify({
            value: 'closed',
            cacheIndex: cacheIndex,
          }),
        );
      }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Card className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 shadow-xl p-4">
          <Link
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            href="https://chromewebstore.google.com/detail/skedge/ghipfanpcodcmkjacmmfjdmccdiaahab"
            target="_blank"
            onClick={linkOpened}
          >
            Open for Chrome
          </Link>
          <Link
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            href="https://addons.mozilla.org/en-US/firefox/addon/sk-edge/"
            target="_blank"
            onClick={linkOpened}
          >
            Open for Firefox
          </Link>
        </Card>
      </Fade>
    </Modal>
  );
}
