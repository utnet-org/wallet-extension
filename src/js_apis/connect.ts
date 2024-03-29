import {readKeyFile} from './key_stores/unencrypted_file_system_keystore';
import {InMemoryKeyStore, MergeKeyStore} from './key_stores';
import {Utility} from './utility';
import type {Config} from './utility';
import fetch from './utils/setup_node_fetch';
import {logWarning} from './utils';

global.fetch = fetch;

export interface ConnectConfig extends Config {
    /**
     * Initialize an {@link InMemoryKeyStore} by reading the file at keyPath.
     */
    keyPath?: string;
}

/**
 * Initialize connection to Utility network.
 */
export async function connect(config: ConnectConfig): Promise<Utility> {
    // Try to find extra key in `KeyPath` if provided.
    if (config.keyPath && config.keyStore) {
        try {
            const accountKeyFile = await readKeyFile(config.keyPath);
            if (accountKeyFile[0]) {
                const keyPair = accountKeyFile[1];
                const keyPathStore = new InMemoryKeyStore();
                await keyPathStore.setKey(config.networkId, accountKeyFile[0], keyPair);
                if (!config.masterAccount) {
                    config.masterAccount = accountKeyFile[0];
                }
                config.keyStore = new MergeKeyStore([
                    keyPathStore,
                    config.keyStore
                ], {writeKeyStoreIndex: 1});
                if (!process.env['NO_LOGS']) {
                    console.log(`Loaded master account ${accountKeyFile[0]} key from ${config.keyPath} with public key = ${keyPair.getPublicKey()}`);
                }
            }
        } catch (error) {
            logWarning(`Failed to load master account key from ${config.keyPath}: ${error}`);
        }
    }
    return new Utility(config);
}
