import type { Principal } from '$lib/apps/user/core';
import type { DI } from '$lib/shared/server/di';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			principal: Principal | undefined;
			di: DI;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
