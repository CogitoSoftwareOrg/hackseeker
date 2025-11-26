import type { Principal } from './models';

export interface AuthCmd {
	token: string;
}

export interface ChargeCmd {
	subId: string;
	amount: number;
}
export interface UserApp {
	auth(cmd: AuthCmd): Promise<Principal>;
	charge(cmd: ChargeCmd): Promise<void>;
}
