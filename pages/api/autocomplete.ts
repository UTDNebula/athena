import { DirectedGraph } from 'graphology';
import { NextApiRequest, NextApiResponse } from 'next';

import autocompleteGraph from '../../data/autocomplete_graph.json';
import SearchQuery from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';

type NodeAttributes = {
  c: string;
  d?: SearchQuery;
  visited?: boolean;
};

const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
  allowSelfLoops: false,
});
graph.import(autocompleteGraph as object);
const root = '0';
graph.updateEachNodeAttributes((node, attr) => {
  return {
    ...attr,
    visited: false,
  };
});

type QueueItem = {
  priority: number;
  data: {
    node: string;
    characters: string;
    toNext: boolean;
  };
};

class PriorityQueue {
  items: QueueItem[];
  constructor() {
    this.items = [];
  }
  enqueue(queueItem: QueueItem) {
    let contain = false;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > queueItem.priority) {
        this.items.splice(i, 0, queueItem);
        contain = true;
        break;
      }
    }
    if (!contain) {
      this.items.push(queueItem);
    }
  }
  dequeue() {
    if (this.isEmpty()) {
      return;
    }
    return this.items.shift();
  }
  front() {
    if (this.isEmpty()) {
      return;
    }
    return this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

function bfsRecursionToNextData(queue: PriorityQueue) {
  const queueItem = queue.dequeue();
  if (graph.getNodeAttribute(queueItem?.data?.node, 'visited')) {
    return;
  }
  graph.setNodeAttribute(queueItem?.data?.node, 'visited', true);
  const data = graph.getNodeAttribute(queueItem?.data?.node, 'd');
  if (typeof data !== 'undefined') {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          100 +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
    return data;
  } else {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
  }
  return;
}

function bfsRecursion(queue: PriorityQueue) {
  const queueItem = queue.dequeue();
  if (typeof queueItem?.data === 'undefined') {
    //satisfy typescript possibly undefined error
    return;
  }

  //results
  let queueRecursion = false;
  let queueToNext = false;
  let returnData = false;

  //# of characters matched
  const nodeCharacters = graph.getNodeAttribute(queueItem?.data?.node, 'c');
  let matches = 0;
  while (
    matches < nodeCharacters.length &&
    matches < queueItem?.data?.characters?.length
  ) {
    if (queueItem?.data?.characters?.[matches] === nodeCharacters[matches]) {
      matches++;
    } else {
      return;
    }
  }

  if (
    nodeCharacters.length === matches ||
    queueItem?.data?.characters?.length === matches
  ) {
    //full match or end of characters to match but all matched
    if (queueItem?.data?.characters?.length === matches) {
      //last characters
      queueToNext = true;
      returnData = true;
    } else {
      queueRecursion = true;
    }
  } else if (
    matches > 0 &&
    queueItem?.data?.characters?.length <= nodeCharacters.length
  ) {
    //partial match
    queueToNext = true;
    returnData = true;
  }

  if (queueRecursion) {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: queueItem?.data?.characters?.slice(matches),
          toNext: false,
        },
      });
    });
  }
  if (queueToNext) {
    graph.forEachOutNeighbor(queueItem?.data?.node, (neighbor) => {
      queue.enqueue({
        priority:
          (queueItem?.priority ?? 0) +
          graph.getNodeAttribute(neighbor, 'c').length,
        data: {
          node: neighbor,
          characters: '',
          toNext: true,
        },
      });
    });
  }
  if (returnData) {
    const data = graph.getNodeAttribute(queueItem?.data?.node, 'd');
    if (typeof data !== 'undefined') {
      //has data
      return data;
    }
  }
}

type bfsReturn = SearchQuery | undefined;

function searchAutocomplete(query: string, limit: number) {
  query = query.trimStart().toUpperCase();
  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      visited: false,
    };
  });
  const queue = new PriorityQueue();
  graph.forEachOutNeighbor(root, (neighbor) => {
    queue.enqueue({
      priority: graph.getNodeAttribute(neighbor, 'c').length,
      data: {
        node: neighbor,
        characters: query,
        toNext: query.length === 0, //bfsToNext if blank search string
      },
    });
  });
  const results: SearchQuery[] = [];
  while (!queue.isEmpty() && results.length < limit) {
    let response: bfsReturn;
    if (queue.front()?.data?.toNext) {
      response = bfsRecursionToNextData(queue);
    } else {
      response = bfsRecursion(queue);
    }
    if (typeof response !== 'undefined') {
      results.push(response);
    }
  }
  return results.filter(
    (option, index, self) =>
      index ===
      self.findIndex((t) => {
        if (t.prefix !== option.prefix) {
          return false;
        }
        if (t.professorName !== option.professorName) {
          return false;
        }
        if (t.number !== option.number) {
          return false;
        }
        if (t.sectionNumber !== option.sectionNumber) {
          return false;
        }
        return true;
      }),
  );
}

type Data = {
  message: string;
  data?: SearchQuery[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    return new Promise<void>((resolve) => {
      res.status(200).json({
        message: 'success',
        data: searchAutocomplete(req.query.input as string, 20),
      });
      resolve();
    });
  } else if (
    (('prefix' in req.query && typeof req.query.prefix === 'string') ||
      ('number' in req.query && typeof req.query.number === 'string') ||
      ('professorName' in req.query &&
        typeof req.query.professorName === 'string') ||
      ('sectionNumber' in req.query &&
        typeof req.query.sectionNumber === 'string')) &&
    'limit' in req.query &&
    typeof req.query.limit === 'string'
  ) {
    const prefexDefined =
      'prefix' in req.query && typeof req.query.prefix === 'string';
    const numberDefined =
      'number' in req.query && typeof req.query.number === 'string';
    const professorNameDefined =
      'professorName' in req.query &&
      typeof req.query.professorName === 'string';
    const sectionNumberDefined =
      'sectionNumber' in req.query &&
      typeof req.query.sectionNumber === 'string';
    let results: SearchQuery[] = [];

    const query: SearchQuery = {};
    if (prefexDefined) {
      query.prefix = req.query.prefix as string;
    }
    if (numberDefined) {
      query.number = req.query.number as string;
    }
    if (professorNameDefined) {
      query.professorName = req.query.professorName as string;
    }
    if (sectionNumberDefined) {
      query.sectionNumber = req.query.sectionNumber as string;
    }

    return new Promise<void>((resolve) => {
      if (
        prefexDefined &&
        numberDefined &&
        sectionNumberDefined &&
        professorNameDefined
      ) {
        results.push(
          ...searchAutocomplete(
            (req.query.prefix as string) +
              (req.query.number as string) +
              '.' +
              (req.query.sectionNumber as string) +
              ' ',
            Number(req.query.limit),
          ),
        );
      } else if (prefexDefined && numberDefined && professorNameDefined) {
        results.push(
          ...searchAutocomplete(
            (req.query.prefix as string) + (req.query.number as string) + ' ',
            Number(req.query.limit),
          ),
        );
      }
      if (results.length < Number(req.query.limit)) {
        results.push(
          ...searchAutocomplete(
            searchQueryLabel(query) + ' ',
            Number(req.query.limit),
          ),
        );
        results = results.filter(
          (query1: SearchQuery, index, self) =>
            self.findIndex((query2: SearchQuery) =>
              searchQueryEqual(query1, query2),
            ) === index,
        );
      }
      results = results.filter((result) => !searchQueryEqual(result, query));
      res.status(200).json({
        message: 'success',
        data: results,
      });
      resolve();
    });
  } else {
    res.status(400).json({ message: 'Incorrect query parameters' });
  }
}
