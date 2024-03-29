import BN from 'bn.js';
import {Account} from './account';
import {Connection} from './connection';
import {Signer} from './signer';
import {PublicKey} from '~js_apis/utils';
import {AccountCreator, LocalAccountCreator, UrlAccountCreator} from './account_creator';
import {KeyStore} from './key_stores';

export interface Config {
    keyStore?: KeyStore;

    signer?: Signer;

    helperUrl?: string;

    initialBalance?: string;

    masterAccount?: string;

    networkId: string;

    nodeUrl: string;

    headers?: { [key: string]: string | number };

    walletUrl?: string;

    jsvmAccountId?: string;
}

export class Utility {
    readonly config: any;
    readonly connection: Connection;
    readonly accountCreator: AccountCreator;

    constructor(config: Config) {
        this.config = config;
        this.connection = Connection.fromConfig({
            networkId: config.networkId,
            provider: {type: 'JsonRpcProvider', args: {url: config.nodeUrl, headers: config.headers}},
            signer: config.signer || {type: 'InMemorySigner', keyStore: config.keyStore},
            jsvmAccountId: config.jsvmAccountId || `jsvm.${config.networkId}`
        });

        if (config.masterAccount) {
            const initialBalance = config.initialBalance ? new BN(config.initialBalance) : new BN('500000000000000000000000000');
            this.accountCreator = new LocalAccountCreator(new Account(this.connection, config.masterAccount), initialBalance);
        } else if (config.helperUrl) {
            this.accountCreator = new UrlAccountCreator(this.connection, config.helperUrl);
        } else {
            this.accountCreator = null;
        }
    }

    async account(accountId: string): Promise<Account> {
        const account = new Account(this.connection, accountId);
        return account;
    }

    async createAccount(accountId: string, publicKey: PublicKey): Promise<Account> {
        if (!this.accountCreator) {
            throw new Error('Must specify account creator, either via masterAccount or helperUrl configuration settings.');
        }
        await this.accountCreator.createAccount(accountId, publicKey);
        return new Account(this.connection, accountId);
    }
}
