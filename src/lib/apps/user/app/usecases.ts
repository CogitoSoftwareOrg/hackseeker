import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

import { Collections, pb } from '$lib';

import type { UserApp, AuthCmd, ChargeCmd } from '../core';
import { Principal } from '../core';

export class UserAppImpl implements UserApp {
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
