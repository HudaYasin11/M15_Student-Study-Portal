/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Generate a new API key
     * @param requestBody
     * @returns any Key created — apiKey field shown ONLY in this response
     * @throws ApiError
     */
    public static postApiKeys(
        requestBody?: {
            name: string;
            scopes?: Array<string>;
            sandbox?: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/keys',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List all API keys (metadata only, never the plain key)
     * @returns any List of keys
     * @throws ApiError
     */
    public static getApiKeys(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/keys',
        });
    }
    /**
     * List exams (scoped to your key's sandbox/live world)
     * @returns any List of exams
     * @throws ApiError
     */
    public static getApiV1Exams(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/exams',
        });
    }
    /**
     * Create an exam (requires write scope)
     * @param requestBody
     * @returns any Exam created
     * @throws ApiError
     */
    public static postApiV1Exams(
        requestBody?: {
            title: string;
            description?: string;
            duration?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/exams',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Enroll a user in an exam (requires write scope)
     * @param requestBody
     * @returns any Enrollment created
     * @throws ApiError
     */
    public static postApiV1Enrollments(
        requestBody?: {
            userId: number;
            examId: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/enrollments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit a result for an enrollment (requires write scope)
     * @param requestBody
     * @returns any Result recorded
     * @throws ApiError
     */
    public static postApiV1Results(
        requestBody?: {
            enrollmentId: number;
            score: number;
            passed: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/results',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Issue a certificate for a passed result (requires write scope). Triggers certificate.issued webhooks.
     * @param requestBody
     * @returns any Certificate issued
     * @throws ApiError
     */
    public static postApiV1Certificates(
        requestBody?: {
            resultId: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/certificates',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Verify a certificate by its public code
     * @param code
     * @returns any Certificate details if valid
     * @throws ApiError
     */
    public static getApiV1Certificates(
        code: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/certificates/{code}',
            path: {
                'code': code,
            },
        });
    }
    /**
     * Subscribe a URL to receive event notifications (requires write scope)
     * @param requestBody
     * @returns any Subscription created — secret shown ONLY here
     * @throws ApiError
     */
    public static postApiV1Webhooks(
        requestBody?: {
            targetUrl: string;
            events?: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/webhooks',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List your webhook subscriptions
     * @returns any List of subscriptions
     * @throws ApiError
     */
    public static getApiV1Webhooks(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/webhooks',
        });
    }
    /**
     * View your recent API request history
     * @returns any List of recent requests
     * @throws ApiError
     */
    public static getApiV1Logs(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/logs',
        });
    }
}
