import type {
    AccessKeyWithPublicKey,
    FinalExecutionOutcome,
    NodeStatusResult,
    BlockId,
    BlockReference,
    BlockResult,
    BlockChangeResult,
    ChangeResult,
    ChunkId,
    ChunkResult,
    EpochValidatorInfo,
    ProtocolConfig,
    LightClientProof,
    LightClientProofRequest,
    GasPrice,
    QueryResponseKind
} from './provider';
import {Provider} from './provider';
import {fetchJson} from '../utils/web';
import type {ConnectionInfo} from '../utils/web';
import {TypedError, ErrorContext} from '../utils/errors';
import {baseEncode} from 'borsh';
import exponential_backoff from '../utils/exponential_backoff';
import {parseRpcError} from '../utils/rpc_errors';
import {SignedTransaction} from '../transaction';

/** @hidden */
export {TypedError, ErrorContext};

// Default number of retries before giving up on a request.
const REQUEST_RETRY_NUMBER = 12;

// Default wait until next retry in millis.
const REQUEST_RETRY_WAIT = 500;

// Exponential back off for waiting to retry.
const REQUEST_RETRY_WAIT_BACKOFF = 1.5;

/// Keep ids unique across all connections.
let _nextId = 123;

export class JsonRpcProvider extends Provider {
    /** @hidden */
    readonly connection: ConnectionInfo;

    constructor(connectionInfo: ConnectionInfo) {
        super();
        this.connection = connectionInfo || {url: ''};
    }

    async status(): Promise<NodeStatusResult> {
        return this.sendJsonRpc('status', []);
    }

    async sendTransaction(signedTransaction: SignedTransaction): Promise<FinalExecutionOutcome> {
        const bytes = signedTransaction.encode();
        return this.sendJsonRpc('broadcast_tx_commit', [Buffer.from(bytes).toString('base64')]);
    }

    async sendTransactionAsync(signedTransaction: SignedTransaction): Promise<FinalExecutionOutcome> {
        const bytes = signedTransaction.encode();
        return this.sendJsonRpc('broadcast_tx_async', [Buffer.from(bytes).toString('base64')]);
    }

    async txStatus(txHash: Uint8Array | string, accountId: string): Promise<FinalExecutionOutcome> {
        if (typeof txHash === 'string') {
            return this.txStatusString(txHash, accountId);
        } else {
            return this.txStatusUint8Array(txHash, accountId);
        }
    }

    private async txStatusUint8Array(txHash: Uint8Array, accountId: string): Promise<FinalExecutionOutcome> {
        return this.sendJsonRpc('tx', [baseEncode(txHash), accountId]);
    }

    private async txStatusString(txHash: string, accountId: string): Promise<FinalExecutionOutcome> {
        return this.sendJsonRpc('tx', [txHash, accountId]);
    }

    async txStatusReceipts(txHash: Uint8Array | string, accountId: string): Promise<FinalExecutionOutcome> {
        if (typeof txHash === 'string') {
            return this.sendJsonRpc('EXPERIMENTAL_tx_status', [txHash, accountId]);
        } else {
            return this.sendJsonRpc('EXPERIMENTAL_tx_status', [baseEncode(txHash), accountId]);
        }
    }

    async query<T extends QueryResponseKind>(...args: any[]): Promise<T> {
        let result;
        if (args.length === 1) {
            const {block_id, blockId, ...otherParams} = args[0];
            result = await this.sendJsonRpc<T>('query', {...otherParams, block_id: block_id || blockId});
        } else {
            const [path, data] = args;
            result = await this.sendJsonRpc<T>('query', [path, data]);
        }
        if (result && result.error) {
            throw new TypedError(`Querying failed: ${result.error}.\n${JSON.stringify(result, null, 2)}`, result.error.name);
        }
        return result;
    }

