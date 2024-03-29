import sha256 from 'js-sha256';
import {KeyPair, PublicKey} from '~js_apis/utils';
import type {Signature} from './utils/key_pair';
import {KeyStore} from '~js_apis/key_stores';
import {InMemoryKeyStore} from '~js_apis/key_stores';

export abstract class Signer {
    abstract createKey(accountId: string, networkId?: string): Promise<PublicKey>;

    abstract getPublicKey(accountId?: string, networkId?: string): Promise<PublicKey>;

    abstract signMessage(message: Uint8Array, accountId?: string, networkId?: string): Promise<Signature>;
}

export class InMemorySigner extends Signer {
    readonly keyStore: KeyStore;

    constructor(keyStore: KeyStore) {
        super();
        this.keyStore = keyStore;
    }

    static async fromKeyPair(networkId: string, accountId: string, keyPair: KeyPair): Promise<Signer> {
        const keyStore = new InMemoryKeyStore();
        await keyStore.setKey(networkId, accountId, keyPair);
        return new InMemorySigner(keyStore);
    }

    async createKey(accountId: string, networkId: string): Promise<PublicKey> {
        const keyPair = KeyPair.fromRandom('ed25519');
        await this.keyStore.setKey(networkId, accountId, keyPair);
        return keyPair.getPublicKey();
    }

    async getPublicKey(accountId?: string, networkId?: string): Promise<PublicKey> {
        const keyPair = await this.keyStore.getKey(networkId, accountId);
        if (keyPair === null) {
            return null;
        }
        return keyPair.getPublicKey();
    }

    async signMessage(message: Uint8Array, accountId?: string, networkId?: string): Promise<Signature> {
        const hash = new Uint8Array(sha256.sha256.array(message));
        if (!accountId) {
            throw new Error('InMemorySigner requires provided account id');
        }
        const keyPair = await this.keyStore.getKey(networkId, accountId);
        if (keyPair === null) {
            throw new Error(`Key for ${accountId} not found in ${networkId}`);
        }
        return keyPair.sign(hash);
    }

    toString(): string {
        return `InMemorySigner(${this.keyStore})`;
    }
}
