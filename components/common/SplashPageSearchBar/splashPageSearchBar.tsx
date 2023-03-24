import * as React from 'react';
import { SearchIcon } from '../../icons/SearchIcon/searchIcon';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect } from 'react';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  selectSearchValue: Function;
  value: SearchQuery[];
  setValue: Function;
  disabled?: boolean;
};

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export const SplashPageSearchBar = (props: SearchProps) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly SearchQuery[]>([]);

  const [inputValue, setInputValue] = React.useState('');
  const [controller, setController] = React.useState(new AbortController());
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (loading) {
      controller.abort();
    }
    setController(new AbortController());
    setLoading(true);
  }, [props.value, inputValue]);

  useEffect(() => {
    if (loading) {
      fetch('/api/autocomplete?input=' + inputValue, {
        signal: controller.signal,
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
          setOptions(data.output.concat(props.value));
        })
        .catch((error) => {
          if (error instanceof DOMException) {
            // ignore aborts
          } else {
            setLoading(false);
            console.log(error);
          }
        });
    }
  }, [controller, loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <>
      <div className="text-primary m-auto w-11/12 -translate-y-1/2">
        <div className="translate-y-10 translate-x-4 w-8 h-8 text-primary-light">
          <SearchIcon />
        </div>
        <Autocomplete
          loading={loading}
          autoHighlight={true}
          multiple={true}
          disabled={props.disabled}
          className="w-full h-12"
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          filterSelectedOptions
          getOptionLabel={(option) => searchQueryLabel(option)}
          options={options}
          filterOptions={(options) => options}
          value={props.value}
          // When a new option is selected, find the new selected option by getting the
          // difference between the current and new value, then return that to the parent
          // component using selectSearchValue prop
          onChange={(
            event: any,
            newValue: SearchQuery[] | undefined,
            reason,
          ) => {
            let difference: SearchQuery[];
            if (props.value !== undefined) {
              if (newValue !== undefined) {
                // @ts-ignore
                difference = newValue.filter((x) => !props.value.includes(x));
              } else {
                difference = [];
              }
            } else {
              if (newValue !== undefined) {
                difference = newValue;
              } else {
                difference = [];
              }
            }
            props.selectSearchValue(difference[0] ? difference[0] : null);
            props.setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
                type="search"
                id="mainSearch"
                className="rounded-md border-primary-dark border-2 w-full h-12 pl-12 bg-white text-primary-dark placeholder-primary-dark font-bold"
                placeholder="Search section number, professor name, course number...."
              />
            </div>
          )}
          defaultValue={[]}
        />
      </div>
    </>
  );
};

SplashPageSearchBar.defaultProps = {
  disabled: true,
};

function searchQueryLabel(query: SearchQuery): string {
  let result = '';
  if (query.prefix !== undefined) {
    result += query.prefix;
  }
  if (query.number !== undefined) {
    result += ' ' + query.number;
  }
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  if (query.sectionNumber !== undefined) {
    result += ' ' + query.sectionNumber;
  }
  return result.trim();
}