    async block(blockQuery: BlockId | BlockReference): Promise<BlockResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('block', {block_id: blockId, finality});
    }

    async blockChanges(blockQuery: BlockReference): Promise<BlockChangeResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('EXPERIMENTAL_changes_in_block', {block_id: blockId, finality});
    }

    async chunk(chunkId: ChunkId): Promise<ChunkResult> {
        return this.sendJsonRpc('chunk', [chunkId]);
    }

    async validators(blockId: BlockId | null): Promise<EpochValidatorInfo> {
        return this.sendJsonRpc('validators', [blockId]);
    }

    async experimental_protocolConfig(blockReference: BlockReference | {
        sync_checkpoint: 'genesis'
    }): Promise<ProtocolConfig> {
        return await this.sendJsonRpc('EXPERIMENTAL_protocol_config', blockReference);
    }

    async lightClientProof(request: LightClientProofRequest): Promise<LightClientProof> {
        return await this.sendJsonRpc('EXPERIMENTAL_light_client_proof', request);
    }

    async accessKeyChanges(accountIdArray: string[], blockQuery: BlockReference): Promise<ChangeResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('EXPERIMENTAL_changes', {
            changes_type: 'all_access_key_changes',
            account_ids: accountIdArray,
            block_id: blockId,
            finality
        });
    }

    async singleAccessKeyChanges(accessKeyArray: AccessKeyWithPublicKey[], blockQuery: BlockReference): Promise<ChangeResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('EXPERIMENTAL_changes', {
            changes_type: 'single_access_key_changes',
            keys: accessKeyArray,
            block_id: blockId,
            finality
        });
    }

    async accountChanges(accountIdArray: string[], blockQuery: BlockReference): Promise<ChangeResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('EXPERIMENTAL_changes', {
            changes_type: 'account_changes',
            account_ids: accountIdArray,
            block_id: blockId,
            finality
        });
    }

    async contractStateChanges(accountIdArray: string[], blockQuery: BlockReference, keyPrefix = ''): Promise<ChangeResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('EXPERIMENTAL_changes', {
            changes_type: 'data_changes',
            account_ids: accountIdArray,
            key_prefix_base64: keyPrefix,
            block_id: blockId,
            finality
        });
    }

    async contractCodeChanges(accountIdArray: string[], blockQuery: BlockReference): Promise<ChangeResult> {
        const {finality} = blockQuery as any;
        const {blockId} = blockQuery as any;
        return this.sendJsonRpc('EXPERIMENTAL_changes', {
            changes_type: 'contract_code_changes',
            account_ids: accountIdArray,
            block_id: blockId,
            finality
        });
    }

    async gasPrice(blockId: BlockId | null): Promise<GasPrice> {
        return await this.sendJsonRpc('gas_price', [blockId]);
    }

    async sendJsonRpc<T>(method: string, params: object): Promise<T> {
        const response = await exponential_backoff(REQUEST_RETRY_WAIT, REQUEST_RETRY_NUMBER, REQUEST_RETRY_WAIT_BACKOFF, async () => {
            try {
                const request = {
                    method,
                    params,
                    id: (_nextId++),
                    jsonrpc: '2.0'
                };
                const response = await fetchJson(this.connection, JSON.stringify(request));
                if (response.error) {
                    if (typeof response.error.data === 'object') {
                        if (typeof response.error.data.error_message === 'string' && typeof response.error.data.error_type === 'string') {
                            // if error data has error_message and error_type properties, we consider that node returned an error in the old format
                            throw new TypedError(response.error.data.error_message, response.error.data.error_type);
                        }

                        throw parseRpcError(response.error.data);
                    } else {
                        const errorMessage = `[${response.error.code}] ${response.error.message}: ${response.error.data}`;
                        // NOTE: All this hackery is happening because structured errors not implemented
                        if (response.error.data === 'Timeout' || errorMessage.includes('Timeout error')
                            || errorMessage.includes('query has timed out')) {
                            throw new TypedError(errorMessage, 'TimeoutError');
                        }

                        throw new TypedError(errorMessage, response.error.name);
                    }
                }
                // Success when response.error is not exist
                return response;
            } catch (error) {
                if (error.type === 'TimeoutError') {
                    if (!process.env['NO_LOGS']) {
                        console.warn(`Retrying request to ${method} as it has timed out`, params);
                    }
                    return null;
                }

                throw error;
            }
        });
        const {result} = response;
        // From jsonrpc spec:
        // result
        //   This member is REQUIRED on success.
        //   This member MUST NOT exist if there was an error invoking the method.
        if (typeof result === 'undefined') {
            throw new TypedError(
                `Exceeded ${REQUEST_RETRY_NUMBER} attempts for request to ${method}.`, 'RetriesExceeded');
        }
        return result;
    }
}
