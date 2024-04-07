import { Storage } from "@plasmohq/storage"

const storage = new Storage({
  area: "local"
})
const TopStorage = {
  // 是否拥有钱包
  hasCreatedWallet: async () => {
    return await storage.get("isfirst")
  },
  // 设置是否拥有钱包
  setHasCreatedWallet: async (isfirst) => {
    await storage.set("isfirst", isfirst)
  },
  // 获取当前的chainId
  getChainId: async () => {
    let chainId = await storage.get("chain_id")
    if (chainId === undefined) {
      chainId = "testnet"
      await storage.set("chain_id", chainId)
    }
    return chainId
  },
  // 设置当前的chainId
  setChainId: async (chainId) => {
    await storage.set("chain_id", chainId)
  },
  // 获取当前的rpcUrl
  getRpcUrl: async () => {
    let rpcUrl = await storage.get("rpcUrl")
    if (rpcUrl === undefined) {
      rpcUrl = "http://43.218.117.150:3030/"
      await storage.set("rpcUrl", rpcUrl)
    }
    return rpcUrl
  },
  // 设置当前的rpcUrl
  setRpcUrl: async (rpcUrl) => {
    await storage.set("rpcUrl", rpcUrl)
  },
  // 获取私钥
  getPrivateKey: async () => {
    return await storage.get("private_key")
  },
  // 设置私钥
  setPrivateKey: async (privateKey) => {
    await storage.set("private_key", privateKey)
  },
  // 获取公钥
  getPublicKey: async () => {
    return await storage.get("public_key")
  },
  // 设置公钥
  setPublicKey: async (publicKey) => {
    await storage.set("public_key", publicKey)
  },
  // 获取地址
  getMyAddress: async () => {
    return await storage.get("my_address")
  },
  // 设置地址
  setMyAddress: async (address) => {
    await storage.set("my_address", address)
  },
  // 获取当前用户信息
  getUserInfo: (key) => {
    try {
      storage.get(key)
    } catch (error) {
      console.error("Error saving to local storage:", error)
    }
  },
  // 设置当前用户信息
  setUserInfo: async (key, value) => {
    try {
      await storage.set(key, value)
    } catch (error) {
      console.error("Error saving to local storage:", error)
    }
  },
  //   获取当前语言
  getCurrentLanguage: async () => {
    let language = await storage.get("current_language")
    if (language === undefined) {
      language = navigator.language.toLowerCase()
      if (language.split("-")[0] === "en") {
        language = "en"
      }
      await storage.set("current_language", language)
    }
    return language
  },
  //   设置当前语言
  setCurrentLanguage: async (language) => {
    await storage.set("current_language", language)
  },
  //   获取助记词
  getMnemonicPhrase: async () => {
    return await storage.get("mnemonic_phrase")
  },
  //   设置助记词
  setMnemonicPhrase: async (mnemonicPhrase) => {
    await storage.set("mnemonic_phrase", mnemonicPhrase)
  },
  // 获取创建时的密码
  getCreatePassword: async () => {
    return await storage.get("create_password")
  },
  // 设置创建时的密码
  setCreatePassword: async (createPassword) => {
    await storage.set("create_password", createPassword)
  },
  // 获取当前用户钱包余额
  getBalance: async () => {
    return await storage.get("balance")
  },
  // 设置当前用户钱包余额
  setBalance: async (balance) => {
    await storage.set("balance", balance)
  },
  // 获取已连接的网站
  getConnectedSites: async () => {
    let connectedSites = await storage.get("connected_sites")
    // 如果 connectedSites 不存在或者不是一个对象，返回一个空对象
    if (typeof connectedSites !== "object" || connectedSites === null) {
      return {}
    }
    // 将 connectedSites 转换为对象
    return connectedSites
  },
  // 增加已连接的网站
  addConnectedSite: async (site, faviconUrl) => {
    let connectedSites = (await storage.get("connected_sites")) || {}
    // 添加新的网站及其小图标到已连接网站对象中
    connectedSites[site] = faviconUrl
    await storage.set("connected_sites", connectedSites)
  },
  // 删除已连接的网站
  deleteConnectedSite: async (site) => {
    let connectedSites = (await storage.get("connected_sites")) || {}
    // 在已连接网站对象中查找并删除指定的网站
    if (site in connectedSites) {
      delete connectedSites[site]
      await storage.set("connected_sites", connectedSites)
    }
  },
  // 查询网站是否连接
  searchConnectedSite: async (site) => {
    let connectedSites = (await storage.get("connected_sites")) || {}
    // 检查指定的网站是否存在于已连接网站对象中
    return site in connectedSites
  },
  //获取转账记录
  getActivityList: async () => {
    const activityList = await storage.get("activity_list")
    if (typeof activityList !== "object" || activityList === null) {
      return {}
    }
    return activityList
  },
  addActivityList: async (hash, object) => {
    const activityList = (await storage.get("activity_list")) || {}
    // activityList.unshift({
    //   hash,
    //   object
    // })
    activityList[hash] = object
    await storage.set("activity_list", activityList)
  },
  deleteActivityList: async (hash) => {
    const activityList = (await storage.get("activity_list")) || {}
    delete activityList[hash]
    await storage.set("activity_list", activityList)
  },
  getActivity: async (hash) => {
    const activityList = (await storage.get("activity_list")) || {}
    return activityList[hash]
  },
  //设置转账记录
  setActivityList: async (activityList) => {
    await storage.set("activity_list", activityList)
  },
  //获取锁定时间
  getLockTime: async () => {
    return await storage.get("lock_time")
  },
  //设置锁定时间
  setLockTime: async (lockTime) => {
    await storage.set("lock_time", lockTime)
  },
  //获取锁定时间的分钟数
  getLockTimeMinute: async () => {
    return await storage.get("lock_time_minute")
  },
  //设置锁定时间的分钟数
  setLockTimeMinute: async (lockTimeMinute) => {
    await storage.set("lock_time_minute", lockTimeMinute)
  }
}
export default TopStorage
