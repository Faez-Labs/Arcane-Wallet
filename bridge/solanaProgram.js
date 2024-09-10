
import anchor from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58'; // To decode Base58 private key
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config()
// Load the wallet from a Base58 private key

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const base58PrivateKey = process.env.PK_WALLET; 
const wallet = loadWalletFromBase58(base58PrivateKey);
const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
    preflightCommitment: 'processed',
});
const idl = loadIdl('./idl.json');
const programId = new PublicKey('4Qq4FkBT5xEGZgJnswapgjpJmoHWMdw5pzNDpQWksovc');
const program = new anchor.Program(idl, programId, provider);
const fromAccount = wallet.publicKey;
const toAccount = new PublicKey('31Fw2PnjgvdJi1FJNpwz4VBznMoH6ftx3RwjPmovGTD1'); // Receiver's public key
const logAccount = Keypair.generate();

function loadWalletFromBase58(base58Key) {
    const secretKey = bs58.decode(base58Key);
    return Keypair.fromSecretKey(secretKey);
}

function loadIdl(filePath) {
    const idlBuffer = fs.readFileSync(filePath);
    return JSON.parse(idlBuffer);
}

export async function sendSol(amount, receiver) {
    await program.methods
        .sendSolFromCaller(new anchor.BN(amount))
        .accounts({
            from: fromAccount,
            to: new PublicKey(receiver),
            logAccount: logAccount.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .signers([wallet, logAccount])
        .rpc();

    console.log(`Successfully sent ${amount / 1e9} SOL from ${fromAccount} to ${toAccount}`);
}