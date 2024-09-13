const CrossFiTestnet = {
    hex: '0x103D',
    name: 'CrossFi Testnet',
    rpcUrl: 'https://rpc.testnet.ms',
    ticker: "XFI"
};

const SepoliaTestnet = {
    hex: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/MfUnA2s_umweRKXbcFGe9jV7a9dEBX5a',
    ticker: "ETH"
};

export const CHAINS_CONFIG = {
    "0x103D": CrossFiTestnet,
    "0xaa36a7": SepoliaTestnet,
};
