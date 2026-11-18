import { handleCareerAiRequest, type CareerAiRequestBody } from '../../server/careerAiHandler';

const CORS_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Тек POST сұрауларына рұқсат етіледі.' }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    const body = (await req.json()) as CareerAiRequestBody;
    const result = await handleCareerAiRequest(body);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: CORS_HEADERS,
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'JSON деректерін оқу мүмкін болмады.' }),
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
