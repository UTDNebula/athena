/*
Fetch the aggregated data from the API
*/
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../../.env.local');
config({ path: envPath });

const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
if (typeof API_KEY !== 'string') {
  console.error('API key is undefined');
} else {
  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };

  fetch('https://api.utdnebula.com/autocomplete/dag', {
    method: 'GET',
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      writeFileSync('src/data/aggregated_data.json', JSON.stringify(data));

      console.log('Aggregated data fetched.');
    });
}
