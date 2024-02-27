import {
  BASE_URL,
  NEXT_PUBLIC_ARCHITECTS_COLLECTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { getRpcEndpoint } from "@/utils/rpc";
import { PublicKey } from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  SystemProgram,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";

export const SOL_MINT_ADDRESS = "11111111111111111111111111111111";
export const ARC_TOKEN_MINT_ADDRESS =
  "HJRkFRCfaAQdkCnWucQKtksJXYnCBsY4dTYAT7nKpzTQ";

const handleSolPayment = async ({
  wallet,
  baseAmount,
  cluster,
}: {
  wallet: WalletContextState;
  baseAmount: number;
  cluster: "devnet" | "mainnet-beta";
}) => {
  if (!wallet?.publicKey || !wallet?.signTransaction) {
    return {
      error: "No wallet connected",
    };
  }

  if (!NEXT_PUBLIC_ARCHITECTS_COLLECTION_WALLET_ADDRESS) {
    return {
      error: "Configuration error",
    };
  }

  const connection = new Connection(getRpcEndpoint(cluster));

  const latestBlockhash = await connection.getLatestBlockhash();
  const tx = new Transaction({ ...latestBlockhash });

  tx.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(NEXT_PUBLIC_ARCHITECTS_COLLECTION_WALLET_ADDRESS),
      lamports: baseAmount,
    })
  );

  tx.feePayer = wallet.publicKey;
  let txId;

  try {
    txId = await wallet.sendTransaction(tx, connection);
    console.log({ txId });
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to send transaction",
    };
  }

  return {
    baseAmount,
    payerAddress: wallet?.publicKey?.toBase58(),
    txId,
  };
};

const handleSplPayment = async ({
  wallet,
  mintAddress,
  baseAmount,
  cluster,
}: {
  wallet: WalletContextState;
  mintAddress: string;
  baseAmount: number;
  cluster: "devnet" | "mainnet-beta";
}) => {
  if (!wallet?.publicKey || !wallet?.signTransaction) {
    return {
      error: "No wallet connected",
    };
  }

  if (!NEXT_PUBLIC_ARCHITECTS_COLLECTION_WALLET_ADDRESS) {
    return {
      error: "Configuration error",
    };
  }

  if (!wallet?.publicKey || !wallet?.signTransaction) {
    return {
      error: "No wallet connected",
    };
  }

  const connection = new Connection(getRpcEndpoint(cluster));

  const fromTokenAccountAddress = await getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    wallet?.publicKey,
    undefined,
    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  );

  const toTokenAccountAddress = await getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(NEXT_PUBLIC_ARCHITECTS_COLLECTION_WALLET_ADDRESS),
    undefined,
    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  );

  const receiverAccount = await connection.getAccountInfo(
    toTokenAccountAddress
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  const tx = new Transaction({ ...latestBlockhash });

  const instructions: TransactionInstructionCtorFields[] = [];

  if (!receiverAccount) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // The payer of the creation fee (usually the user's wallet)
        toTokenAccountAddress, // The address of the new associated token account
        new PublicKey(NEXT_PUBLIC_ARCHITECTS_COLLECTION_WALLET_ADDRESS), // The owner of the new account (receiver)
        new PublicKey(mintAddress) // The mint address
      )
    );
  }

  instructions.push(
    createTransferInstruction(
      fromTokenAccountAddress,
      toTokenAccountAddress,
      wallet.publicKey,
      baseAmount,
      [],
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    )
  );

  tx.add(...instructions);

  tx.feePayer = wallet.publicKey;
  let txId;

  try {
    txId = await wallet.sendTransaction(tx, connection);
    console.log({ txId });
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to send transaction",
    };
  }

  return {
    mintAddress,
    baseAmount,
    payerAddress: wallet?.publicKey?.toBase58(),
    txId,
  };
};

export const takePayment = async ({
  wallet,
  mintAddress = SOL_MINT_ADDRESS,
  baseAmount,
  cluster,
}: {
  wallet: WalletContextState;
  mintAddress: string;
  baseAmount: number;
  cluster: "devnet" | "mainnet-beta";
}) => {
  if (mintAddress === SOL_MINT_ADDRESS) {
    return handleSolPayment({
      wallet,
      baseAmount,
      cluster,
    });
  } else {
    return handleSplPayment({
      wallet,
      mintAddress,
      baseAmount,
      cluster,
    });
  }
};
