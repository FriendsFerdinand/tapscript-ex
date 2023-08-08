import fetch, { Headers } from 'node-fetch';

async function request(method: string, endPoint: string, params: any[]) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${'devnet'}:${'devnet'}`).toString('base64')}`,
  });

  const response = await fetch(`http://${'localhost'}:${18443}/${endPoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
    }),
  });
  const json: any = await response.json();

  if (response.status === 200) {
    return json.result;
  }

  return Promise.reject(new Error(json.error.message));
}

export async function blockchainRequest(method: string, params: any[]) {
  return request(method, ``, params);
}
