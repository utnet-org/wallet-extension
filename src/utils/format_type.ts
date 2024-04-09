const FormatType = {
  //格式化地址
  FormatAddress(address: string): string {
    const abbreviationAddress = `${address.slice(0, 7)}...${address.slice(-5)}`
    return abbreviationAddress
  },
  //格式化金额
  FormatAmount(amount: string): string {
    return (Math.floor((Number(amount) / 10 ** 24) * 10000) / 10000).toFixed(4)
  },
  //格式化手续费
  FormatGasPrice(gasPrice: string): string {
    return (Number(gasPrice) / 10 ** 24).toString()
  }
}

export default FormatType
