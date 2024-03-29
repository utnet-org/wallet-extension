import {Account} from './account';
import type {SignAndSendTransactionOptions} from './account';
import {Utility} from './utility';
import {KeyStore} from './key_stores';
import type {FinalExecutionOutcome} from './providers';
import {InMemorySigner} from './signer';
import {Transaction, Action, SCHEMA, createTransaction} from './transaction';
import {KeyPair, PublicKey} from './utils';
import {baseDecode} from 'borsh';
import {Connection} from './connection';
import {serialize} from 'borsh';

const LOGIN_WALLET_URL_SUFFIX = '/login/';
const MULTISIG_HAS_METHOD = 'add_request_and_confirm';
const LOCAL_STORAGE_KEY_SUFFIX = '_wallet_auth_key';
const PENDING_ACCESS_KEY_PREFIX = 'pending_key'; // browser storage key for a pending access key (i.e. key has been generated but we are not sure it was added yet)

interface SignInOptions {
    contractId?: string;
    methodNames?: string[];
    // TODO: Replace following with single callbackUrl
    successUrl?: string;
    failureUrl?: string;
}

interface RequestSignTransactionsOptions {
    transactions: Transaction[];
    callbackUrl?: string;
    meta?: string;
}

export class WalletConnection {
    /** @hidden */
    _walletBaseUrl: string;

    /** @hidden */
    _authDataKey: string;

    /** @hidden */
    _keyStore: KeyStore;

    /** @hidden */
    _authData: any;

    /** @hidden */
    _networkId: string;

    /** @hidden */
    _utility: Utility;

    /** @hidden */
    _connectedAccount: ConnectedWalletAccount;

    /** @hidden */
    _completeSignInPromise: Promise<void>;

    constructor(utility: Utility, appKeyPrefix: string | null) {
        if (typeof window === 'undefined') {
            return new Proxy(this, {
                get(target, property) {
                    if (property === 'isSignedIn') {
                        return () => false;
                    }
                    if (property === 'getAccountId') {
                        return () => '';
                    }
                    if (target[property] && typeof target[property] === 'function') {
                        return () => {
                            throw new Error('No window found in context, please ensure you are using WalletConnection on the browser');
                        };
                    }
                    return target[property];
                }
            });
        }
        this._utility = utility;
        const authDataKey = appKeyPrefix + LOCAL_STORAGE_KEY_SUFFIX;
        const authData = JSON.parse(window.localStorage.getItem(authDataKey));
        this._networkId = utility.config.networkId;
        this._walletBaseUrl = utility.config.walletUrl;
        appKeyPrefix = appKeyPrefix || utility.config.contractName || 'default';
        this._keyStore = (utility.connection.signer as InMemorySigner).keyStore;
        this._authData = authData || {allKeys: []};
        this._authDataKey = authDataKey;
        if (!this.isSignedIn()) {
            this._completeSignInPromise = this._completeSignInWithAccessKey();
        }
    }

    isSignedIn() {
        return !!this._authData.accountId;
    }

    async isSignedInAsync() {
        if (!this._completeSignInPromise) {
            return this.isSignedIn();
        }

        await this._completeSignInPromise;
        return this.isSignedIn();
    }

    getAccountId() {
        return this._authData.accountId || '';
    }

    async requestSignIn({contractId, methodNames, successUrl, failureUrl}: SignInOptions) {
        const currentUrl = new URL(window.location.href);
        const newUrl = new URL(this._walletBaseUrl + LOGIN_WALLET_URL_SUFFIX);
        newUrl.searchParams.set('success_url', successUrl || currentUrl.href);
        newUrl.searchParams.set('failure_url', failureUrl || currentUrl.href);
        if (contractId) {
            /* Throws exception if contract account does not exist */
            const contractAccount = await this._utility.account(contractId);
            await contractAccount.state();

            newUrl.searchParams.set('contract_id', contractId);
            const accessKey = KeyPair.fromRandom('ed25519');
            newUrl.searchParams.set('public_key', accessKey.getPublicKey().toString());
            await this._keyStore.setKey(this._networkId, PENDING_ACCESS_KEY_PREFIX + accessKey.getPublicKey(), accessKey);
        }

        if (methodNames) {
            methodNames.forEach(methodName => {
                newUrl.searchParams.append('methodNames', methodName);
            });
        }

        window.location.assign(newUrl.toString());
    }

    async requestSignTransactions({transactions, meta, callbackUrl}: RequestSignTransactionsOptions): Promise<void> {
        const currentUrl = new URL(window.location.href);
        const newUrl = new URL('sign', this._walletBaseUrl);

        newUrl.searchParams.set('transactions', transactions
            .map(transaction => serialize(SCHEMA, transaction))
            .map(serialized => Buffer.from(serialized).toString('base64'))
            .join(','));
        newUrl.searchParams.set('callbackUrl', callbackUrl || currentUrl.href);
        if (meta) newUrl.searchParams.set('meta', meta);

        window.location.assign(newUrl.toString());
    }

