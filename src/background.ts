import TopStorage from "~db/user_storage"
import rpcFunctions from "~utils/rpc_functions"

chrome.runtime.onMessage.addListener(
    async function (message, sender, sendResponse) {
        if (message.type === "getCurrentUrl") {
            const currentUrl = sender.tab?.url
            sendResponse({url: currentUrl})
        }

        if (message.type === "checkTxStatus") {
            const signer = await rpcFunctions.setSigner(
                await TopStorage.getPrivateKey(),
                await TopStorage.getMyAddress(),
                await TopStorage.getChainId()
            )
            const connection = await rpcFunctions.createConnection(
                await TopStorage.getChainId(),
                await TopStorage.getRpcUrl(),
                signer
            )
            const account = await rpcFunctions.setAccount(
                connection,
                message.accountId
            )
            console.log("checkTxStatus message:", message)

            const getCheckTxStatus = async () => {
                return await rpcFunctions.checkTxStatus(
                    connection,
                    message.detailsHash,
                    message.accountId
                )
            }
            const pollingGetCheckTxStatus = async () => {
                try {
                    const res = await getCheckTxStatus()
                    if (res && res.final_execution_status === "FINAL") {
                        let activity = await TopStorage.getActivity(message.detailsHash)
                        activity.status = "FINAL"
                        activity.nonce = res.transaction.nonce
                        await TopStorage.addActivityList(message.detailsHash, activity)
                        console.log("activityList:", await TopStorage.getActivityList())
                        return
                    } else {
                        setTimeout(async () => {
                            console.log("ssssssss")

                            await pollingGetCheckTxStatus()
                        }, 5000)
                    }
                } catch (error) {
                    console.error(error)
                }
            }

            await pollingGetCheckTxStatus() // 启动递归调用
        }

        if (message.type === "sendMoney") {
            console.log("sendMoney message:", message)
            const signer = await rpcFunctions.setSigner(
                await TopStorage.getPrivateKey(),
                await TopStorage.getMyAddress(),
                await TopStorage.getChainId()
            )
            const connection = await rpcFunctions.createConnection(
                await TopStorage.getChainId(),
                await TopStorage.getRpcUrl(),
                signer
            )
            const account = await rpcFunctions.setAccount(
                connection,
                message.accountId
            )
            const amount = BigInt(message.sendAmount * 10 ** 24)
            const [detailsHash, nonce] = await rpcFunctions.sendMoney(
                account,
                message.sendAddress,
                amount
            )
            console.log("detailsHash:", detailsHash, " nonce:", nonce)

            if (detailsHash) {
                const newSendActivityItem = {
                    toAddress: message.sendAddress,
                    amount: message.sendAmount,
                    status: "waiting",
                    nonce: nonce
                }
                sendResponse({txHash: detailsHash, nonce: nonce})
                await TopStorage.addActivityList(detailsHash, newSendActivityItem)
            } else {
                return
            }
        }
        if (message.type === "popupClosed") {
            console.log("Received closePlugin message, closing plugin...")
            // 在这里可以执行一些清理或保存操作
            // 例如，关闭插件的页面或执行其他操作
        }
    }
)
// chrome.windows.onRemoved.addListener(async (windowId) => {
//   console.log("ssssssssdahfahgfashgdafhgadsfhgdf")
//   await TopStorage.setLockTime("")
//   await TopStorage.setLockTimeMinute(1000)
//   setInterval(async () => {
//     console.log(`Window ${windowId} closed`)
//   }, 1000)
//   // 这里可以执行一些插件关闭时的逻辑
// })
