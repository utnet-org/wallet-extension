import fs from 'fs';
import path from 'path';
import {promisify as _promisify} from 'util';

import {KeyPair} from '~js_apis';
import {KeyStore} from './keystore';

const promisify = (fn: any) => {
    if (!fn) {
        return () => {
            throw new Error('Trying to use unimplemented function. `fs` module not available in web build?');
        };
    }
    return _promisify(fn);
};

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);

interface AccountInfo {
    account_id: string;
    public_key: string;
    private_key: string;
}

/** @hidden */
export async function loadJsonFile(filename: string): Promise<any> {
    const content = await readFile(filename);
    return JSON.parse(content.toString());
}

async function ensureDir(dir: string): Promise<void> {
    try {
        await mkdir(dir, {recursive: true});
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}

/** @hidden */
export async function readKeyFile(filename: string): Promise<[string, KeyPair]> {
    const accountInfo = await loadJsonFile(filename);
    // The private key might be in private_key or secret_key field.
    let privateKey = accountInfo.private_key;
    if (!privateKey && accountInfo.secret_key) {
        privateKey = accountInfo.secret_key;
    }
    return [accountInfo.account_id, KeyPair.fromString(privateKey)];
}

export class UnencryptedFileSystemKeyStore extends KeyStore {
    /** @hidden */
    readonly keyDir: string;

    constructor(keyDir: string) {
        super();
        this.keyDir = path.resolve(keyDir);
    }

    async setKey(networkId: string, accountId: string, keyPair: KeyPair): Promise<void> {
        await ensureDir(`${this.keyDir}/${networkId}`);
        const content: AccountInfo = {
            account_id: accountId,
            public_key: keyPair.getPublicKey().toString(),
            private_key: keyPair.toString()
        };
        await writeFile(this.getKeyFilePath(networkId, accountId), JSON.stringify(content), {mode: 0o600});
    }

    async getKey(networkId: string, accountId: string): Promise<KeyPair> {
        // Find key / account id.
        if (!await exists(this.getKeyFilePath(networkId, accountId))) {
            return null;
        }
        const accountKeyPair = await readKeyFile(this.getKeyFilePath(networkId, accountId));
        return accountKeyPair[1];
    }

    async removeKey(networkId: string, accountId: string): Promise<void> {
        if (await exists(this.getKeyFilePath(networkId, accountId))) {
            await unlink(this.getKeyFilePath(networkId, accountId));
        }
    }

    async clear(): Promise<void> {
        for (const network of await this.getNetworks()) {
            for (const account of await this.getAccounts(network)) {
                await this.removeKey(network, account);
            }
        }
    }

    /** @hidden */
    private getKeyFilePath(networkId: string, accountId: string): string {
        return `${this.keyDir}/${networkId}/${accountId}.json`;
    }

    async getNetworks(): Promise<string[]> {
        const files: string[] = await readdir(this.keyDir);
        const result = new Array<string>();
        files.forEach((item) => {
            result.push(item);
        });
        return result;
    }

    async getAccounts(networkId: string): Promise<string[]> {
        if (!await exists(`${this.keyDir}/${networkId}`)) {
            return [];
        }
        const files: string[] = await readdir(`${this.keyDir}/${networkId}`);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace(/.json$/, ''));
    }

    /** @hidden */
    toString(): string {
        return `UnencryptedFileSystemKeyStore(${this.keyDir})`;
    }
}
