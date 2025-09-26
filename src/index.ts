import HttpClient, { HttpClientOptions } from "./http";
import { TabularClient } from "./endpoints/tabular";
import { TextClient } from "./endpoints/text";
export * from "./types";

// Hard-coded base URL; not user-configurable
const BASE_URL = "https://moral-danice-poeai-c2f6213c.koyeb.app";

export interface SynthikClientOptions {
	apiKey?: string;
	timeoutMs?: number;
	defaultHeaders?: Record<string, string>;
	retries?: number;
	retryBackoffMs?: number;
	apiVersion?: 'v1' | 'v2';
	warnOnDeprecated?: boolean;
}

export class SynthikClient {
	readonly http: HttpClient;
	readonly tabular: TabularClient;
	readonly text: TextClient;
	readonly apiVersion: ApiVersion;
	readonly auth: AuthClient;

	constructor(opts: SynthikClientOptions = {}) {
		const baseUrl = BASE_URL;
		this.apiVersion = (opts.apiVersion ?? 'v1');
		if (!['v1','v2'].includes(this.apiVersion)) throw new Error('apiVersion must be v1 or v2');
		this.http = new HttpClient({
			baseUrl,
			apiKey: opts.apiKey,
			timeoutMs: opts.timeoutMs,
			defaultHeaders: opts.defaultHeaders,
			retries: opts.retries,
			retryBackoffMs: opts.retryBackoffMs,
		} as HttpClientOptions);
		const warn = opts.warnOnDeprecated !== false;
		if (warn && this.apiVersion === 'v1') {
			console.warn('[Synthik] API v1 is deprecated and will sunset 2025-09-26. Switch to apiVersion="v2".');
		}
		this.tabular = new TabularClient(this.http, this.apiVersion, warn);
		this.text = new TextClient(this.http, this.apiVersion, warn);
		this.auth = new AuthClient(this.http, this.apiVersion, warn);
	}

	tabularClient(): TabularClient { return this.tabular }
	textClient(): TextClient { return this.text }
	authClient(): AuthClient { return this.auth }
}

export type ApiVersion = 'v1' | 'v2'

export class AuthClient {
	constructor(private http: HttpClient, private apiVersion: ApiVersion, private warn: boolean) {
		if (warn && apiVersion === 'v1') {
			console.warn('[DEPRECATION] Auth v1 endpoints are deprecated; migrate to /api/v2/auth');
		}
	}

	v1Register(email: string, password: string) {
		console.warn('[DEPRECATION] v1Register deprecated; use v2Register');
		return this.http.request<AuthResponse>('POST', '/api/v1/auth/register', { body: { email, password } });
	}
	v2Register(email: string, password: string) {
		return this.http.request<AuthResponse>('POST', '/api/v2/auth/register', { body: { email, password } });
	}
	v1Login(email: string, password: string) {
		console.warn('[DEPRECATION] v1Login deprecated; use v2Login');
		return this.http.request<AuthResponse>('POST', '/api/v1/auth/login', { body: { email, password } });
	}
	v2Login(email: string, password: string) {
		return this.http.request<AuthResponse>('POST', '/api/v2/auth/login', { body: { email, password } });
	}
	register(email: string, password: string) {
		return this.apiVersion === 'v1' ? this.v1Register(email, password) : this.v2Register(email, password);
	}
	login(email: string, password: string) {
		return this.apiVersion === 'v1' ? this.v1Login(email, password) : this.v2Login(email, password);
	}
	validateToken(token?: string) {
		const headers: Record<string,string> = {};
		if (token) headers['Authorization'] = `Bearer ${token}`;
		return this.http.request<TokenValidationResponse>('GET', `/api/${this.apiVersion}/auth/token/validate`, { headers });
	}
	listTokens(includeRevoked = false, includeExpired = false) {
		return this.http.request<TokenListResponse>('GET', `/api/${this.apiVersion}/auth/tokens`, { query: { include_revoked: includeRevoked, include_expired: includeExpired } });
	}
	revoke(token: string) {
		return this.http.request<RevokeResponse>('POST', `/api/${this.apiVersion}/auth/revoke`, { body: { token } });
	}
	revokeById(token_id: number) {
		return this.http.request<RevokeResponse>('POST', `/api/${this.apiVersion}/auth/revoke/by-id`, { body: { token_id } });
	}
	me() {
		return this.http.request<UserMeResponse>('GET', `/api/${this.apiVersion}/auth/me`);
	}
}

// Minimal response type placeholders (extend when backend schemas available)
export interface AuthResponse { token?: string; user?: any; [k: string]: any }
export interface TokenValidationResponse { valid: boolean; expires_at?: string; [k: string]: any }
export interface TokenListResponse { tokens: any[] }
export interface RevokeResponse { revoked?: boolean; [k: string]: any }
export interface UserMeResponse { id: number; email: string; [k: string]: any }

export default SynthikClient;

