import {KeyStore} from './keystore';
import {KeyPair} from '~js_apis';

interface MergeKeyStoreOptions {
    writeKeyStoreIndex: number;
}

export class MergeKeyStore extends KeyStore {
    private options: MergeKeyStoreOptions;
    keyStores: KeyStore[];

    constructor(keyStores: KeyStore[], options: MergeKeyStoreOptions = {writeKeyStoreIndex: 0}) {
        super();
        this.options = options;
        this.keyStores = keyStores;
    }

    async setKey(networkId: string, accountId: string, keyPair: KeyPair): Promise<void> {
        await this.keyStores[this.options.writeKeyStoreIndex].setKey(networkId, accountId, keyPair);
    }

    async getKey(networkId: string, accountId: string): Promise<KeyPair> {
        for (const keyStore of this.keyStores) {
            const keyPair = await keyStore.getKey(networkId, accountId);
            if (keyPair) {
                return keyPair;
            }
        }
        return null;
    }

    async removeKey(networkId: string, accountId: string): Promise<void> {
        for (const keyStore of this.keyStores) {
            await keyStore.removeKey(networkId, accountId);
        }
    }

    async clear(): Promise<void> {
        for (const keyStore of this.keyStores) {
            await keyStore.clear();
        }
    }

    async getNetworks(): Promise<string[]> {
        const result = new Set<string>();
        for (const keyStore of this.keyStores) {
            for (const network of await keyStore.getNetworks()) {
                result.add(network);
            }
        }
        return Array.from(result);
    }

    async getAccounts(networkId: string): Promise<string[]> {
        const result = new Set<string>();
        for (const keyStore of this.keyStores) {
            for (const account of await keyStore.getAccounts(networkId)) {
                result.add(account);
            }
        }
        return Array.from(result);
    }

    /** @hidden */
    toString(): string {
        return `MergeKeyStore(${this.keyStores.join(', ')})`;
    }
}
