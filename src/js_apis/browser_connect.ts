import {Utility} from './utility';
import type {Config} from './utility';

export interface ConnectConfig extends Config {
    /** @hidden */
    keyPath?: string;
}

/**
 * Initialize connection to Utility network.
 */
export async function connect(config: ConnectConfig): Promise<Utility> {
    return new Utility(config);
}
