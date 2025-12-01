import type { Importance, Principal, UserMemory } from './models';

export type UserMemoryGetCmd = {
	query: string;
	tokens: number;
	userId: string;
};

export type UserMemoryPutCmd = {
	dtos: { userId: string; content: string; importance: Importance }[];
};

export interface AuthCmd {
	token: string;
}

export interface ChargeCmd {
	subId: string;
	amount: number;
}
export interface UserApp {
	getMemories(cmd: UserMemoryGetCmd): Promise<UserMemory[]>;
	putMemories(cmd: UserMemoryPutCmd): Promise<void>;

	auth(cmd: AuthCmd): Promise<Principal>;
	charge(cmd: ChargeCmd): Promise<void>;
}
