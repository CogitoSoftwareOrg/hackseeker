/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Artifacts = "artifacts",
	Chats = "chats",
	Events = "events",
	Feedbacks = "feedbacks",
	JobRuns = "jobRuns",
	Jobs = "jobs",
	Messages = "messages",
	Pains = "pains",
	SearchQueries = "searchQueries",
	Subs = "subs",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export enum ArtifactsTypeOptions {
	"quote" = "quote",
	"insight" = "insight",
	"competitor" = "competitor",
	"hack" = "hack",
}
export type ArtifactsRecord<Tpayload = unknown> = {
	created: IsoAutoDateString
	file?: FileNameString
	id: string
	pain: RecordIdString
	payload: null | Tpayload
	searchQuery: RecordIdString
	source: string
	title?: string
	type: ArtifactsTypeOptions
	updated: IsoAutoDateString
}

export enum ChatsStatusOptions {
	"empty" = "empty",
	"going" = "going",
}
export type ChatsRecord = {
	created: IsoAutoDateString
	id: string
	status: ChatsStatusOptions
	title?: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export enum EventsTypeOptions {
	"stripe" = "stripe",
}
export type EventsRecord<Tmetadata = unknown> = {
	created: IsoAutoDateString
	id: string
	key: string
	metadata?: null | Tmetadata
	name?: string
	type: EventsTypeOptions
	updated: IsoAutoDateString
}

export enum FeedbacksTypeOptions {
	"support" = "support",
	"feature" = "feature",
}
export type FeedbacksRecord = {
	content: string
	created: IsoAutoDateString
	id: string
	type: FeedbacksTypeOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum JobRunsStatusOptions {
	"running" = "running",
	"failed" = "failed",
	"canceled" = "canceled",
	"success" = "success",
	"queued" = "queued",
}
export type JobRunsRecord<Tresult = unknown> = {
	attempt?: number
	created: IsoAutoDateString
	finished?: IsoDateString
	id: string
	job?: RecordIdString
	result?: null | Tresult
	started?: IsoDateString
	status?: JobRunsStatusOptions
	updated: IsoAutoDateString
}

export enum JobsTypeOptions {
	"once" = "once",
	"every" = "every",
	"cron" = "cron",
}

export enum JobsTaskOptions {
	"notify" = "notify",
}
export type JobsRecord<Targs = unknown> = {
	args?: null | Targs
	created: IsoAutoDateString
	enabled?: IsoDateString
	id: string
	lastRun?: RecordIdString
	locked?: IsoDateString
	maxAttempts?: number
	nextRun?: IsoDateString
	task: JobsTaskOptions
	time?: string
	type: JobsTypeOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum MessagesRoleOptions {
	"user" = "user",
	"ai" = "ai",
}

export enum MessagesStatusOptions {
	"streaming" = "streaming",
	"final" = "final",
	"optimistic" = "optimistic",
}
export type MessagesRecord<Tmetadata = unknown> = {
	chat: RecordIdString
	content?: string
	created: IsoAutoDateString
	id: string
	metadata?: null | Tmetadata
	role: MessagesRoleOptions
	status: MessagesStatusOptions
	updated: IsoAutoDateString
}

export enum PainsStatusOptions {
	"draft" = "draft",
	"validation" = "validation",
}
export type PainsRecord<Tkeywords = unknown, Tmetrics = unknown> = {
	chats?: RecordIdString[]
	created: IsoAutoDateString
	id: string
	jtbd?: string
	keywords?: null | Tkeywords
	metrics?: null | Tmetrics
	problem?: string
	segment?: string
	status: PainsStatusOptions
	updated: IsoAutoDateString
	user?: RecordIdString
}

export enum SearchQueriesTypeOptions {
	"problemDiscovery" = "problemDiscovery",
	"solutionTools" = "solutionTools",
	"diyHacks" = "diyHacks",
	"comparisonListicles" = "comparisonListicles",
	"communityPain" = "communityPain",
	"communitySolutions" = "communitySolutions",
	"launchExamples" = "launchExamples",
	"general" = "general",
}
export type SearchQueriesRecord = {
	created: IsoAutoDateString
	id: string
	offset?: number
	pain?: RecordIdString
	query?: string
	type?: SearchQueriesTypeOptions
	updated: IsoAutoDateString
}

export enum SubsTariffOptions {
	"free" = "free",
	"plus" = "plus",
}

export enum SubsStatusOptions {
	"active" = "active",
	"incomplete" = "incomplete",
	"trialing" = "trialing",
	"past_due" = "past_due",
	"canceled" = "canceled",
	"unpaid" = "unpaid",
}

export enum SubsStripeIntervalOptions {
	"year" = "year",
	"month" = "month",
}
export type SubsRecord = {
	created: IsoAutoDateString
	currentPeriodEnd?: IsoDateString
	currentPeriodStart?: IsoDateString
	id: string
	pointsLimit?: number
	pointsUsage?: number
	status: SubsStatusOptions
	stripeCustomer?: string
	stripeInterval: SubsStripeIntervalOptions
	stripePrice?: string
	stripeProduct?: string
	stripeSub?: string
	tariff: SubsTariffOptions
	updated: IsoAutoDateString
	user: RecordIdString
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ArtifactsResponse<Tpayload = unknown, Texpand = unknown> = Required<ArtifactsRecord<Tpayload>> & BaseSystemFields<Texpand>
export type ChatsResponse<Texpand = unknown> = Required<ChatsRecord> & BaseSystemFields<Texpand>
export type EventsResponse<Tmetadata = unknown, Texpand = unknown> = Required<EventsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type FeedbacksResponse<Texpand = unknown> = Required<FeedbacksRecord> & BaseSystemFields<Texpand>
export type JobRunsResponse<Tresult = unknown, Texpand = unknown> = Required<JobRunsRecord<Tresult>> & BaseSystemFields<Texpand>
export type JobsResponse<Targs = unknown, Texpand = unknown> = Required<JobsRecord<Targs>> & BaseSystemFields<Texpand>
export type MessagesResponse<Tmetadata = unknown, Texpand = unknown> = Required<MessagesRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type PainsResponse<Tkeywords = unknown, Tmetrics = unknown, Texpand = unknown> = Required<PainsRecord<Tkeywords, Tmetrics>> & BaseSystemFields<Texpand>
export type SearchQueriesResponse<Texpand = unknown> = Required<SearchQueriesRecord> & BaseSystemFields<Texpand>
export type SubsResponse<Texpand = unknown> = Required<SubsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	artifacts: ArtifactsRecord
	chats: ChatsRecord
	events: EventsRecord
	feedbacks: FeedbacksRecord
	jobRuns: JobRunsRecord
	jobs: JobsRecord
	messages: MessagesRecord
	pains: PainsRecord
	searchQueries: SearchQueriesRecord
	subs: SubsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	artifacts: ArtifactsResponse
	chats: ChatsResponse
	events: EventsResponse
	feedbacks: FeedbacksResponse
	jobRuns: JobRunsResponse
	jobs: JobsResponse
	messages: MessagesResponse
	pains: PainsResponse
	searchQueries: SearchQueriesResponse
	subs: SubsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
