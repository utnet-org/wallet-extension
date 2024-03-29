import BN from 'bn.js';
import depd from 'depd';
import {
    transfer,
    createAccount,
    signTransaction,
    deployContract,
    addKey,
    functionCall,
    fullAccessKey,
    functionCallAccessKey,
    deleteKey,
    stake,
    deleteAccount,
    Action,
    SignedTransaction,
    stringifyJsonOrBytes
} from './transaction';
import {TypedError, ErrorContext} from './providers';
import type {FinalExecutionOutcome} from './providers';
import type {
    ViewStateResult,
    AccountView,
    AccessKeyView,
    CodeResult,
    AccessKeyList,
    AccessKeyInfoView,
    FunctionCallPermissionView,
    BlockReference
} from './providers/provider';
import {Connection} from './connection';
import {baseDecode, baseEncode} from 'borsh';
import {PublicKey} from '~js_apis/utils';
import {logWarning, PositionalArgsError} from './utils/errors';
import {parseRpcError, parseResultError} from './utils/rpc_errors';
import {ServerError} from './utils/rpc_errors';
import {DEFAULT_FUNCTION_CALL_GAS} from './constants';

import exponential_backoff from './utils/exponential_backoff';

// Default number of retries with different nonce before giving up on a transaction.
const TX_NONCE_RETRY_NUMBER = 12;

// Default wait until next retry in millis.
const TX_NONCE_RETRY_WAIT = 500;

// Exponential back off for waiting to retry.
const TX_NONCE_RETRY_WAIT_BACKOFF = 1.5;

export interface AccountBalance {
    total: string;
    stateStaked: string;
    staked: string;
    available: string;
}

export interface AccountAuthorizedApp {
    contractId: string;
    amount: string;
    publicKey: string;
}

export interface SignAndSendTransactionOptions {
    receiverId: string;
    actions: Action[];
    walletMeta?: string;
    walletCallbackUrl?: string;
    returnError?: boolean;
}

export interface FunctionCallOptions {
    contractId: string;
    methodName: string;
    args: object;
    gas?: BN;
    attachedDeposit?: BN;
    stringify?: (input: any) => Buffer;
    jsContract?: boolean;
}

export interface ChangeFunctionCallOptions extends FunctionCallOptions {
    walletMeta?: string;
    walletCallbackUrl?: string;
}

export interface ViewFunctionCallOptions extends FunctionCallOptions {
    parse?: (response: Uint8Array) => any;
    blockQuery?: BlockReference;
}

interface ReceiptLogWithFailure {
    receiptIds: [string];
    logs: [string];
    failure: ServerError;
}

function parseJsonFromRawResponse(response: Uint8Array): any {
    return JSON.parse(Buffer.from(response).toString());
}

function bytesJsonStringify(input: any): Buffer {
    return Buffer.from(JSON.stringify(input));
}

export class Account {
    readonly connection: Connection;
    readonly accountId: string;

    constructor(connection: Connection, accountId: string) {
        this.connection = connection;
        this.accountId = accountId;
    }

    async state(): Promise<AccountView> {
        return this.connection.provider.query<AccountView>({
            request_type: 'view_account',
            account_id: this.accountId,
            finality: 'optimistic'
        });
    }

    /** @hidden */
    private printLogsAndFailures(contractId: string, results: [ReceiptLogWithFailure]) {
        if (!process.env['NO_LOGS']) {
            for (const result of results) {
                console.log(`Receipt${result.receiptIds.length > 1 ? 's' : ''}: ${result.receiptIds.join(', ')}`);
                this.printLogs(contractId, result.logs, '\t');
                if (result.failure) {
                    console.warn(`\tFailure [${contractId}]: ${result.failure}`);
                }
            }
        }
    }

    /** @hidden */
    private printLogs(contractId: string, logs: string[], prefix = '') {
        if (!process.env['NO_LOGS']) {
            for (const log of logs) {
                console.log(`${prefix}Log [${contractId}]: ${log}`);
            }
        }
    }

    protected async signTransaction(receiverId: string, actions: Action[]): Promise<[Uint8Array, SignedTransaction]> {
        const accessKeyInfo = await this.findAccessKey(receiverId, actions);
        if (!accessKeyInfo) {
            throw new TypedError(`Can not sign transactions for account ${this.accountId} on network ${this.connection.networkId}, no matching key pair exists for this account`, 'KeyNotFound');
        }
        const {accessKey} = accessKeyInfo;

        const block = await this.connection.provider.block({finality: 'final'});
        const blockHash = block.header.hash;

        const nonce = ++accessKey.nonce;
        return await signTransaction(
            receiverId, nonce, actions, baseDecode(blockHash), this.connection.signer, this.accountId, this.connection.networkId
        );
    }

