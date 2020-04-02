export interface Options {
  enrichers?: {
    document?: string[]
    blob?: string[]
  }
  schemas?: string[]
  fetchers?: {
    document?: string[]
    task?: string[]
    directoryEntry?: string[]
  }
}

export function buildOptions({ enrichers, fetchers, schemas = ['*'] }: Options): any {
  const headers: any = {
    properties: schemas.join(',')

  };
  enrichers && Object.entries(enrichers).forEach(([type, v = []]) => {
    headers[`enrichers-${type}`] = v.join(',')
  });

  fetchers && Object.entries(fetchers).forEach(([type, v = []]) => {
    headers[`fetch-${type}`] = v.join(',')
  });
      
  return { headers };
}