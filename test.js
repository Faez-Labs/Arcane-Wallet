import { Secp256k1HdWallet } from"@cosmjs/proto-signing";

async function createWallet() {
    const mnemonic = "soap taste cluster render violin piece wait found video rice calm weird";
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "crossfi",
    });
    const [firstAccount] = await wallet.getAccounts();
    console.log("Address:", firstAccount.address);
}

createWallet();
