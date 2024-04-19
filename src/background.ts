import TopStorage from "~db/user_storage"
import rpcFunctions from "~utils/rpc_functions"

chrome.runtime.onMessage.addListener(
  async function (message, sender, sendResponse) {
    if (message.type === "getCurrentUrl") {
      const currentUrl = sender.tab?.url
      sendResponse({ url: currentUrl })
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
            sendResponse({ status: "FINAL" })
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
        sendResponse({ txHash: detailsHash, nonce: nonce })
        await TopStorage.addActivityList(detailsHash, newSendActivityItem)
      } else {
        return
      }
    }
  }
)
chrome.runtime.onConnect.addListener((port) => {
  // 监听连接断开事件
  port.onDisconnect.addListener(async () => {
    // 调用方法，插件页面关闭时执行
    console.log("插件页面已关闭")
    const lockStatus = await TopStorage.getLockStatus()
    const lockTimeMinute = await TopStorage.getLockTimeMinute()
    console.log("lockTimeMinute", lockTimeMinute)
    if (!!lockStatus) {
      return
    }
    if (
      lockTimeMinute === undefined ||
      lockTimeMinute === null ||
      lockTimeMinute === "" ||
      lockTimeMinute === "0"
    ) {
      await TopStorage.setLockTime("")
    } else {
      const nowTime = new Date().getTime()
      const newLockTime = nowTime + Number(lockTimeMinute) * 60 * 1000
      console.log("newLockTime", new Date(newLockTime))
      await TopStorage.setLockTime(newLockTime)
    }
  })
})
