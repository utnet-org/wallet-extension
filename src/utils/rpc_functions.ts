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

    sendMoney(account: utiApi.Account, toId: string, amount: BN): Promise<string>

    checkTxStatus(
        connection: utiApi.Connection,
        transactionHash: string,
        senderAccountId: string
    ): Promise<any>

    getAmount(account: utiApi.Account): Promise<string>

    getAccountDetails(account: utiApi.Account): Promise<any>
}

const rpcFunctions: RPCFunctions = {
    // 设置签名者
    setSigner: async (
        privateKey: string,
        accountId: string,
        networkId: string
    ) => {
        const keyStore = new utiApi.keyStores.InMemoryKeyStore()
        const keyPair = utiApi.KeyPair.fromString(privateKey)
        await keyStore.setKey(networkId, accountId, keyPair)

        return new utiApi.InMemorySigner(keyStore)
    },
    // 创建rpc连接
    createConnection: async (
        networkId: string,
        url: string,
        signer: utiApi.Signer
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
    getGasPrice: async (connection: utiApi.Connection) => {
        const res = await connection.provider.gasPrice(null)
        return res.gas_price
    },
    // 发送主币
    sendMoney: async (account: utiApi.Account, toId: string, amount: BN) => {
        return await account.sendMoney(toId, amount)
    },
    // 确认transaction状态
    checkTxStatus: async (
        connection: utiApi.Connection,
        transactionHash: string,
        senderAccountId: string
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
    getAmount: async (account: utiApi.Account) => {
        const res = await account.getAccountBalance()
        return res.total
    },
    // 获取账户详情
    getAccountDetails: async (account: utiApi.Account) => {
        const res = await account.getAccountDetails()
        return res
    }
}

export default rpcFunctions
