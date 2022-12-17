export type HttpMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';

export interface CloudFunctionRequest {
    httpMethod: HttpMethod;
    headers: {[key: string]: string | undefined};
    multiValueHeaders: {[key: string]: string[];};
    queryStringParameters: {[key: string]: string | undefined};
    multiValueQueryStringParameters: {[key: string]: string[];};
    body: string;
    isBase64Encoded: boolean;
}

export interface CloudFunctionResponse {
    statusCode: number;
    headers?: {[key: string]: string;};
    multiValueHeaders?: {[key: string]: string[];};
    body: unknown;
    isBase64Encoded?: boolean;
}
