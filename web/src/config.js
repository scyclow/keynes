import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'


const INFURA_ID = 'deb04a4c6ec3473591234f198e9e4955'
const CHAIN_ID = 1

export const providerOptions = {
  walletlink: {
    package: WalletLink,
    options: {
      appName: 'KeynesianBeautyContest',
      infuraId: INFURA_ID,
      chainId: CHAIN_ID,
    }
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_ID
    }
  }
};

export const CHAIN = 'rinkeby'

export const contractAddrs = {
  mainnet: {},
  localhost: {
    KBC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    TokenURI: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    BlindAuction: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  },
  rinkeby: {
    KBC: '0x97008EDA4194d7be002D1b22CDd249CcB1169FEa',
    BlindAuction: '0x3C872e8358A353714b42657B4e90c72d0d873dAF',
    TokenURI: '0x1d9925464f2067d84D232Fc7440f957dA0a9412B'
  }
}

export function getActiveContractAddresses() {
  return contractAddrs[CHAIN]
}

export const KBCABI = [
  'function exists(uint tokenId) view returns (bool)',
  'function ownerOf(uint tokenId) view returns (address)',
]

export const BlindAuctionABI = [
  'function hashBid(uint tokenId, uint amount, address bidder) pure returns (bytes32)',

  'function placeSealedBid(bytes32 bidHash) payable',
  'function unsealBid(uint tokenId, uint amount) payable',
  'function claimToken(uint tokenId)',

  'function withdrawSealedBid(bytes32 bidHash)',

  'function auctionPhase() view returns (uint phase)',
  'function hashToSealedBids(bytes32 hash) view returns (tuple(address bidder, uint stake))',
  'function tokenIdToHighestUnsealedBid(uint tokenId) view returns (tuple(address bidder, uint amount))',

  'event CreateBid(bytes32 indexed hash, uint stake, address indexed bidder)',
  'event WithdrawBid(bytes32 indexed hash, address indexed bidder)',
  'event RevealBid(bytes32 indexed hash, uint256 indexed tokenId, uint256 amount, address indexed bidder)',

  'function changeAuctionPhaseBidding()',
  'function changeAuctionPhasePaused()',
  'function changeAuctionPhaseReveal()',
  'function changeAuctionPhaseClaim()',
]


const web3Modal = new Web3Modal({
  network: CHAIN,
  cacheProvider: true,
  providerOptions,
});



export const EthContext = createContext()


export const EthContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contracts, setContracts] = useState(null)
  const [connectedAddress, setConnectedAddress] = useState(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const onConnect = useCallback(async () => {
    const instance = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(instance)
    const signer = provider.getSigner()
    const connectedAddress = await signer.getAddress()
    const contracts = getContracts(CHAIN, provider)

    // const contractCode = await signer.provider.getCode(getActiveContractAddresses().BlindAuction)
    // console.log(contractCode)

    setProvider(provider)
    setConnectedAddress(connectedAddress)
    setSigner(signer)
    setContracts(contracts)
    setConnected(true)
    setLoading(false)
  }, [])

  const onDisconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider()
    setConnectedAddress('')
    setConnected(false)
  }, [])

  useEffect(async () => {
    const { cachedProvider } = web3Modal
    if (cachedProvider) {
      await onConnect()
    }
  }, [])

  return (
    <EthContext.Provider value={{
      provider,
      contracts,
      signer,
      connectedAddress,
      connected,
      onConnect,
      onDisconnect,
      loading
    }}>
      {children}
    </EthContext.Provider>
  )
}


export const getContracts = (chain, provider) => ({
  KBC: new ethers.Contract(getActiveContractAddresses().KBC, KBCABI, provider),
  BlindAuction: new ethers.Contract(getActiveContractAddresses().BlindAuction, BlindAuctionABI, provider),
})

