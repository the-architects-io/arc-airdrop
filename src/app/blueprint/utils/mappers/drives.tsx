import { formatUnixToDateTime } from "@/utils/date-time";
import { StorageAccountV2 } from "@shadow-drive/sdk";

export const mapShdwDriveAccountsToBlueprintDriveAccounts = (
  accounts: {
    account: StorageAccountV2;
    address: string;
  }[]
) => {
  return accounts.map(({ address, account }) => ({
    address,
    immutable: account.immutable,
    toBeDeleted: account.toBeDeleted,
    deleteRequestEpoch: account.deleteRequestEpoch,
    storage: account.storage,
    owner1: account.owner1,
    accountCounterSeed: account.accountCounterSeed,
    creationTime: account.creationTime,
    createdAtString: formatUnixToDateTime(account.creationTime),
    creationEpoch: account.creationEpoch,
    lastFeeEpoch: account.lastFeeEpoch,
    name: account.identifier,
  }));
};
