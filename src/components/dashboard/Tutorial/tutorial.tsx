import type { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import CloseIcon from '@mui/icons-material/Close';
import { Backdrop, Button, IconButton, Popover } from '@mui/material';
import React, { useEffect, useState } from 'react';

type TutorialPopupProps = {
  element: Element;
  open: boolean;
  incrementStep: () => void;
  close: () => void;
  title: string;
  buttonText: string;
  anchorOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  transformOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  children: ReactJSXElement | string;
};

const TutorialPopup = ({
  element,
  open,
  incrementStep,
  close,
  title,
  buttonText,
  anchorOrigin,
  transformOrigin,
  children,
}: TutorialPopupProps) => {
  useEffect(() => {
    if (open) {
      element.classList.add('tutorial-raise');
      if (element.tagName === 'TR' || element.tagName === 'TD') {
        element.classList.add('tutorial-table');
      }
      //Wait to scroll untill classes applies
      setTimeout(
        () => element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
        0,
      );
    } else {
      element.classList.remove('tutorial-raise');
      element.classList.remove('tutorial-table');
    }
    return () => {
      element.classList.remove('tutorial-raise');
      element.classList.remove('tutorial-table');
    };
  }, [open, element]);

  return (
    <Popover
      open={open}
      anchorEl={element}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      className="pointer-events-auto"
      disableScrollLock={true}
      marginThreshold={0}
    >
      <div
        className="p-2 flex flex-col items-start min-w-32 max-w-96"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex w-full items-center gap-2 pl-2">
          <p className="text-lg font-bold">{title}</p>
          <IconButton onClick={close} className="ml-auto">
            <CloseIcon />
          </IconButton>
        </div>
        <div className="p-2">{children}</div>
        <Button
          variant="contained"
          className="self-end"
          onClick={incrementStep}
        >
          {buttonText}
        </Button>
      </div>
    </Popover>
  );
};

type StepTemplate = {
  id: string;
  element?: Element;
  title: string;
  content: ReactJSXElement | string;
  anchorOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
  transformOrigin: {
    vertical: 'center' | 'bottom' | 'top';
    horizontal: 'center' | 'left' | 'right';
  };
};
type Step = StepTemplate & { element: Element };

const stepsTemplate: StepTemplate[] = [
  {
    id: 'search',
    title: 'Search',
    content:
      "Search for any number of courses and professors and we'll find all the combinations of classes they teach.",
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'RHS',
    title: 'Overviews and Compare',
    content: 'See an overview of your search on this side.',
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'right' },
  },
  {
    id: 'result',
    title: 'Results',
    content:
      'See the average grade for a course and Rate My Professors score here.',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'actions',
    title: 'More Information & Compare',
    content: (
      <>
        <p>Open a result for more detailed information.</p>
        <p>Click the checkbox to add an item to the compare tab.</p>
      </>
    ),
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'filters',
    title: 'Filters',
    content: 'Use the filters to show more specific data.',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  {
    id: 'LHS',
    title: "That's All!",
    content:
      'Try searching for a class you need to take and looking through the results.',
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformOrigin: { vertical: 'bottom', horizontal: 'left' },
  },
];

type TutorialProps = {
  open: boolean;
  close: () => void;
};

const Tutorial = ({ open, close }: TutorialProps) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [place, setPlace] = useState(0);

  useEffect(() => {
    // For each element, set anchor based on `data-tutorial-id`
    const elements = document.querySelectorAll('[data-tutorial-id]');
    if (!elements.length) {
      close();
      return;
    }
    const newSteps = [...stepsTemplate];
    elements.forEach((element) => {
      if (element.checkVisibility()) {
        const id = element.getAttribute('data-tutorial-id') as string;
        const foundStep = newSteps.findIndex((step) => step.id === id);
        if (foundStep !== -1) {
          newSteps[foundStep].element = element;
        }
      }
    });
    setSteps(
      newSteps.filter((step) => typeof step.element !== 'undefined') as Step[],
    );
    setPlace(0);
  }, [open, close]);

  return (
    <>
      <Backdrop sx={(theme) => ({ zIndex: theme.zIndex.modal })} open={open} />
      {steps.map(({ content, ...otherProps }, index) => (
        <TutorialPopup
          key={index}
          open={open && place === index}
          incrementStep={() => {
            if (place === steps.length - 1) {
              close();
              return;
            }
            setPlace(place + 1);
          }}
          close={close}
          buttonText={index === steps.length - 1 ? 'Done' : 'Next'}
          {...otherProps}
        >
          {content}
        </TutorialPopup>
      ))}
    </>
  );
};

export default Tutorial;
