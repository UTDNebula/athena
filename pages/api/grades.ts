// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
  data?: {
    _id: string;
    grade_distribution: number[];
  }[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (
    !(
      'REACT_APP_NEBULA_API_KEY' in process.env &&
      typeof process.env.REACT_APP_NEBULA_API_KEY === 'string'
    )
  ) {
    res.status(400).json({ message: 'API key is undefined' });
  }
  if (
    !('prefix' in req.query && typeof req.query.prefix === 'string') &&
    !('number' in req.query && typeof req.query.number === 'string') &&
    !(
      'professorName' in req.query &&
      typeof req.query.professorName === 'string'
    ) &&
    !(
      'sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string'
    )
  ) {
    res.status(400).json({ message: 'Incorrect query present' });
  }
  const headers = {
    'x-api-key': process.env.REACT_APP_NEBULA_API_KEY as string,
    Accept: 'application/json',
  };
  const url = new URL('https://api.utdnebula.com/grades/semester');
  if ('prefix' in req.query && typeof req.query.prefix === 'string') {
    url.searchParams.append('prefix', req.query.prefix);
  }
  if ('number' in req.query && typeof req.query.number === 'string') {
    url.searchParams.append('number', req.query.number);
  }
  if (
    'professorName' in req.query &&
    typeof req.query.professorName === 'string'
  ) {
    url.searchParams.append(
      'first_name',
      req.query.professorName.split(' ')[0],
    );
    url.searchParams.append('last_name', req.query.professorName.split(' ')[1]);
  }
  if (
    'sectionNumber' in req.query &&
    typeof req.query.sectionNumber === 'string'
  ) {
    url.searchParams.append('section_number', req.query.sectionNumber);
  }
  return new Promise<void>((resolve) => {
    fetch(url.href, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log('data', data, data.message);
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        res.status(200).json({
          message: 'success',
          data: data.data,
        });
        resolve();
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