    protected async signAndSendTransaction({
                                               receiverId,
                                               actions,
                                               returnError
                                           }: SignAndSendTransactionOptions): Promise<FinalExecutionOutcome> {
        let txHash, signedTx;
        // TODO: TX_NONCE (different constants for different uses of exponential_backoff?)
        const result = await exponential_backoff(TX_NONCE_RETRY_WAIT, TX_NONCE_RETRY_NUMBER, TX_NONCE_RETRY_WAIT_BACKOFF, async () => {
            [txHash, signedTx] = await this.signTransaction(receiverId, actions);
            const publicKey = signedTx.transaction.publicKey;

            try {
                return await this.connection.provider.sendTransaction(signedTx);
            } catch (error) {
                if (error.type === 'InvalidNonce') {
                    logWarning(`Retrying transaction ${receiverId}:${baseEncode(txHash)} with new nonce.`);
                    delete this.accessKeyByPublicKeyCache[publicKey.toString()];
                    return null;
                }
                if (error.type === 'Expired') {
                    logWarning(`Retrying transaction ${receiverId}:${baseEncode(txHash)} due to expired block hash`);
                    return null;
                }

                error.context = new ErrorContext(baseEncode(txHash));
                throw error;
            }
        });
        if (!result) {
            throw new TypedError('nonce retries exceeded for transaction. This usually means there are too many parallel requests with the same access key.', 'RetriesExceeded');
        }

        const flatLogs = [result.transaction_outcome, ...(Array.isArray(result.receipts_outcome) ? result.receipts_outcome : [])].reduce((acc, it) => {
            if (it && it.outcome && (it.outcome.logs.length || (it.outcome.status && it.outcome.status.Failure))) {
                acc.push({
                    'receiptIds': it.outcome.receipt_ids,
                    'logs': it.outcome.logs,
                    'failure': it.outcome.status && it.outcome.status.Failure ? parseRpcError(it.outcome.status.Failure) : null
                });
            }
            return acc;
        }, []);
        this.printLogsAndFailures(signedTx.transaction.receiverId, flatLogs);

        if (!returnError && typeof result.status === 'object' && typeof result.status.Failure === 'object') {
            // if error data has error_message and error_type properties, we consider that node returned an error in the old format
            if (result.status.Failure.error_message && result.status.Failure.error_type) {
                throw new TypedError(
                    `Transaction ${result.transaction_outcome.id} failed. ${result.status.Failure.error_message}`,
                    result.status.Failure.error_type);
            } else {
                throw parseResultError(result);
            }
        }
        // TODO: if Tx is Unknown or Started.
        return result;
    }

