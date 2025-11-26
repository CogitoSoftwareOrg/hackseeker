import type { ChatApp } from '$lib/apps/chat/core';
import type { UserApp } from '$lib/apps/user/core';

import type { EdgeApp, StreamChatCmd } from '../core';

const DEFAULT_CHARGE_AMOUNT = 1;

export class EdgeAppImpl implements EdgeApp {
	constructor(
		private readonly userApp: UserApp,
		private readonly chatApp: ChatApp
	) {}

	async streamChat(cmd: StreamChatCmd): Promise<ReadableStream> {
		const { principal, chatId, query } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= 0) throw new Error('Insufficient balance');

		const chatApp = this.chatApp;
		const userApp = this.userApp;
		let charged = false;

		return new ReadableStream({
			async start(controller) {
				try {
					const stream = await chatApp.runStream({ principal, chatId, query });
					const reader = stream.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						controller.enqueue(value);
					}
					controller.close();
				} finally {
					if (!charged) {
						await userApp.charge({ subId: principal.sub.id, amount: DEFAULT_CHARGE_AMOUNT });
						charged = true;
					}
				}
			}
		});
	}
}
