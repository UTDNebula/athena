/*
Build the combos table
*/
import { writeFileSync } from 'fs';

import aggregatedData from '@/data/aggregated_data.json';
import {
  type SearchQuery,
  searchQueryEqual,
} from '@/modules/SearchQuery/SearchQuery';

export type TableType = { [key: string]: SearchQuery[] };

const table: TableType = {};

function addCombo( //variables
  prefix: string,
  number: string,
  sectionNumber: string,
  profFirst: string,
  profLast: string,
) {
  const courseString = prefix + ' ' + number; //string representation
  const profString = profFirst + ' ' + profLast;

  const courseObject: SearchQuery = { prefix, number }; //searchquery object
  const profObject: SearchQuery = { profFirst, profLast };

  if (!Object.prototype.hasOwnProperty.call(table, courseString)) {
    table[courseString] = [profObject]; //add professor to course
  } else if (
    table[courseString].findIndex((x) => searchQueryEqual(profObject, x)) === -1
  ) {
    table[courseString].push(profObject); //add from query
  }
  if (!Object.prototype.hasOwnProperty.call(table, profString)) {
    table[profString] = [courseObject]; //add course to professor
  } else if (
    table[profString].findIndex((x) => searchQueryEqual(courseObject, x)) === -1
  ) {
    table[profString].push(courseObject);
  }

  if (sectionNumber === 'HON') {
    //honor course separate
    const courseWSectionString = prefix + ' ' + number + '.' + sectionNumber;
    const courseWSectionObject: SearchQuery = {
      prefix,
      number,
      sectionNumber,
    };
    if (!Object.prototype.hasOwnProperty.call(table, courseWSectionString)) {
      table[courseWSectionString] = [profObject]; //add from query like with regular course
    } else if (
      table[courseWSectionString].findIndex((x) =>
        searchQueryEqual(profObject, x),
      ) === -1
    ) {
      table[courseWSectionString].push(profObject);
    }
    if (!Object.prototype.hasOwnProperty.call(table, profString)) {
      table[profString] = [courseWSectionObject];
    } else if (
      table[profString].findIndex((x) =>
        searchQueryEqual(courseWSectionObject, x),
      ) === -1
    ) {
      table[profString].push(courseWSectionObject);
    }
  }
}

function sortResults(key: string) {
  if (Object.prototype.hasOwnProperty.call(table, key)) {
    table[key].sort((a, b) => {
      if ('profLast' in a && 'profLast' in b) {
        //handle undefined variables based on searchQueryLabel
        const aFirstName = a.profFirst ?? '';
        const bFirstName = b.profFirst ?? '';
        const aLastName = a.profLast ?? '';
        const bLastName = b.profLast ?? '';

        return (
          aLastName.localeCompare(bLastName) ||
          aFirstName.localeCompare(bFirstName) //sort by last name then first name
        );
      } else if ('prefix' in a && 'prefix' in b) {
        const aPrefix = a.prefix ?? ''; //make sure the is no empty input for prefix and number
        const bPrefix = b.prefix ?? '';
        const aNumber = a.number ?? '';
        const bNumber = b.number ?? '';

        return aPrefix.localeCompare(bPrefix) || aNumber.localeCompare(bNumber); //sort by prefix then number
      }
      return 0;
    });
  }
}

for (let prefixItr = 0; prefixItr < aggregatedData.data.length; prefixItr++) {
  const prefixData = aggregatedData.data[prefixItr];
  for (
    let courseNumberItr = 0;
    courseNumberItr < prefixData.course_numbers.length;
    courseNumberItr++
  ) {
    const courseNumberData = prefixData.course_numbers[courseNumberItr];
    for (
      let academicSessionItr = 0;
      academicSessionItr < courseNumberData.academic_sessions.length;
      academicSessionItr++
    ) {
      const academicSessionData =
        courseNumberData.academic_sessions[academicSessionItr];
      for (
        let sectionItr = 0;
        sectionItr < academicSessionData.sections.length;
        sectionItr++
      ) {
        const sectionData = academicSessionData.sections[sectionItr];
        for (
          let professorItr = 0;
          professorItr < sectionData.professors.length;
          professorItr++
        ) {
          const professorData = sectionData.professors[professorItr];
          if (
            'first_name' in professorData && //handle empty professor: {}
            'last_name' in professorData &&
            professorData.first_name !== '' && //handle blank name
            professorData.last_name !== ''
          ) {
            addCombo(
              prefixData.subject_prefix,
              courseNumberData.course_number,
              sectionData.section_number,
              professorData.first_name,
              professorData.last_name,
            );
          }
        }
      }
    }
  }
}
for (const key in table) {
  sortResults(key);
}

writeFileSync('src/data/combo_table.json', JSON.stringify(table));
console.log('Combo table generation done.');