    /** @hidden */
    accessKeyByPublicKeyCache: { [key: string]: AccessKeyView } = {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findAccessKey(receiverId: string, actions: Action[]): Promise<{
        publicKey: PublicKey;
        accessKey: AccessKeyView
    }> {
        const publicKey = await this.connection.signer.getPublicKey(this.accountId, this.connection.networkId);
        if (!publicKey) {
            throw new TypedError(`no matching key pair found in ${this.connection.signer}`, 'PublicKeyNotFound');
        }

        const cachedAccessKey = this.accessKeyByPublicKeyCache[publicKey.toString()];
        if (cachedAccessKey !== undefined) {
            return {publicKey, accessKey: cachedAccessKey};
        }

        try {
            const accessKey = await this.connection.provider.query<AccessKeyView>({
                request_type: 'view_access_key',
                account_id: this.accountId,
                public_key: publicKey.toString(),
                finality: 'optimistic'
            });

            // this function can be called multiple times and retrieve the same access key
            // this checks to see if the access key was already retrieved and cached while
            // the above network call was in flight. To keep nonce values in line, we return
            // the cached access key.
            if (this.accessKeyByPublicKeyCache[publicKey.toString()]) {
                return {publicKey, accessKey: this.accessKeyByPublicKeyCache[publicKey.toString()]};
            }

            this.accessKeyByPublicKeyCache[publicKey.toString()] = accessKey;
            return {publicKey, accessKey};
        } catch (e) {
            if (e.type == 'AccessKeyDoesNotExist') {
                return null;
            }

            throw e;
        }
    }

    async createAndDeployContract(contractId: string, publicKey: string | PublicKey, data: Uint8Array, amount: BN): Promise<Account> {
        const accessKey = fullAccessKey();
        await this.signAndSendTransaction({
            receiverId: contractId,
            actions: [createAccount(), transfer(amount), addKey(PublicKey.from(publicKey), accessKey), deployContract(data)]
        });
        const contractAccount = new Account(this.connection, contractId);
        return contractAccount;
    }

    async sendMoney(receiverId: string, amount: BN): Promise<any> {
        let txHash, signedTx;
        [txHash, signedTx] = await this.signTransaction(receiverId, [transfer(amount)]);
        console.log("txHash:", baseEncode(txHash))
        this.connection.provider.sendTransaction(signedTx);
        return baseEncode(txHash)
    }

    async createAccount(newAccountId: string, publicKey: string | PublicKey, amount: BN): Promise<FinalExecutionOutcome> {
        const accessKey = fullAccessKey();
        return this.signAndSendTransaction({
            receiverId: newAccountId,
            actions: [createAccount(), transfer(amount), addKey(PublicKey.from(publicKey), accessKey)]
        });
    }

    async deleteAccount(beneficiaryId: string) {
        if (!process.env['NO_LOGS']) {
            console.log('Deleting an account does not automatically transfer NFTs and FTs to the beneficiary address. Ensure to transfer assets before deleting.');
        }
        return this.signAndSendTransaction({
            receiverId: this.accountId,
            actions: [deleteAccount(beneficiaryId)]
        });
    }

    async deployContract(data: Uint8Array): Promise<FinalExecutionOutcome> {
        return this.signAndSendTransaction({
            receiverId: this.accountId,
            actions: [deployContract(data)]
        });
    }

    /** @hidden */
    private encodeJSContractArgs(contractId: string, method: string, args) {
        return Buffer.concat([Buffer.from(contractId), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(args)]);
    }

    async functionCall({
                           contractId,
                           methodName,
                           args = {},
                           gas = DEFAULT_FUNCTION_CALL_GAS,
                           attachedDeposit,
                           walletMeta,
                           walletCallbackUrl,
                           stringify,
                           jsContract
                       }: ChangeFunctionCallOptions): Promise<FinalExecutionOutcome> {
        this.validateArgs(args);
        let functionCallArgs;

        if (jsContract) {
            const encodedArgs = this.encodeJSContractArgs(contractId, methodName, JSON.stringify(args));
            functionCallArgs = ['call_js_contract', encodedArgs, gas, attachedDeposit, null, true];
        } else {
            const stringifyArg = stringify === undefined ? stringifyJsonOrBytes : stringify;
            functionCallArgs = [methodName, args, gas, attachedDeposit, stringifyArg, false];
        }

        return this.signAndSendTransaction({
            receiverId: jsContract ? this.connection.jsvmAccountId : contractId,
            // eslint-disable-next-line prefer-spread
            actions: [functionCall.apply(void 0, functionCallArgs)],
            walletMeta,
            walletCallbackUrl
        });
    }

    async addKey(publicKey: string | PublicKey, contractId?: string, methodNames?: string | string[], amount?: BN): Promise<FinalExecutionOutcome> {
        if (!methodNames) {
            methodNames = [];
        }
        if (!Array.isArray(methodNames)) {
            methodNames = [methodNames];
        }
        let accessKey;
        if (!contractId) {
            accessKey = fullAccessKey();
        } else {
            accessKey = functionCallAccessKey(contractId, methodNames, amount);
        }
        return this.signAndSendTransaction({
            receiverId: this.accountId,
            actions: [addKey(PublicKey.from(publicKey), accessKey)]
        });
    }

    async deleteKey(publicKey: string | PublicKey): Promise<FinalExecutionOutcome> {
        return this.signAndSendTransaction({
            receiverId: this.accountId,
            actions: [deleteKey(PublicKey.from(publicKey))]
        });
    }

    async stake(publicKey: string | PublicKey, amount: BN): Promise<FinalExecutionOutcome> {
        return this.signAndSendTransaction({
            receiverId: this.accountId,
            actions: [stake(amount, PublicKey.from(publicKey))]
        });
    }

    /** @hidden */
    private validateArgs(args: any) {
        const isUint8Array = args.byteLength !== undefined && args.byteLength === args.length;
        if (isUint8Array) {
            return;
        }

        if (Array.isArray(args) || typeof args !== 'object') {
            throw new PositionalArgsError();
        }
    }

    async viewFunction(...restArgs: any) {
        if (typeof restArgs[0] === 'string') {
            const contractId = restArgs[0];
            const methodName = restArgs[1];
            const args = restArgs[2];
            const options = restArgs[3];
            return await this.viewFunctionV1(contractId, methodName, args, options);
        } else {
            return await this.viewFunctionV2(restArgs[0]);
        }
    }

    async viewFunctionV1(
        contractId: string,
        methodName: string,
        args: any = {},
        {
            parse = parseJsonFromRawResponse,
            stringify = bytesJsonStringify,
            jsContract = false,
            blockQuery = {finality: 'optimistic'}
        }: {
            parse?: (response: Uint8Array) => any;
            stringify?: (input: any) => Buffer;
            blockQuery?: BlockReference;
            jsContract?: boolean
        } = {}
    ): Promise<any> {
        const deprecate = depd('Account.viewFunction(contractId, methodName, args, options)');
        deprecate('use `Account.viewFunction(ViewFunctionCallOptions)` instead');
        return this.viewFunctionV2({contractId, methodName, args, parse, stringify, jsContract, blockQuery});
    }

    async viewFunctionV2({
                             contractId,
                             methodName,
                             args,
                             parse = parseJsonFromRawResponse,
                             stringify = bytesJsonStringify,
                             jsContract = false,
                             blockQuery = {finality: 'optimistic'}
                         }: ViewFunctionCallOptions): Promise<any> {
        let encodedArgs;

        this.validateArgs(args);

        if (jsContract) {
            encodedArgs = this.encodeJSContractArgs(contractId, methodName, Object.keys(args).length > 0 ? JSON.stringify(args) : '');
        } else {
            encodedArgs = stringify(args);
        }

        const result = await this.connection.provider.query<CodeResult>({
            request_type: 'call_function',
            ...blockQuery,
            account_id: jsContract ? this.connection.jsvmAccountId : contractId,
            method_name: jsContract ? 'view_js_contract' : methodName,
            args_base64: encodedArgs.toString('base64')
        });

        if (result.logs) {
            this.printLogs(contractId, result.logs);
        }

        return result.result && result.result.length > 0 && parse(Buffer.from(result.result));
    }

    async viewState(prefix: string | Uint8Array, blockQuery: BlockReference = {finality: 'optimistic'}): Promise<Array<{
        key: Buffer;
        value: Buffer
    }>> {
        const {values} = await this.connection.provider.query<ViewStateResult>({
            request_type: 'view_state',
            ...blockQuery,
            account_id: this.accountId,
            prefix_base64: Buffer.from(prefix).toString('base64')
        });

        return values.map(({key, value}) => ({
            key: Buffer.from(key, 'base64'),
            value: Buffer.from(value, 'base64')
        }));
    }

    async getAccessKeys(): Promise<AccessKeyInfoView[]> {
        const response = await this.connection.provider.query<AccessKeyList>({
            request_type: 'view_access_key_list',
            account_id: this.accountId,
            finality: 'optimistic'
        });
        if (Array.isArray(response)) {
            return response;
        }
        return response.keys;
    }

    async getAccountDetails(): Promise<{ authorizedApps: AccountAuthorizedApp[] }> {
        // TODO: update the response value to return all the different keys, not just app keys.
        // Also if we need this function, or getAccessKeys is good enough.
        const accessKeys = await this.getAccessKeys();
        const authorizedApps = accessKeys
            .filter(item => item.access_key.permission !== 'FullAccess')
            .map(item => {
                const perm = (item.access_key.permission as FunctionCallPermissionView);
                return {
                    contractId: perm.FunctionCall.receiver_id,
                    amount: perm.FunctionCall.allowance,
                    publicKey: item.public_key,
                };
            });
        return {authorizedApps};
    }

    async getAccountBalance(): Promise<AccountBalance> {
        const protocolConfig = await this.connection.provider.experimental_protocolConfig({finality: 'final'});
        const state = await this.state();

        const costPerByte = new BN(protocolConfig.runtime_config.storage_amount_per_byte);
        const stateStaked = new BN(state.storage_usage).mul(costPerByte);
        const staked = new BN(state.locked);
        const totalBalance = new BN(state.amount).add(staked);
        const availableBalance = totalBalance.sub(BN.max(staked, stateStaked));

        return {
            total: totalBalance.toString(),
            stateStaked: stateStaked.toString(),
            staked: staked.toString(),
            available: availableBalance.toString()
        };
    }
}
