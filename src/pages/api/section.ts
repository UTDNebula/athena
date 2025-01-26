// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type AcademicSession = {
  name: string;
  start_date: string;
  end_date: string;
};

export type SectionData = {
  _id: string;
  section_number: string;
  course_reference: string;
  section_corequisites: unknown; //todo
  academic_session: AcademicSession;
  professors: Array<string>;
  teaching_assistants: Array<unknown>; //todo
  internal_class_number: string;
  instruction_mode: string;
  meetings: Array<unknown>; //todo
  core_flags: Array<string>;
  syllabus_uri: string;
  grade_distribution: Array<number>;
  attributes: object;
};

type Data = {
  message: string;
  data?: SectionData;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    res.status(500).json({ message: 'API key is undefined' });
    return;
  }
  const sectionID = req.query.sectionID;
  if (typeof sectionID !== 'string') {
    res.status(400).json({ message: 'Incorrect query present' });
    return;
  }
  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };
  const url = new URL(`https://api.utdnebula.com/section/${sectionID}`); // Call the SectionById function
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
