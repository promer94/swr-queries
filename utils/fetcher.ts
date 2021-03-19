export const fetcher = (url: string, id: number) =>
  fetch(`${url}/${id}`).then((v) => v.json())
