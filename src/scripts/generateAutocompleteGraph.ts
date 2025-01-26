/*
Build the autocomplete radix tree
Documentation: https://nebula-labs.atlassian.net/wiki/spaces/TRENDS/pages/67993601/Autocomplete+Documentation
*/
import { writeFileSync } from 'fs';
import { DirectedGraph } from 'graphology';

import * as aggregatedData from '@/data/aggregated_data.json';
import { type SearchQuery } from '@/modules/SearchQuery/SearchQuery';

export type NodeAttributes = {
  c: string;
  d?: SearchQuery;
  visited?: boolean;
};

const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
  allowSelfLoops: false,
  type: 'directed',
});
let numNodes = 0; //allows a unique name for each node
let numEdges = 0;
const root = graph.addNode(numNodes++, {
  c: '',
  visited: false,
});

// recursively add a string to the graph, character by character, returning the last node. Doesn't create duplicate nodes with the same character
function addSearchQueryCharacter(
  node: string,
  characters: string,
  data?: SearchQuery,
): string {
  characters = characters.toUpperCase();
  const preExisting = graph.findOutNeighbor(
    node,
    (neighbor: string, attributes: NodeAttributes) =>
      attributes?.c === characters[0],
  );
  if (typeof preExisting === 'string') {
    if (characters.length <= 1) {
      if (typeof data !== 'undefined') {
        graph.setNodeAttribute(preExisting, 'd', data);
      }
      return preExisting;
    }
    return addSearchQueryCharacter(preExisting, characters.slice(1), data);
  }
  if (characters.length == 1) {
    const attributes: NodeAttributes = {
      c: characters[0],
      visited: false,
    };
    if (typeof data !== 'undefined') {
      attributes.d = data;
    }
    const newNode = graph.addNode(numNodes++, attributes);
    graph.addEdgeWithKey(numEdges++, node, newNode);
    return newNode;
  }
  const newNode = graph.addNode(numNodes++, {
    c: characters[0],
    visited: false,
  });
  graph.addEdgeWithKey(numEdges++, node, newNode);
  return addSearchQueryCharacter(newNode, characters.slice(1), data);
}

// add a string to the graph with multiple parents pointing to its first character
function addWithParents(
  //main parent must be first!!! Otherwise can lead to accessing unmatched data like typing GEOS 2305 CE and getting ce2305 because it looped back
  nodes: string[],
  characters: string,
  data?: SearchQuery,
) {
  const nodeFirstChar = addSearchQueryCharacter(
    nodes.shift() as string,
    characters[0],
    characters.length > 1 ? undefined : data,
  );
  while (nodes.length) {
    const nextParent = nodes.pop();
    if (!graph.hasEdge(nextParent, nodeFirstChar)) {
      graph.addEdgeWithKey(numEdges++, nextParent, nodeFirstChar);
    }
  }
  if (characters.length > 1) {
    return addSearchQueryCharacter(nodeFirstChar, characters.slice(1), data);
  }
  return nodeFirstChar;
}

//Add node in format: <prefix>[<number>| <number>[.<section>]
//and: (<number>|<number> )<prefix>[.<section>]
function addCourse(prefix: string, number: string, sectionNumber: string) {
  //<prefix>[ ]<number>
  const prefixNode = addSearchQueryCharacter(root, prefix);
  const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
  const classNode = addWithParents([prefixNode, prefixSpaceNode], number, {
    prefix: prefix,
    number: number,
  });

  //<number>[ ]<prefix>
  const classNode2 = addSearchQueryCharacter(root, number);
  const classSpaceNode = addSearchQueryCharacter(classNode2, ' ');
  addWithParents([classNode2, classSpaceNode], prefix, {
    prefix: prefix,
    number: number,
  });

  if (sectionNumber === 'HON') {
    //<prefix>[ ]<number>.<section>
    //<number>.<section>
    addWithParents([classNode, classNode2], '.' + sectionNumber, {
      prefix: prefix,
      number: number,
      sectionNumber: sectionNumber,
    });
    //<number>.<section> <prefix>
    addSearchQueryCharacter(classNode2, '.' + sectionNumber + ' ' + prefix, {
      prefix: prefix,
      number: number,
      sectionNumber: sectionNumber,
    });
  }
}

//Add nodes in format: (<professorLast>|<professorFirst> <professorLast>)
function addProfessor(profFirst: string, profLast: string) {
  //seperate first names so you can skip them when searching
  const firstNames = profFirst.split(' ');
  const nodes = [root];
  for (const name of firstNames) {
    //push to start, order is specific for addWithParents
    nodes.unshift(addSearchQueryCharacter(nodes[0], name + ' '));
  }
  addWithParents(nodes, profLast, {
    profFirst: profFirst,
    profLast: profLast,
  });
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
        addCourse(
          prefixData.subject_prefix,
          courseNumberData.course_number,
          sectionData.section_number,
        );
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
            addProfessor(professorData.first_name, professorData.last_name);
          }
        }
      }
    }
  }
}

//Radix tree: reduces graph size by compressing chains of nodes each with only one child to a single node with a character value of several characters.
function checkForSingleChild(parent: string) {
  if (graph.getNodeAttribute(parent, 'visited')) {
    return;
  }
  if (graph.outDegree(parent) > 1 || graph.hasNodeAttribute(parent, 'd')) {
    graph.setNodeAttribute(parent, 'visited', true);
    graph.forEachOutNeighbor(parent, (child: string) => {
      checkForSingleChild(child);
    });
    return;
  }
  //one child, no data
  graph.forEachOutNeighbor(
    parent,
    (singleChild: string, attributes: NodeAttributes) => {
      //will only return once
      if (graph.inDegree(singleChild) > 1) {
        //skip, should already be called on
        graph.setNodeAttribute(parent, 'visited', true);
        checkForSingleChild(singleChild); //move on
      } else {
        //one child, no data, child has one parent: merge
        graph.updateNodeAttribute(
          parent,
          'c',
          (n: string | undefined) => n + attributes.c,
        );
        graph.forEachOutNeighbor(singleChild, (grandchild: string) => {
          graph.dropEdge(singleChild, grandchild);
          if (!graph.hasEdge(parent, grandchild) && parent !== grandchild) {
            graph.addEdgeWithKey(numEdges++, parent, grandchild);
          }
        });
        graph.dropNode(singleChild);
        if (typeof attributes.d !== 'undefined') {
          graph.setNodeAttribute(parent, 'd', attributes.d);
          graph.setNodeAttribute(parent, 'visited', true);
          graph.forEachOutNeighbor(parent, (child: string) =>
            checkForSingleChild(child),
          );
        } else {
          checkForSingleChild(parent);
        }
      }
    },
  );
}
checkForSingleChild(root);

graph.forEachNode((node: string) => graph.removeNodeAttribute(node, 'visited'));

writeFileSync(
  'src/data/autocomplete_graph.json',
  JSON.stringify(graph.export()),
);

console.log('Autocomplete graph generation done.');
