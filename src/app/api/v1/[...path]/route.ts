import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://46.225.103.236:8003';

async function proxyRequest(req: NextRequest, { params }: { params: any }) {
  // Await params if it's a promise (Next.js 15+ behavior)
  const resolvedParams = await params;
  const pathArray = resolvedParams.path || [];
  const path = pathArray.join('/');
  const searchParams = req.nextUrl.search;
  
  // Always append trailing slash to the path since Django expects it
  const backendUrl = `${API_BASE_URL}/api/v1/${path}/${searchParams}`;

  const headers = new Headers(req.headers);
  headers.delete('host'); 
  headers.delete('connection');
  headers.delete('content-length');

  try {
    const res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('content-encoding');

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ detail: 'Proxy Error' }), { status: 500 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
