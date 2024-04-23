import BN from "bn.js"
import * as utiApi from '~js_apis';

interface RPCFunctions {
    setSigner(
        privateKey: string,
        accountId: string,
        networkId: string
    ): Promise<utiApi.Signer>

    createConnection(
        networkId: string,
        url: string,
        signer: utiApi.Signer
    ): Promise<utiApi.Connection>

    setAccount(
        connection: utiApi.Connection,
        accountId: string
    ): Promise<utiApi.Account>

    getGasPrice(connection: utiApi.Connection): Promise<string>

    sendMoney(account: utiApi.Account, toId: string, amount: BN): Promise<[string, number]>

    checkTxStatus(
        connection: utiApi.Connection,
        transactionHash: string,
        senderAccountId: string
    ): Promise<any>

    getAmount(account: utiApi.Account): Promise<string>

    getAccountDetails(account: utiApi.Account): Promise<any>

    checkConnectionStatus(connection: utiApi.Connection): Promise<boolean>
}

const rpcFunctions: RPCFunctions = {
    // 设置签名者
    setSigner: async (
        privateKey,
        accountId,
        networkId
    ) => {
        const keyStore = new utiApi.keyStores.InMemoryKeyStore()
        const keyPair = utiApi.KeyPair.fromString(privateKey)
        await keyStore.setKey(networkId, accountId, keyPair)

        return new utiApi.InMemorySigner(keyStore)
    },
    // 创建rpc连接
    createConnection: async (
        networkId,
        url,
        signer
    ) => {
        return utiApi.Connection.fromConfig({
            networkId: networkId,
            provider: {
                type: "JsonRpcProvider",
                args: {url: url}
            },
            signer: signer
        })
    },
    // 设置account
    setAccount: async (connection, accountId) => {
        return new utiApi.Account(connection, accountId)
    },
    // 获取gas
    getGasPrice: async (connection) => {
        const res = await connection.provider.gasPrice(null)
        return res.gas_price
    },
    // 发送主币
    sendMoney: async (account, toId, amount) => {
        return await account.sendMoney(toId, amount)
    },
    // 确认transaction状态
    checkTxStatus: async (
        connection,
        transactionHash,
        senderAccountId
    ) => {
        const res = await connection.provider
            .txStatus(transactionHash, senderAccountId)
            .catch((e) => {
                console.log(e)
            })
        console.log(res)
        return res
    },
    // 获取账户余额
    getAmount: async (account) => {
        const res = await account.getAccountBalance()
        return res.total
    },
    // 获取账户详情
    getAccountDetails: async (account) => {
        const res = await account.getAccountDetails()
        return res
    },
    // 获取连接状态
    checkConnectionStatus: async (connection) => {
        try {
            const res = await connection.provider.status()
            return res.chain_id === connection.networkId;
        } catch (e) {
            return false
        }

    }
}

export default rpcFunctions
