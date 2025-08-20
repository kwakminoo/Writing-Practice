// Phase C1 - 에러 유틸리티
// AppError 유니온 타입 및 에러 처리 유틸리티

// 기본 에러 타입
export interface BaseError {
  code: string;
  message: string;
  details?: unknown;
}

// 인증 관련 에러
export interface AuthError extends BaseError {
  code: 'UNAUTHORIZED' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'INSUFFICIENT_PERMISSIONS';
  message: string;
}

// 검증 관련 에러
export interface ValidationError extends BaseError {
  code: 'VALIDATION_ERROR' | 'INVALID_INPUT' | 'MISSING_REQUIRED_FIELD';
  message: string;
  field?: string;
  value?: unknown;
}

// 데이터베이스 관련 에러
export interface DatabaseError extends BaseError {
  code: 'DATABASE_ERROR' | 'CONNECTION_ERROR' | 'QUERY_ERROR' | 'NOT_FOUND';
  message: string;
  table?: string;
  operation?: string;
}

// 외부 API 관련 에러
export interface ExternalApiError extends BaseError {
  code: 'API_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'RATE_LIMIT_EXCEEDED';
  message: string;
  endpoint?: string;
  statusCode?: number;
}

// 비즈니스 로직 에러
export interface BusinessError extends BaseError {
  code: 'INSUFFICIENT_COINS' | 'INVALID_OPERATION' | 'RESOURCE_LOCKED' | 'QUOTA_EXCEEDED';
  message: string;
  resource?: string;
}

// 시스템 에러
export interface SystemError extends BaseError {
  code: 'INTERNAL_SERVER_ERROR' | 'CONFIGURATION_ERROR' | 'SERVICE_UNAVAILABLE';
  message: string;
  timestamp?: string;
}

// AppError 유니온 타입
export type AppError = 
  | AuthError 
  | ValidationError 
  | DatabaseError 
  | ExternalApiError 
  | BusinessError 
  | SystemError;

// 에러 생성 유틸리티 함수들
export const createAuthError = (code: AuthError['code'], message: string): AuthError => ({
  code,
  message
});

export const createValidationError = (
  code: ValidationError['code'], 
  message: string, 
  field?: string, 
  value?: unknown
): ValidationError => ({
  code,
  message,
  field,
  value
});

export const createDatabaseError = (
  code: DatabaseError['code'], 
  message: string, 
  table?: string, 
  operation?: string
): DatabaseError => ({
  code,
  message,
  table,
  operation
});

export const createExternalApiError = (
  code: ExternalApiError['code'], 
  message: string, 
  endpoint?: string, 
  statusCode?: number
): ExternalApiError => ({
  code,
  message,
  endpoint,
  statusCode
});

export const createBusinessError = (
  code: BusinessError['code'], 
  message: string, 
  resource?: string
): BusinessError => ({
  code,
  message,
  resource
});

export const createSystemError = (
  code: SystemError['code'], 
  message: string
): SystemError => ({
  code,
  message,
  timestamp: new Date().toISOString()
});

// 에러 타입 가드 함수들
export const isAuthError = (error: AppError): error is AuthError => 
  ['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED', 'INSUFFICIENT_PERMISSIONS'].includes(error.code);

export const isValidationError = (error: AppError): error is ValidationError => 
  ['VALIDATION_ERROR', 'INVALID_INPUT', 'MISSING_REQUIRED_FIELD'].includes(error.code);

export const isDatabaseError = (error: AppError): error is DatabaseError => 
  ['DATABASE_ERROR', 'CONNECTION_ERROR', 'QUERY_ERROR', 'NOT_FOUND'].includes(error.code);

export const isExternalApiError = (error: AppError): error is ExternalApiError => 
  ['API_ERROR', 'NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMIT_EXCEEDED'].includes(error.code);

export const isBusinessError = (error: AppError): error is BusinessError => 
  ['INSUFFICIENT_COINS', 'INVALID_OPERATION', 'RESOURCE_LOCKED', 'QUOTA_EXCEEDED'].includes(error.code);

export const isSystemError = (error: AppError): error is SystemError => 
  ['INTERNAL_SERVER_ERROR', 'CONFIGURATION_ERROR', 'SERVICE_UNAVAILABLE'].includes(error.code);







