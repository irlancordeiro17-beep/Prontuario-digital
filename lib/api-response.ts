/**
 * lib/api-response.ts
 * Standardized API response helpers for all Prontuário Social routes.
 * Ensures consistent shape: { data?, error?, message? }
 */

import { NextResponse } from 'next/server'

export type ApiSuccess<T> = { data: T; error: null }
export type ApiError = { data: null; error: string; code?: string }

/** 200 OK with typed data */
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null } satisfies ApiSuccess<T>, { status })
}

/** 400 Bad Request */
export function apiBadRequest(message: string) {
  return NextResponse.json(
    { data: null, error: message, code: 'BAD_REQUEST' } satisfies ApiError,
    { status: 400 }
  )
}

/** 401 Unauthorized */
export function apiUnauthorized(message = 'Não autenticado') {
  return NextResponse.json(
    { data: null, error: message, code: 'UNAUTHORIZED' } satisfies ApiError,
    { status: 401 }
  )
}

/** 403 Forbidden */
export function apiForbidden(message = 'Acesso negado') {
  return NextResponse.json(
    { data: null, error: message, code: 'FORBIDDEN' } satisfies ApiError,
    { status: 403 }
  )
}

/** 404 Not Found */
export function apiNotFound(entity = 'Recurso') {
  return NextResponse.json(
    { data: null, error: `${entity} não encontrado`, code: 'NOT_FOUND' } satisfies ApiError,
    { status: 404 }
  )
}

/** 429 Too Many Requests */
export function apiRateLimit() {
  return NextResponse.json(
    { data: null, error: 'Muitas requisições. Tente novamente em instantes.', code: 'RATE_LIMITED' } satisfies ApiError,
    { status: 429, headers: { 'Retry-After': '10' } }
  )
}

/** 500 Internal Server Error */
export function apiError(error: unknown, context = 'API') {
  const message = error instanceof Error ? error.message : 'Erro interno'
  console.error(`[${context}]`, error)
  return NextResponse.json(
    { data: null, error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } satisfies ApiError,
    { status: 500 }
  )
}
