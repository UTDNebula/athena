import type { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { Collapse, useMediaQuery } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { TabNavMenu } from '@/components/navigation/tabNavMenu/tabNavMenu';

interface CarouselProps {
  names: string[] | string;
  children: ReactJSXElement[] | ReactJSXElement;
  compareLength: number;
}

/**
 * Variants represent the different keyframes that the children are in during the animation
 * On enter, On Center, and On Exit
 */
const variants = {
  enter: (dir: number) => {
    return {
      x: dir > 0 ? 500 : -500, // velocity in x direction
      opacity: 0, // child opacity
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => {
    return {
      x: dir < 0 ? 500 : -500,
      opacity: 0,
    };
  },
};

/**
 * This is Sliding Carousel Component that takes in child components that can be
 * toggled between by way of using arrow buttons.
 * @param props the props passed from the parent component
 * @returns
 */
const Carousel = ({ names, children, compareLength }: CarouselProps) => {
  // The card currently being displayed
  const [currentCard, setCurrentCard] = useState(0);
  // The Direction that the card is moving in
  const [direction, setDirection] = useState(0);

  /**
   * On each re-render, ensure currentCard is within valid bounds
   */
  if (Array.isArray(children) && currentCard >= children.length) {
    // If currentCard is out of bounds, reset it to 0
    setCurrentCard(0);
  }

  /**
   * Turn
   * This function slides the active component back and forth based upon whether it is fed a positive or negative value
   * @param displacement a positive value will cause the card to move right, negative value cause card to move left
   */
  const turn = (displacement: number) => {
    setDirection(displacement);
    setCurrentCard((prevCard) => {
      const newCard = prevCard + displacement;
      if (Array.isArray(children)) {
        return Math.max(0, Math.min(newCard, children.length - 1));
      }
      return newCard;
    });
  };

  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(!isSmallScreen), [isSmallScreen]);

  return (
    <>
      <TabNavMenu
        value={currentCard}
        options={Array.isArray(names) ? names : [names]}
        turner={turn}
        compareLength={compareLength}
        open={open}
        setOpen={setOpen}
      />
      <Collapse in={open}>
        <AnimatePresence>
          <div className="p-4 lg:p-6">
            <motion.div
              key={currentCard}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {Array.isArray(children)
                ? children.map((child, index) => (
                    <div
                      key={index}
                      className={index === currentCard ? 'block' : 'hidden'}
                    >
                      {child}
                    </div>
                  ))
                : children}
            </motion.div>
          </div>
        </AnimatePresence>
      </Collapse>
    </>
  );
};

export default Carousel;
