import type { Principal } from '$lib/apps/user/core';

export interface SendUserMessageCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export interface ChatApp {
	run(cmd: SendUserMessageCmd): Promise<string>;
	runStream(cmd: SendUserMessageCmd): Promise<ReadableStream>;
}
