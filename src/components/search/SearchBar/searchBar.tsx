import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
  Tooltip,
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useRouter } from 'next/router';
import React, { type Key, useEffect, useRef, useState } from 'react';

import {
  decodeSearchQueryLabel,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';

/**
 * Props type used by the SearchBar component
 */
interface SearchProps {
  manageQuery?: 'onSelect';
  onSelect?: (value: SearchQuery[]) => void;
  resultsLoading?: 'loading' | 'done' | 'error';
  setResultsLoading?: () => void;
  className?: string;
  input_className?: string;
  autoFocus?: boolean;
}

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
const SearchBar = ({
  manageQuery,
  onSelect,
  resultsLoading,
  setResultsLoading,
  className,
  input_className,
  autoFocus,
}: SearchProps) => {
  //what you can choose from
  const [options, setOptions] = useState<SearchQuery[]>([]);
  //initial loading prop for first load
  const [loading, setLoading] = useState(false);
  const [openErrorTooltip, setErrorTooltip] = React.useState(false);

  //text in search
  const [inputValue, _setInputValue] = useState('');
  //quick input updates for fetch (state is slow)
  const quickInputValue = useRef('');
  function setInputValue(newValue: string) {
    quickInputValue.current = newValue;
    _setInputValue(newValue);
  }
  //chosen values
  const [value, setValue] = useState<SearchQuery[]>([]);

  //set value from query
  const router = useRouter();
  useEffect(() => {
    if (router.isReady && typeof router.query.searchTerms !== 'undefined') {
      let array = router.query.searchTerms;
      if (!Array.isArray(array)) {
        array = array.split(',');
      }
      setValue(array.map((el) => decodeSearchQueryLabel(el)));
    }
  }, [router.isReady, router.query.searchTerms]); // useEffect is called every time the query changes

  const searchBarHints = [
    'ex. GOVT 2306, Sara Johnson',
    'ex. CS 1200, CS 2337',
    'ex. MATH 2418',
    'ex. John Cole, Jason Smith',
  ];
  const [searchBarHintIndex, setSearchBarHintIndex] = useState<number>(1);

  function changeHint() {
    setSearchBarHintIndex(Math.floor(Math.random() * 4));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      changeHint();
    }, 7000);

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, []); // run on mount

  // updateValue -> onSelect_internal -> updateQueries - clicking enter on an autocomplete suggestion in topMenu Searchbar
  // updateValue -> onSelect_internal -> onSelect (custom function) - clicking enter on an autocomplete suggestion in home page SearchBar
  // params.inputProps.onKeyDown -> handleKeyDown -> onSelect_internal -> updateQueries/onSelect - clicking enter in the SearchBar
  // Button onClick -> onSelect_internal -> updateQueries/onSelect - Pressing the "Search" Button

  //change all values
  function updateValue(newValue: SearchQuery[]) {
    setValue(newValue);
    onSelect_internal(newValue); // clicking enter to select a autocomplete suggestion triggers a new search (it also 'Enters' for the searchbar)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && inputValue === '') {
      event.preventDefault();
      event.stopPropagation();
      onSelect_internal(value);
    }
  }

  //update parent and queries
  function onSelect_internal(newValue: SearchQuery[]) {
    // called by updateValue(), handleKeyDown(), and is assigned to the button onClick action
    changeHint();
    if (
      router.query.searchTerms ==
      newValue.map((el) => searchQueryLabel(el)).join(',')
    )
      // do not initiate a new search when the searchTerms haven't changed
      return;
    setErrorTooltip(!newValue.length); //Check if tooltip needs to be displayed
    if (newValue.length && typeof setResultsLoading !== 'undefined') {
      setResultsLoading();
    }
    if (typeof onSelect !== 'undefined') {
      onSelect(newValue);
    }
    if (newValue.length && manageQuery === 'onSelect') {
      updateQueries(newValue);
    }
  }

  //update url with what's in value
  function updateQueries(newValue: SearchQuery[]) {
    if (typeof manageQuery !== 'undefined' && router.isReady) {
      const newQuery = router.query;
      if (newValue.length > 0) {
        newQuery.searchTerms = newValue
          .map((el) => searchQueryLabel(el))
          .join(',');
      } else {
        delete newQuery.searchTerms;
      }
      router.push(
        {
          query: router.query,
        },
        undefined,
        { shallow: true },
      );
    }
  }

  //fetch new options, add tags if valid
  function loadNewOptions(newInputValue: string) {
    setLoading(true);
    if (newInputValue.trim() === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    fetch(
      '/api/autocomplete?input=' +
        encodeURIComponent(newInputValue) +
        '&searchBy=both',
      {
        method: 'GET',
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        //remove currently chosen values
        const filtered = data.data.filter(
          (item: SearchQuery) =>
            value.findIndex((el) => searchQueryEqual(el, item)) === -1,
        );
        //add to chosen values if only one option and space
        const noSections = filtered.filter(
          (el: SearchQuery) => !('sectionNumber' in el),
        );
        if (
          // if the returned options minus already selected values or those options minus sections is 1, then this
          // means a space following should autocomplete the previous stuff to a chip
          (filtered.length === 1 || noSections.length === 1) &&
          // if the next character the user typed was a space, then the chip should be autocompleted
          // this looks at quickInputValue because it is always the most recent state of the field's string input,
          // so requests that return later will still see that a space was typed after the text to be autocompleted,
          // so it should autocomplete then when this is realized
          quickInputValue.current.charAt(newInputValue.length) === ' '
        ) {
          addValue(filtered.length === 1 ? filtered[0] : noSections[0]);
          const rest = quickInputValue.current
            .slice(newInputValue.length)
            .trimStart();
          setInputValue(rest);
          loadNewOptions(rest.trimEnd());
          setLoading(false);
        } else if (quickInputValue.current === newInputValue) {
          //still valid options
          setOptions(filtered);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException) {
          // ignore aborts
        } else {
          console.error('Autocomplete', error);
        }
      });
  }

  //add value
  function addValue(newValue: SearchQuery) {
    setValue((old) => {
      const oldAndNew = [...old, newValue];
      return oldAndNew;
    });
  }

  useEffect(() => {
    fetch('/api/autocomplete');
  }, []);

  return (
    <div className={'flex items-center gap-2 ' + (className ?? '')}>
      <Autocomplete
        multiple
        freeSolo
        loading={loading}
        //highlight first option to add with enter
        autoHighlight={true}
        clearOnBlur={false}
        className="grow"
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          return searchQueryLabel(option);
        }}
        options={options}
        //don't filter options, done in fetch
        filterOptions={(options) => options}
        value={value}
        onChange={(
          event: React.SyntheticEvent,
          newValue: (string | SearchQuery)[],
        ) => {
          //should never happen
          if (!newValue.every((el) => typeof el !== 'string')) {
            return;
          }
          //remove from options
          if (newValue.length > value.length) {
            setOptions((old) =>
              old.filter(
                (item) =>
                  !searchQueryEqual(
                    newValue[newValue.length - 1] as SearchQuery,
                    item,
                  ),
              ),
            );
          }
          updateValue(newValue as SearchQuery[]);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          loadNewOptions(newInputValue);
        }}
        renderInput={(params) => {
          params.inputProps.onKeyDown = handleKeyDown;
          return (
            <TextField
              {...params}
              variant="outlined"
              className={input_className}
              placeholder={searchBarHints[searchBarHintIndex]}
              //eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={autoFocus}
            />
          );
        }}
        //for handling spaces, when options are already loaded
        onInput={(event) => {
          const value = (event.target as HTMLInputElement).value;
          // if the last character in the new string is a space, check for autocomplete
          if (
            (value[value.length - 1] === ' ' ||
              value[value.length - 1] === ',') &&
            // but if the user is deleting text, don't try to autocomplete
            (event.nativeEvent as InputEvent).inputType === 'insertText'
          ) {
            const noSections = options.filter(
              (el: SearchQuery) => !('sectionNumber' in el),
            );
            if (
              value.length > 0 &&
              (options.length === 1 ||
                //all but one is a section
                noSections.length === 1)
            ) {
              event.preventDefault();
              event.stopPropagation();
              addValue(options.length === 1 ? options[0] : noSections[0]);
              setOptions([]);
              (event.target as HTMLInputElement).value = '';
            }
          }
        }}
        renderOption={(props: { key: Key }, option, { inputValue }) => {
          const text =
            typeof option === 'string' ? option : searchQueryLabel(option);
          //add spaces between prefix and course number
          const matches = match(
            text,
            inputValue
              .replace(
                //CS1200 -> CS 1200
                /([a-zA-Z]{2,4})([0-9][0-9V]?[0-9]{0,2})/,
                '$1 $2',
              )
              .replace(
                //1200CS -> 1200 CS
                /([0-9][0-9V][0-9]{2})([a-zA-Z]{1,4})/,
                '$1 $2',
              ),
          );
          const parts = parse(text, matches);
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              {parts.map((part, index) => (
                <span
                  key={index}
                  className={
                    'whitespace-pre-wrap' + (part.highlight ? ' font-bold' : '')
                  }
                >
                  {part.text}
                </span>
              ))}
            </li>
          );
        }}
      />
      <Tooltip
        title="Select a course or professor before searching"
        placement="top"
        open={openErrorTooltip}
        onOpen={() => setErrorTooltip(true)}
        onClose={() => setErrorTooltip(false)}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <Button
          variant="contained"
          disableElevation
          size="large"
          className={
            'h-11 w-[5.5rem] shrink-0 normal-case bg-royal hover:bg-royalDark' +
            (value.length == 0 ? ' text-cornflower-200' : '')
          } //darkens the text when no valid search terms are entered (pseudo-disables the search button)
          onClick={() => onSelect_internal(value)}
        >
          {resultsLoading === 'loading' ? (
            <CircularProgress className="h-6 w-6 text-cornflower-50" />
          ) : (
            'Search'
          )}
        </Button>
      </Tooltip>
    </div>
  );
};

export default SearchBar;
