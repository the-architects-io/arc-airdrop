import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ShadowFile, ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PublicKey } from "@metaplex-foundation/js";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  RPC_ENDPOINT,
  SHDW_DRIVE_BASE_URL,
} from "@/constants/constants";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export async function POST(req: NextRequest) {
  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_ASSET_SHDW_DRIVE_ADDRESS
  ) {
    return NextResponse.json(
      {
        error: "Configuration error",
      },
      { status: 500 }
    );
  }

  const formData = await req.formData();

  let formDataFiles: ShadowFile[] = [];
  let amountOfFiles = 0;

  while (true) {
    if (formData.get(`file[${amountOfFiles}]`)) {
      amountOfFiles++;
    } else {
      break;
    }
  }

  const url = formData.get("url") as string;
  const prefix = formData.get("prefix") as string;

  if (url.length) {
    console.log(`fetching ${url}`);
    const file = await fetch(url);
    console.log("converting to buffer");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const name = url.split("/").pop();
    console.log({ name });
    formDataFiles.push({
      name,
      file: fileBuffer,
    });

    amountOfFiles += 1;
  } else {
    const singleFile = formData.get("file") as unknown as File | null;

    if (singleFile) {
      formDataFiles.push({
        name: prefix?.length ? `${prefix}${singleFile.name}` : singleFile.name,
        file: Buffer.from(await singleFile.arrayBuffer()),
      });
    } else {
      for (let i = 0; i < amountOfFiles; i++) {
        const file = formData.get(`file[${i}]`) as unknown as File;
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const shadowFile = {
          name: prefix?.length ? `${prefix}${file.name}` : file.name,
          file: fileBuffer,
        };
        formDataFiles.push(shadowFile);
      }
    }
  }

  const driveAddress = formData.get("driveAddress") as string;
  const overwriteString = formData.get("overwrite") as string;
  const overwrite = !!overwriteString;

  console.log({ overwrite, amountOfFiles });

  if (!formDataFiles || !driveAddress) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(keypair);

    // Always use mainnet
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const drive = await new ShdwDrive(connection, wallet).init();

    if (overwrite) {
      const { keys } = await drive.listObjects(new PublicKey(driveAddress));
      const fileNames = formDataFiles.map((f) => f.name?.replace(prefix, ""));

      const filesToDelete = keys.filter((key) => {
        return fileNames.find((name) => {
          if (prefix?.length) {
            return name === key.replace(prefix, "");
          }
          return name === key;
        });
      });
      console.log({
        keys,
        filesToDelete,
        formDataFiles: formDataFiles.map((f) => f.name),
        prefix,
      });

      // TODO: use editFile instead of deleteFile
      for (const file of filesToDelete) {
        const res = await drive.deleteFile(
          new PublicKey(driveAddress),
          `${SHDW_DRIVE_BASE_URL}/${driveAddress}/${file}`
        );

        console.log({ res });
      }
    }

    const responses = await drive.uploadMultipleFiles(
      new PublicKey(driveAddress),
      formDataFiles
    );

    return NextResponse.json(
      {
        urls: responses.map((r) => r.location),
        count: responses.length,
        successCount: responses.filter((r) => r.status === "Uploaded.").length,
        failedCount: responses.filter((r) => r.status !== "Uploaded.").length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      {
        error: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
