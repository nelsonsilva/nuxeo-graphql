export interface Options {
  enrichers?: {}
}

export function buildOptions({ enrichers }: Options): any {
  return {
    headers: {
      'enrichers-document': enrichers
    },
  }
}