    async _completeSignInWithAccessKey() {
        const currentUrl = new URL(window.location.href);
        const publicKey = currentUrl.searchParams.get('public_key') || '';
        const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',');
        const accountId = currentUrl.searchParams.get('account_id') || '';
        // TODO: Handle errors during login
        if (accountId) {
            const authData = {
                accountId,
                allKeys
            };
            window.localStorage.setItem(this._authDataKey, JSON.stringify(authData));
            if (publicKey) {
                await this._moveKeyFromTempToPermanent(accountId, publicKey);
            }
            this._authData = authData;
        }
        currentUrl.searchParams.delete('public_key');
        currentUrl.searchParams.delete('all_keys');
        currentUrl.searchParams.delete('account_id');
        currentUrl.searchParams.delete('meta');
        currentUrl.searchParams.delete('transactionHashes');

        window.history.replaceState({}, document.title, currentUrl.toString());
    }

    async _moveKeyFromTempToPermanent(accountId: string, publicKey: string) {
        const keyPair = await this._keyStore.getKey(this._networkId, PENDING_ACCESS_KEY_PREFIX + publicKey);
        await this._keyStore.setKey(this._networkId, accountId, keyPair);
        await this._keyStore.removeKey(this._networkId, PENDING_ACCESS_KEY_PREFIX + publicKey);
    }

    signOut() {
        this._authData = {};
        window.localStorage.removeItem(this._authDataKey);
    }

    account() {
        if (!this._connectedAccount) {
            this._connectedAccount = new ConnectedWalletAccount(this, this._utility.connection, this._authData.accountId);
        }
        return this._connectedAccount;
    }
}

export class ConnectedWalletAccount extends Account {
    walletConnection: WalletConnection;

    constructor(walletConnection: WalletConnection, connection: Connection, accountId: string) {
        super(connection, accountId);
        this.walletConnection = walletConnection;
    }

    // Overriding Account methods

    protected async signAndSendTransaction({
                                               receiverId,
                                               actions,
                                               walletMeta,
                                               walletCallbackUrl = window.location.href
                                           }: SignAndSendTransactionOptions): Promise<FinalExecutionOutcome> {
        const localKey = await this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);
        let accessKey = await this.accessKeyForTransaction(receiverId, actions, localKey);
        if (!accessKey) {
            throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`);
        }

        if (localKey && localKey.toString() === accessKey.public_key) {
            try {
                return await super.signAndSendTransaction({receiverId, actions});
            } catch (e) {
                if (e.type === 'NotEnoughAllowance') {
                    accessKey = await this.accessKeyForTransaction(receiverId, actions);
                } else {
                    throw e;
                }
            }
        }

        const block = await this.connection.provider.block({finality: 'final'});
        const blockHash = baseDecode(block.header.hash);

        const publicKey = PublicKey.from(accessKey.public_key);
        // TODO: Cache & listen for nonce updates for given access key
        const nonce = accessKey.access_key.nonce + 1;
        const transaction = createTransaction(this.accountId, publicKey, receiverId, nonce, actions, blockHash);
        await this.walletConnection.requestSignTransactions({
            transactions: [transaction],
            meta: walletMeta,
            callbackUrl: walletCallbackUrl
        });

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Failed to redirect to sign transaction'));
            }, 1000);
        });

    }

    async accessKeyMatchesTransaction(accessKey, receiverId: string, actions: Action[]): Promise<boolean> {
        const {access_key: {permission}} = accessKey;
        if (permission === 'FullAccess') {
            return true;
        }

        if (permission.FunctionCall) {
            const {receiver_id: allowedReceiverId, method_names: allowedMethods} = permission.FunctionCall;
            if (allowedReceiverId === this.accountId && allowedMethods.includes(MULTISIG_HAS_METHOD)) {
                return true;
            }
            if (allowedReceiverId === receiverId) {
                if (actions.length !== 1) {
                    return false;
                }
                const [{functionCall}] = actions;
                return functionCall &&
                    (!functionCall.deposit || functionCall.deposit.toString() === '0') && // TODO: Should support charging amount smaller than allowance?
                    (allowedMethods.length === 0 || allowedMethods.includes(functionCall.methodName));
            }
        }

        return false;
    }

    async accessKeyForTransaction(receiverId: string, actions: Action[], localKey?: PublicKey): Promise<any> {
        const accessKeys = await this.getAccessKeys();

        if (localKey) {
            const accessKey = accessKeys.find(key => key.public_key.toString() === localKey.toString());
            if (accessKey && await this.accessKeyMatchesTransaction(accessKey, receiverId, actions)) {
                return accessKey;
            }
        }

        const walletKeys = this.walletConnection._authData.allKeys;
        for (const accessKey of accessKeys) {
            if (walletKeys.indexOf(accessKey.public_key) !== -1 && await this.accessKeyMatchesTransaction(accessKey, receiverId, actions)) {
                return accessKey;
            }
        }

        return null;
    }
}
