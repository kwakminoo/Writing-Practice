// Phase C1 - Result 유틸리티
// 성공/실패 결과를 타입 안전하게 처리하는 유틸리티

import { AppError } from './errors';

// Result 타입 정의
export type Result<T, E = AppError> = Success<T> | Failure<E>;

// 성공 결과
export interface Success<T> {
  readonly _tag: 'Success';
  readonly data: T;
}

// 실패 결과
export interface Failure<E> {
  readonly _tag: 'Failure';
  readonly error: E;
}

// Result 생성 함수들
export const success = <T>(data: T): Success<T> => ({
  _tag: 'Success',
  data
});

export const failure = <E>(error: E): Failure<E> => ({
  _tag: 'Failure',
  error
});

// Result 타입 가드 함수들
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => 
  result._tag === 'Success';

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => 
  result._tag === 'Failure';

// Result 처리 유틸리티 함수들
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
};

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (isFailure(result)) {
    return failure(fn(result.error));
  }
  return result;
};

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
};

export const getOrElse = <T, E>(
  result: Result<T, E>,
  defaultValue: T
): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
};

export const getOrThrow = <T, E>(
  result: Result<T, E>
): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  throw new Error(`Result is failure: ${JSON.stringify(result.error)}`);
};

// 비동기 Result 처리
export const fromPromise = async <T>(
  promise: Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};

// Result를 Option으로 변환
export const toOption = <T, E>(result: Result<T, E>): T | null => {
  if (isSuccess(result)) {
    return result.data;
  }
  return null;
};

// 여러 Result를 결합
export const combine = <T extends readonly unknown[], E>(
  results: { [K in keyof T]: Result<T[K], E> }
): Result<T, E> => {
  const data: T = [] as unknown as T;
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (isFailure(result)) {
      return result;
    }
    data[i] = result.data;
  }
  
  return success(data);
};

// Result 패턴 매칭
export const match = <T, E, R>(
  result: Result<T, E>,
  onSuccess: (data: T) => R,
  onFailure: (error: E) => R
): R => {
  if (isSuccess(result)) {
    return onSuccess(result.data);
  }
  return onFailure(result.error);
};

// Result 로깅
export const tap = <T, E>(
  result: Result<T, E>,
  logger: (result: Result<T, E>) => void
): Result<T, E> => {
  logger(result);
  return result;
};

// 성공 시에만 로깅
export const tapSuccess = <T, E>(
  result: Result<T, E>,
  logger: (data: T) => void
): Result<T, E> => {
  if (isSuccess(result)) {
    logger(result.data);
  }
  return result;
};

// 실패 시에만 로깅
export const tapFailure = <T, E>(
  result: Result<T, E>,
  logger: (error: E) => void
): Result<T, E> => {
  if (isFailure(result)) {
    logger(result.error);
  }
  return result;
};



