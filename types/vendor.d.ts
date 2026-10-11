declare module 'express-promise-router' {
  import { Router } from 'express';

  interface RouterConstructor {
    new (): Router;
    (): Router;
  }

  const Router: RouterConstructor;
  export = Router;
}

declare module 'fbgraph' {
  interface FacebookProfile {
    name?: string;
    id: string;
  }

  interface Graph {
    get(path: string, callback: (err: Error | null, response: FacebookProfile) => void): void;
  }

  const graph: Graph;
  export = graph;
}

declare module 'mongoose' {
  export class Schema {
    constructor(definition: Record<string, any>);
  }

  export function model(name: string, schema: Schema): unknown;

  const mongoose: {
    Schema: typeof Schema;
    model: typeof model;
  };

  export default mongoose;
}
