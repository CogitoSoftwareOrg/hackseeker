import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

import { Collections, pb } from '$lib';

import type {
	UserApp,
	AuthCmd,
	ChargeCmd,
	UserIndexer,
	UserMemory,
	UserMemoryGetCmd,
	UserMemoryPutCmd
} from '../core';
import { Principal } from '../core';
import { countTokens } from '$lib/shared/server';

export class UserAppImpl implements UserApp {
	constructor(private readonly userIndexer: UserIndexer) {}

	async getMemories(cmd: UserMemoryGetCmd): Promise<UserMemory[]> {
		return this.userIndexer.search(cmd.query, cmd.tokens, cmd.userId);
	}

	async putMemories(cmd: UserMemoryPutCmd): Promise<void> {
		const memories = cmd.dtos.map((dto) => ({
			userId: dto.userId,
			content: dto.content,
			importance: dto.importance,
			tokens: countTokens(dto.content)
		}));
		await this.userIndexer.add(memories);
	}

	async auth(cmd: AuthCmd): Promise<Principal> {
		const authPb = new PocketBase(env.PUBLIC_PB_URL);
		authPb.authStore.save(cmd.token);

		const res = await authPb.collection(Collections.Users).authRefresh({ expand: 'subs_via_user' });
		return Principal.fromAuthRecord(res);
	}

	async charge(cmd: ChargeCmd): Promise<void> {
		await pb.collection(Collections.Subs).update(cmd.subId, {
			'pointsUsage+': cmd.amount
		});
	}
}
