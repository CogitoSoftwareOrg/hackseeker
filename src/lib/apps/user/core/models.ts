import type { RecordAuthResponse } from 'pocketbase';
import type { UsersResponse, SubsResponse, UserExpand } from '$lib';

export enum Importance {
	Low = 'low',
	Medium = 'medium',
	High = 'high'
}

export type UserMemory = {
	userId: string;
	content: string;
	tokens: number;
	importance: Importance;
};

export class Principal {
	constructor(
		public user: UsersResponse,
		public sub: SubsResponse,
		public usage: number,
		public limit: number,
		public remaining: number
	) {}

	static fromAuthRecord(res: RecordAuthResponse) {
		if (!res) throw new Error('No auth record');
		const user = res.record as UsersResponse<UserExpand>;
		const sub = user.expand?.subs_via_user?.at(0) ?? null;
		if (!sub) throw new Error('No subscription record');

		const usage = sub.pointsUsage;
		const limit = sub.pointsLimit;
		const remaining = limit - usage;

		return new Principal(user, sub, usage, limit, remaining);
	}
}
