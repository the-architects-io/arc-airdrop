export const clearLocalStorage = () => {
  const whiteList: string[] = ["publicKey", "userId", "walletName"];

  const allKeys = Object.keys(localStorage);

  for (const key of allKeys) {
    if (!whiteList.includes(key)) {
      localStorage.removeItem(key);
    }
  }
};
