// Phase C2 - 로깅 헬퍼
// 브라우저/서버 공용 로깅 유틸리티

// ⚠️ PII(개인정보) 로깅 금지 주의사항 ⚠️
// - 절대 다음 정보를 로그에 포함하지 마세요:
//   - 사용자 ID, 이메일, 전화번호, 주소
//   - 비밀번호, 토큰, API 키, 세션 ID
//   - 신용카드 번호, 주민등록번호
//   - 기타 개인을 식별할 수 있는 정보
// - 로깅 시에는 익명화된 ID나 해시값을 사용하세요
// - 프로덕션에서는 민감한 정보 로깅을 완전히 비활성화하세요

// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// 로그 설정 인터페이스
interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableServerLogs: boolean;
  enableBrowserLogs: boolean;
  sanitizeData: boolean;
}

// 기본 로그 설정
const defaultConfig: LogConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableServerLogs: process.env.NODE_ENV === 'production',
  enableBrowserLogs: process.env.NODE_ENV !== 'production',
  sanitizeData: true,
};

// 현재 로그 설정
let currentConfig: LogConfig = { ...defaultConfig };

// PII 데이터 마스킹 함수
const maskPII = (data: unknown): unknown => {
  if (!currentConfig.sanitizeData) return data;
  
  if (typeof data === 'string') {
    // 이메일 마스킹
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
      return `${maskedLocal}@${domain}`;
    }
    
    // 전화번호 마스킹
    if (/^\d{10,11}$/.test(data.replace(/\D/g, ''))) {
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    
    // 토큰/API 키 마스킹 (길이가 긴 문자열)
    if (data.length > 20 && /^[a-zA-Z0-9_-]+$/.test(data)) {
      return `${data.substring(0, 8)}***${data.substring(data.length - 8)}`;
    }
  }
  
  return data;
};

// 로그 데이터 정리 함수
const sanitizeLogData = (data: unknown): unknown => {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(sanitizeLogData);
    }
    
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // 민감한 키 이름 마스킹
      const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'session', 'id'];
      const isSensitiveKey = sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      );
      
      if (isSensitiveKey) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return maskPII(data);
};

// 로그 메시지 포맷팅
const formatLogMessage = (
  level: LogLevel,
  message: string,
  data?: unknown,
  context?: Record<string, unknown>
): string => {
  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  
  let formatted = `[${timestamp}] ${levelName}: ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    const sanitizedContext = sanitizeLogData(context);
    formatted += ` | Context: ${JSON.stringify(sanitizedContext)}`;
  }
  
  if (data !== undefined) {
    const sanitizedData = sanitizeLogData(data);
    formatted += ` | Data: ${JSON.stringify(sanitizedData)}`;
  }
  
  return formatted;
};

// 브라우저 로깅
const logToBrowser = (level: LogLevel, message: string, data?: unknown, context?: Record<string, unknown>) => {
  if (!currentConfig.enableBrowserLogs || typeof window === 'undefined') return;
  
  const formattedMessage = formatLogMessage(level, message, data, context);
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
  }
};

// 서버 로깅 (향후 확장 가능)
const logToServer = (level: LogLevel, message: string, data?: unknown, context?: Record<string, unknown>) => {
  if (!currentConfig.enableServerLogs) return;
  
  const formattedMessage = formatLogMessage(level, message, data, context);
  
  // 서버 환경에서의 로깅 (향후 외부 로깅 서비스 연동 가능)
  switch (level) {
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      process.stdout.write(`${formattedMessage}\n`);
      break;
    case LogLevel.WARN:
    case LogLevel.ERROR:
      process.stderr.write(`${formattedMessage}\n`);
      break;
  }
};

// 메인 로깅 함수
const log = (level: LogLevel, message: string, data?: unknown, context?: Record<string, unknown>) => {
  if (level < currentConfig.level) return;
  
  // 콘솔 로깅
  if (currentConfig.enableConsole) {
    logToBrowser(level, message, data, context);
  }
  
  // 서버 로깅
  logToServer(level, message, data, context);
};

// 로깅 헬퍼 함수들
export const debug = (message: string, data?: unknown, context?: Record<string, unknown>) => {
  log(LogLevel.DEBUG, message, data, context);
};

export const info = (message: string, data?: unknown, context?: Record<string, unknown>) => {
  log(LogLevel.INFO, message, data, context);
};

export const warn = (message: string, data?: unknown, context?: Record<string, unknown>) => {
  log(LogLevel.WARN, message, data, context);
};

export const error = (message: string, data?: unknown, context?: Record<string, unknown>) => {
  log(LogLevel.ERROR, message, data, context);
};

// 에러 객체 전용 로깅
export const logError = (error: Error, context?: Record<string, unknown>) => {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
  
  log(LogLevel.ERROR, `Error: ${error.message}`, errorData, context);
};

// API 요청/응답 로깅
export const logApiRequest = (method: string, url: string, data?: unknown) => {
  const context = {
    method,
    url,
    timestamp: new Date().toISOString(),
  };
  
  info(`API Request: ${method} ${url}`, data, context);
};

export const logApiResponse = (method: string, url: string, status: number, data?: unknown) => {
  const context = {
    method,
    url,
    status,
    timestamp: new Date().toISOString(),
  };
  
  const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
  log(level, `API Response: ${method} ${url} - ${status}`, data, context);
};

// 설정 변경 함수
export const setLogConfig = (config: Partial<LogConfig>) => {
  currentConfig = { ...currentConfig, ...config };
};

// 현재 설정 조회
export const getLogConfig = (): LogConfig => {
  return { ...currentConfig };
};

// 로그 레벨 설정 헬퍼
export const setLogLevel = (level: LogLevel) => {
  currentConfig.level = level;
};

// PII 마스킹 토글
export const setSanitizeData = (enabled: boolean) => {
  currentConfig.sanitizeData = enabled;
};



