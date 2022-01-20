

async function main() {
  const [owner, bidder1, bidder2] = await ethers.getSigners()

  const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
  KBC = await KBCFactory.deploy()
  await KBC.deployed()
  await KBC.connect(owner).mint(owner.address, 0)

  const TokenURIFactory = await ethers.getContractFactory('TokenURI', owner)
  const TokenURI = await TokenURIFactory.deploy(KBC.address)
  await TokenURI.deployed()


  const BlindAuctionFactory = await ethers.getContractFactory('BlindAuction', owner)
  BlindAuction = await BlindAuctionFactory.deploy(KBC.address)
  await BlindAuction.deployed()


  await KBC.connect(owner).setTokenURIPointer(TokenURI.address)
  await KBC.connect(owner).setMintingAddress(BlindAuction.address)
  await BlindAuction.connect(owner).changeAuctionPhaseBidding()

  const baseMetadata = {
    baseImgUrl: 'ipfs://abcd/',
    imgExtension: '.jpeg',
    baseExternalUrl: 'https://keynesian.beauty/',
    license: 'CC BY-NC 4.0',
  }
  await TokenURI.connect(owner).setBaseMetadata(
    baseMetadata.baseImgUrl,
    baseMetadata.imgExtension,
    baseMetadata.baseExternalUrl,
    baseMetadata.license,
  )

  await TokenURI.connect(owner).batchSetTokenMetadata(
    [0, 1, 2, 3, 4, 5],
    [
      'Alice',
      'Betty',
      'Catherine',
      'Diane',
      'Eve',
      'Fionna'
    ],
    [
      'Her favorite movie is based on what she thinks your favorite movie is',
      'Interned at the RAND corporation in high school',
      'Dressed as a pirate for the last seven halloweens',
      'Prefers to meet friends under the clock at Grand Central at noon',
      'Thinks Austrian business cycle theory is overrated',
      'Prefers tullips over roses'
    ]
  )

  console.log(`KBC:`, KBC.address)
  console.log(`BlindAuction:`, BlindAuction.address)
  console.log(`TokenURI:`, TokenURI.address)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });