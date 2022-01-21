const { expect } = require("chai")
const { time } = require('@openzeppelin/test-helpers');

const expectFailure = async (fn, err='') => {
  let failure
  try {
    await fn()
  } catch (e) {
    failure = e
  }
  expect(failure?.message || '').to.include(err)
}

const num = n => Number(ethers.utils.formatEther(n))
const uint = n => Number(n)
const parseMetadata = metadata => JSON.parse(Buffer.from(metadata.split(',')[1], 'base64').toString('utf-8'))


describe('KeynesianBeautyContest Base', () => {
  describe('minting', () => {
    it('should work', async () => {
      const [
        _, __,
        owner,
        notOwner,
        ...signers
      ] = await ethers.getSigners()
      const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
      const KBC = await KBCFactory.deploy()
      await KBC.deployed()

      await KBC.connect(owner).mint(owner.address, 0)
      await KBC.connect(owner).mint(owner.address, 1)
      await KBC.connect(owner).mint(notOwner.address, 2)

      expect(await KBC.connect(owner).exists(0)).to.equal(true)
      expect(await KBC.connect(owner).exists(1)).to.equal(true)
      expect(await KBC.connect(owner).exists(2)).to.equal(true)
      expect(await KBC.connect(owner).exists(3)).to.equal(false)


      await expectFailure(() =>
        KBC.connect(notOwner).mint(notOwner.address, 3),
        'Caller is not the minting address'
      )

      for (let id=3; id<100; id++) {
        await KBC.connect(owner).mint(owner.address, id)
      }

      await expectFailure(() =>
        KBC.connect(owner).mint(owner.address, 99),
        'ERC721: token already minted'
      )

      await expectFailure(() =>
        KBC.connect(owner).mint(owner.address, -1)
      )

      await expectFailure(() =>
        KBC.connect(owner).mint(notOwner.address, 100),
        'Invalid tokenId'
      )

      expect(await KBC.connect(owner).exists(3)).to.equal(true)
      expect(await KBC.connect(owner).exists(3)).to.equal(true)
      expect(await KBC.connect(owner).exists(100)).to.equal(false)

      expect(await KBC.connect(owner).totalSupply()).to.equal(100)
      expect(await KBC.connect(owner).ownerOf(0)).to.equal(owner.address)
      expect(await KBC.connect(owner).ownerOf(1)).to.equal(owner.address)
      expect(await KBC.connect(owner).ownerOf(2)).to.equal(notOwner.address)
      expect(await KBC.connect(owner).balanceOf(owner.address)).to.equal(99)
      expect(await KBC.connect(owner).balanceOf(notOwner.address)).to.equal(1)
    })
  })

  describe('setRoyaltyInfo', () => {
    it('should work', async () => {
      const [
        _, __,
        owner,
        notOwner,
        ...signers
      ] = await ethers.getSigners()
      const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
      const KBC = await KBCFactory.deploy()
      await KBC.deployed()

      const ONE_ETH = ethers.utils.parseEther('1')

      const royaltyInfo0 = await KBC.connect(owner).royaltyInfo(0, ONE_ETH)

      expect(royaltyInfo0[0]).to.equal(owner.address)
      expect(num(royaltyInfo0[1])).to.equal(0.1)

      await KBC.connect(owner).setRoyaltyInfo(notOwner.address, 500)
      const royaltyInfo1 = await KBC.connect(owner).royaltyInfo(0, ONE_ETH)
      expect(royaltyInfo1[0]).to.equal(notOwner.address)
      expect(num(royaltyInfo1[1])).to.equal(0.05)

      await expectFailure(() =>
        KBC.connect(notOwner).setRoyaltyInfo(owner.address, 1),
        'Ownable'
      )
    })
  })

  describe('events', () => {
    it('events should work', async () => {
      const [
        _, __,
        owner,
        tokenHolder1,
        tokenHolder2,
        ...signers
      ] = await ethers.getSigners()
      const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
      const KBC = await KBCFactory.deploy()
      await KBC.deployed()

      await KBC.connect(owner).mint(owner.address, 0)
      await KBC.connect(owner).mint(tokenHolder1.address, 1)
      await KBC.connect(owner).mint(tokenHolder2.address, 2)

      await KBC.connect(owner).emitProjectEvent('projectGreeting', 'Hello project')
      await KBC.connect(owner).emitTokenEvent(1, 'tokenGreeting', 'Hello token 1')
      await KBC.connect(owner).emitTokenEvent(2, 'tokenGreeting', 'Hello token 2')
      await KBC.connect(tokenHolder1).emitTokenEvent(1, 'tokenGreeting', 'Hello token 1 holder')
      await KBC.connect(tokenHolder2).emitTokenEvent(2, 'tokenGreeting', 'Hello token 2 holder')

      await expectFailure(() =>
        KBC.connect(tokenHolder2).emitProjectEvent('projectGreeting', 'wrong project event'),
        'Ownable:'
      )
      await expectFailure(() =>
        KBC.connect(tokenHolder2).emitTokenEvent(1, 'tokenGreeting', 'wrong token event'),
        'Only project or token owner can emit token event'
      )
    })
  })
})

describe('TokenURI', () => {
  it('metadata should work', async () => {
    const [
      _, __,
      owner,
      notOwner,
      ...signers
    ] = await ethers.getSigners()
    const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
    const KBC = await KBCFactory.deploy()
    await KBC.deployed()

    const TokenURIFactory = await ethers.getContractFactory('TokenURI', owner)
    const TokenURI = await TokenURIFactory.deploy(KBC.address)
    await TokenURI.deployed()

    await KBC.connect(owner).setTokenURIPointer(TokenURI.address)
    await expectFailure(() =>
      KBC.connect(notOwner).setTokenURIPointer(KBC.address),
      'Ownable'

    )

    await KBC.connect(owner).mint(owner.address, 0)
    await KBC.connect(owner).mint(owner.address, 1)
    await KBC.connect(owner).mint(owner.address, 2)
    await KBC.connect(owner).mint(owner.address, 3)
    await KBC.connect(owner).mint(owner.address, 4)
    await KBC.connect(owner).mint(owner.address, 5)

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

    await TokenURI.connect(owner).setTokenMetadata(
      0,
      'Alice',
      'Her favorite movie is based on what she thinks your favorite movie is'
    )

    await TokenURI.connect(owner).batchSetTokenMetadata(
      [1, 2, 3, 4, 5],
      [
        'Betty',
        'Catherine',
        'Diane',
        'Eve',
        'Fionna'
      ],
      [
        'Interned at the RAND corporation in high school',
        'Dressed as a pirate for the last seven halloweens',
        'Prefers to meet friends under the clock at Grand Central at noon',
        'Thinks Austrian business cycle theory is overrated',
        'Prefers tullips over roses'
      ]
    )

    const metadata0 = await KBC.connect(owner).tokenURI(0)
    expect(parseMetadata(metadata0)).to.deep.equal({
      name: 'Alice',
      description: 'Her favorite movie is based on what she thinks your favorite movie is',
      image: baseMetadata.baseImgUrl + '0' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '0',
      license: baseMetadata.license
    })

    const metadata1 = await KBC.connect(owner).tokenURI(1)
    expect(parseMetadata(metadata1)).to.deep.equal({
      name: 'Betty',
      description: 'Interned at the RAND corporation in high school',
      image: baseMetadata.baseImgUrl + '1' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '1',
      license: baseMetadata.license
    })

    const metadata2 = await KBC.connect(owner).tokenURI(2)
    expect(parseMetadata(metadata2)).to.deep.equal({
      name: 'Catherine',
      description: 'Dressed as a pirate for the last seven halloweens',
      image: baseMetadata.baseImgUrl + '2' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '2',
      license: baseMetadata.license
    })


    const metadata3 = await KBC.connect(owner).tokenURI(3)
    expect(parseMetadata(metadata3)).to.deep.equal({
      name: 'Diane',
      description: 'Prefers to meet friends under the clock at Grand Central at noon',
      image: baseMetadata.baseImgUrl + '3' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '3',
      license: baseMetadata.license
    })


    const metadata4 = await KBC.connect(owner).tokenURI(4)
    expect(parseMetadata(metadata4)).to.deep.equal({
      name: 'Eve',
      description: 'Thinks Austrian business cycle theory is overrated',
      image: baseMetadata.baseImgUrl + '4' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '4',
      license: baseMetadata.license
    })


    const metadata5 = await KBC.connect(owner).tokenURI(5)
    expect(parseMetadata(metadata5)).to.deep.equal({
      name: 'Fionna',
      description: 'Prefers tullips over roses',
      image: baseMetadata.baseImgUrl + '5' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '5',
      license: baseMetadata.license
    })


    const updatedMetadata = {
      baseImgUrl: 'img.com/',
      imgExtension: '.png',
      baseExternalUrl: 'https://steviep.xyz/',
      license: 'CC0',
    }
    await TokenURI.connect(owner).setBaseMetadata(
      updatedMetadata.baseImgUrl,
      updatedMetadata.imgExtension,
      updatedMetadata.baseExternalUrl,
      updatedMetadata.license,
    )

    await TokenURI.connect(owner).setTokenMetadata(
      0,
      'Grace',
      'Prefers to be conspicuous in her consumption'
    )

    const metadata0_1 = await KBC.connect(owner).tokenURI(0)
    expect(parseMetadata(metadata0_1)).to.deep.equal({
      name: 'Grace',
      description: 'Prefers to be conspicuous in her consumption',
      image: updatedMetadata.baseImgUrl + '0' + updatedMetadata.imgExtension,
      external_url: updatedMetadata.baseExternalUrl + '0',
      license: updatedMetadata.license
    })

    const metadata1_1 = await KBC.connect(owner).tokenURI(1)
    expect(parseMetadata(metadata1_1)).to.deep.equal({
      name: 'Betty',
      description: 'Interned at the RAND corporation in high school',
      image: updatedMetadata.baseImgUrl + '1' + updatedMetadata.imgExtension,
      external_url: updatedMetadata.baseExternalUrl + '1',
      license: updatedMetadata.license
    })

    await expectFailure(() =>
      TokenURI.connect(notOwner).setBaseMetadata(
        'google.com/',
        '.svg',
        'vonmisesinstitute.com/',
        'MIT',
      ),
      'Ownable:'
    )

    await expectFailure(() =>
      TokenURI.connect(notOwner).setTokenMetadata(
        0,
        'Bob',
        'Bob likes Hayek'
      ),
      'Ownable:'
    )

    await expectFailure(() =>
      TokenURI.connect(notOwner).batchSetTokenMetadata([1], ['Charlie'], ['Charlie likes von mises']),
      'Ownable'
    )
  })

  it('metadata gas test', async () => {
    const [
      _, __,
      owner,
      notOwner,
      ...signers
    ] = await ethers.getSigners()
    const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
    const KBC = await KBCFactory.deploy()
    await KBC.deployed()

    const TokenURIFactory = await ethers.getContractFactory('TokenURI', owner)
    const TokenURI = await TokenURIFactory.deploy(KBC.address)
    await TokenURI.deployed()

    await KBC.connect(owner).setTokenURIPointer(TokenURI.address)

    const name = 'XXXXXXXXXXXX'
    const description = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    const batchedIds = []
    const batchedNames = []
    const batchedDescriptions = []

    for (let i=0; i<100; i++) {
      await TokenURI.connect(owner).setTokenMetadata(
        i,
        name,
        description
      )

      batchedIds.push(100+i)
      batchedNames.push(name)
      batchedDescriptions.push(description)
    }

    await TokenURI.connect(owner).batchSetTokenMetadata(batchedIds, batchedNames, batchedDescriptions)
  })
})

describe('BlindAuction', () => {
  const stakeValue = ethers.utils.parseEther('0.2')
  const highBidValue = ethers.utils.parseEther('0.5')
  const lowBidValue = ethers.utils.parseEther('0.1')
  const lowerBidValue = ethers.utils.parseEther('0.05')
  const payableEth = { value: stakeValue }
  const zeroAddress = '0x0000000000000000000000000000000000000000'

  let owner, bidder1, bidder2, KBC, BlindAuction
  beforeEach(async () => {
    const signers = await ethers.getSigners()
    owner = signers[2]
    bidder1 = signers[3]
    bidder2 = signers[4]

    const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
    KBC = await KBCFactory.deploy()

    await KBC.deployed()

    const BlindAuctionFactory = await ethers.getContractFactory('BlindAuction', owner)
    BlindAuction = await BlindAuctionFactory.deploy(KBC.address)

    await BlindAuction.deployed()

    await KBC.connect(owner).setMintingAddress(BlindAuction.address)

    await BlindAuction.connect(owner).changeAuctionPhaseBidding()
  })

  describe('placeSealedBid', () => {
    it('should work', async () => {
      const startingBidderBalance = num(await bidder1.getBalance())

      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

      const endingBidderBalance = num(await bidder1.getBalance())
      const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

      expect(startingBidderBalance - endingBidderBalance).to.be.closeTo(0.2, 0.01)
      expect(sealedBid.bidder).to.equal(bidder1.address)
      expect(sealedBid.stake).to.equal(stakeValue)
    })

    it('should not work if collateral is too low', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, {
          value: ethers.utils.parseEther('0.19')
        }, 'Collateral not high enough')
      )
    })

    it('should not work if hash already exists', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth),
        'Hash for sealed bid already exists'
      )

      await expectFailure(() =>
        BlindAuction.connect(bidder2).placeSealedBid(bidHash, payableEth),
        'Hash for sealed bid already exists'
      )
    })

    it('should only work in the bidding phase', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)


      await BlindAuction.connect(owner).changeAuctionPhasePaused()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth),
        'Bid can only be created in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth),
        'Bid can only be created in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionPhaseClaim()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth),
        'Bid can only be created in the BIDDING phase'
      )
    })
  })

  describe('withdrawSealedBid', () => {
    it('should work', async () => {
      const startingBidderBalance = num(await bidder1.getBalance())

      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await BlindAuction.connect(bidder1).withdrawSealedBid(bidHash)


      const endingBidderBalance = num(await bidder1.getBalance())

      const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

      expect(startingBidderBalance).to.be.closeTo(endingBidderBalance, 0.01)
      expect(sealedBid.bidder).to.equal(zeroAddress)
      expect(sealedBid.stake).to.equal(0)
    })

    it('should work with higher stakes', async () => {
      const startingBidderBalance = num(await bidder1.getBalance())

      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, { value: highBidValue })
      await BlindAuction.connect(bidder1).withdrawSealedBid(bidHash)


      const endingBidderBalance = num(await bidder1.getBalance())

      const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

      expect(startingBidderBalance).to.be.closeTo(endingBidderBalance, 0.01)
      expect(sealedBid.bidder).to.equal(zeroAddress)
      expect(sealedBid.stake).to.equal(0)
    })

    it('should not work for wrong bidder', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await expectFailure(() =>
        BlindAuction.connect(bidder2).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn by the bidder'
      )
    })


    it('should not work on an already withdrawn bid', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await BlindAuction.connect(bidder1).withdrawSealedBid(bidHash)

      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid does not exist'
      )

      await expectFailure(() =>
        BlindAuction.connect(bidder2).withdrawSealedBid(bidHash),
        'Bid does not exist'
      )
    })

    it('should only work in the BIDDING phase', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

      await BlindAuction.connect(owner).changeAuctionPhasePaused()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionPhaseClaim()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn in the BIDDING phase'
      )
    })

    // TODO
    xit('should not allow reentry', async () => {})
  })

  // describe('updateSealedBid', () => {
  //   it('should work', async () => {

  //     const oldBidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
  //     const newBidHash = await BlindAuction.connect(bidder1).hashBid(0, highBidValue, bidder1.address)

  //     await BlindAuction.connect(bidder1).placeSealedBid(oldBidHash, payableEth)

  //     const startingBidderBalance = num(await bidder1.getBalance())
  //     await BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, newBidHash)
  //     const endingBidderBalance = num(await bidder1.getBalance())


  //     const oldSealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(oldBidHash)
  //     const newSealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(newBidHash)

  //     expect(oldSealedBid.bidder).to.equal(zeroAddress)
  //     expect(oldSealedBid.stake).to.equal(0)

  //     expect(newSealedBid.bidder).to.equal(bidder1.address)
  //     expect(newSealedBid.stake).to.equal(stakeValue)

  //     expect(startingBidderBalance).to.be.closeTo(endingBidderBalance, 0.01)
  //   })

  //   it('oldBid should not work for wrong bidder', async () => {
  //     const oldBidHash1 = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
  //     const newBidHash1 = await BlindAuction.connect(bidder1).hashBid(0, highBidValue, bidder1.address)

  //     const newBidHash2 = await BlindAuction.connect(bidder2).hashBid(0, highBidValue, bidder2.address)

  //     await BlindAuction.connect(bidder1).placeSealedBid(oldBidHash1, payableEth)

  //     await expectFailure(() =>
  //       BlindAuction.connect(bidder2).updateSealedBid(oldBidHash1, newBidHash2),
  //       'Bid can only be withdrawn by the bidder'
  //     )
  //   })

  //   it('oldBid cannot be innactive', async () => {
  //     const oldBidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
  //     const firstNewBidHash = await BlindAuction.connect(bidder1).hashBid(0, highBidValue, bidder1.address)
  //     const secondNewBidHash = await BlindAuction.connect(bidder1).hashBid(0, lowerBidValue, bidder1.address)


  //     await BlindAuction.connect(bidder1).placeSealedBid(oldBidHash, payableEth)
  //     await BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, firstNewBidHash)

  //     await expectFailure(() =>
  //       BlindAuction.connect(bidder2).updateSealedBid(oldBidHash, secondNewBidHash),
  //       'Bid does not exist'
  //     )
  //   })

  //   it('newBid hash cannot already exist', async () => {
  //     const oldBidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

  //     const newBidHash = await BlindAuction.connect(bidder2).hashBid(0, lowerBidValue, bidder1.address)


  //     await BlindAuction.connect(bidder1).placeSealedBid(oldBidHash, payableEth)
  //     await BlindAuction.connect(bidder2).placeSealedBid(newBidHash, payableEth)

  //     await expectFailure(() =>
  //       BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, newBidHash),
  //       'Hash for sealed bid already exists'
  //     )
  //   })

  //   it('should only work in the BIDDING phase', async () => {
  //     const oldBidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)

  //     const newBidHash = await BlindAuction.connect(bidder2).hashBid(0, lowerBidValue, bidder1.address)


  //     await BlindAuction.connect(bidder1).placeSealedBid(oldBidHash, payableEth)
  //     await BlindAuction.connect(owner).changeAuctionPhasePaused()
  //     await expectFailure(() =>
  //       BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, newBidHash),
  //       'Bid can only be withdrawn in the BIDDING phase'
  //     )

  //     await BlindAuction.connect(owner).changeAuctionPhaseReveal()
  //     await expectFailure(() =>
  //       BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, newBidHash),
  //       'Bid can only be withdrawn in the BIDDING phase'
  //     )

  //     await BlindAuction.connect(owner).changeAuctionPhaseClaim()
  //     await expectFailure(() =>
  //       BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, newBidHash),
  //       'Bid can only be withdrawn in the BIDDING phase'
  //     )

  //   })
  // })

  describe('unsealBid', () => {
    describe('no current bids', () => {
      it('should reveal the bid', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())
        const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

        expect(startingBidderBalance - endingBidderBalance).to.be.closeTo(0.1, 0.01) // stake refund (0.2), less the bid (0.1)
        expect(sealedBid.bidder).to.equal(zeroAddress)
        expect(sealedBid.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder1.address)
        expect(highestUnsealedBid.amount).to.equal(lowBidValue)
      })

      it('should refund if tokenId is invalid', async () => {
        const invalidTokenId = 100
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(invalidTokenId, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder1).unsealBid(invalidTokenId, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())
        const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

        expect(startingBidderBalance).to.be.closeTo(endingBidderBalance, 0.01)
        expect(sealedBid.bidder).to.equal(zeroAddress)
        expect(sealedBid.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(invalidTokenId)
        expect(highestUnsealedBid.bidder).to.equal(zeroAddress)
        expect(highestUnsealedBid.amount).to.equal(0)
      })

      it('should refund if tokenId has already been minted', async () => {
        await KBC.connect(owner).setMintingAddress(owner.address)
        await KBC.connect(owner).mint(owner.address, 0)
        await KBC.connect(owner).setMintingAddress(BlindAuction.address)

        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())
        const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

        expect(startingBidderBalance).to.be.closeTo(endingBidderBalance, 0.01) // stake refund (0.2), less the bid (0.1)
        expect(sealedBid.bidder).to.equal(zeroAddress)
        expect(sealedBid.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(zeroAddress)
        expect(highestUnsealedBid.amount).to.equal(0)
      })

      it('should not work on inactive bids', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
        await BlindAuction.connect(bidder1).withdrawSealedBid(bidHash)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bid must be active to be unsealed'
        )
      })

      it('should not work on already unsealed bids', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()

        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bid must be active to be unsealed'
        )
      })

      it('should not work if amount is incorrect', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, ethers.utils.parseEther('0.001')),
          'Bid must be active to be unsealed'
        )

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, ethers.utils.parseEther('10')),
          'Bid must be active to be unsealed'
        )
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, -1),
          ''
        )
      })

      it('should not work if tokenId is incorrect', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(1, lowBidValue),
          'Bid must be active to be unsealed'
        )
      })

      it('should only work in the reveal phase', async () => {
        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhasePaused()
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bids can only be unsealed in the REVEAL phase'
        )

        await BlindAuction.connect(owner).changeAuctionPhaseBidding()
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bids can only be unsealed in the REVEAL phase'
        )

        await BlindAuction.connect(owner).changeAuctionPhaseClaim()
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bids can only be unsealed in the REVEAL phase'
        )
      })
    })

    describe('existing higher bidder', () => {
      it('should refund bidder their full stake', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash1 = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        const bidHash2 = await BlindAuction.connect(bidder2).hashBid(0, highBidValue, bidder2.address)

        await BlindAuction.connect(bidder1).placeSealedBid(bidHash1, payableEth)
        await BlindAuction.connect(bidder2).placeSealedBid(bidHash2, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder2).unsealBid(0, highBidValue, { value: ethers.utils.parseEther('0.3') })
        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())

        const sealedBid1 = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash1)
        expect(startingBidderBalance).to.be.closeTo(endingBidderBalance, 0.01) // full stake refund (0.2)
        expect(sealedBid1.bidder).to.equal(zeroAddress)
        expect(sealedBid1.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder2.address)
        expect(highestUnsealedBid.amount).to.equal(highBidValue)
      })
    })

    describe('overtaking the highest bidder', () => {
      it('should partially refund the bidder if they bid less than the collateral', async () => {
        const bidHash1 = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        const bidHash2 = await BlindAuction.connect(bidder2).hashBid(0, lowerBidValue, bidder2.address)

        await BlindAuction.connect(bidder1).placeSealedBid(bidHash1, payableEth)
        await BlindAuction.connect(bidder2).placeSealedBid(bidHash2, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder2).unsealBid(0, lowerBidValue)

        const startingBidder1Balance = num(await bidder1.getBalance())
        const startingBidder2Balance = num(await bidder2.getBalance())

        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidder1Balance = num(await bidder1.getBalance())
        const endingBidder2Balance = num(await bidder2.getBalance())

        expect(endingBidder2Balance - startingBidder2Balance).to.be.closeTo(0.05, 0.01) // gets their money back
        expect(endingBidder1Balance - startingBidder1Balance).to.be.closeTo(0.1, 0.01) //  get the diff between their bid + their stake back

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder1.address)
        expect(highestUnsealedBid.amount).to.equal(lowBidValue)
      })

      it('should require more money to unseal if bid is higher than collateral', async () => {
        const bidHash1 = await BlindAuction.connect(bidder1).hashBid(0, highBidValue, bidder1.address)
        const bidHash2 = await BlindAuction.connect(bidder2).hashBid(0, lowerBidValue, bidder2.address)

        await BlindAuction.connect(bidder1).placeSealedBid(bidHash1, payableEth)
        await BlindAuction.connect(bidder2).placeSealedBid(bidHash2, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder2).unsealBid(0, lowerBidValue)

        const startingBidder1Balance = num(await bidder1.getBalance())

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, highBidValue, { value: ethers.utils.parseEther('0.29999') }),
          'Updated stake not enough to support bid'
        )

        await BlindAuction.connect(bidder1).unsealBid(0, highBidValue, { value: ethers.utils.parseEther('0.3') })

        const endingBidder1Balance = num(await bidder1.getBalance())

        expect(startingBidder1Balance - endingBidder1Balance).to.be.closeTo(0.3, 0.01)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder1.address)
        expect(highestUnsealedBid.amount).to.equal(highBidValue)
      })

      // TODO
      xit('should not allow reentry', async () => {})
    })

    describe('matching the highest bidder', () => {
      it('should behave as if bid is lower', async () => {
        const bidHash1 = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        const bidHash2 = await BlindAuction.connect(bidder2).hashBid(0, lowBidValue, bidder2.address)

        await BlindAuction.connect(bidder1).placeSealedBid(bidHash1, payableEth)
        await BlindAuction.connect(bidder2).placeSealedBid(bidHash2, payableEth)

        await BlindAuction.connect(owner).changeAuctionPhaseReveal()
        await BlindAuction.connect(bidder2).unsealBid(0, lowBidValue)

        const startingBidder1Balance = num(await bidder1.getBalance())

        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidder1Balance = num(await bidder1.getBalance())


        expect(endingBidder1Balance - startingBidder1Balance).to.be.closeTo(0.2, 0.01) // they get their entire stake back

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder2.address)
        expect(highestUnsealedBid.amount).to.equal(lowBidValue)
      })
    })
  })

  describe('claimToken', () => {
    it('should mint the token', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)
      await BlindAuction.connect(owner).changeAuctionPhaseClaim()
      await BlindAuction.connect(bidder1).claimToken(0)

      expect(await KBC.connect(bidder1).balanceOf(bidder1.address)).to.equal(1)
      expect(await KBC.connect(bidder1).ownerOf(0)).to.equal(bidder1.address)
    })

    it('cannot be claimed twice', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)
      await BlindAuction.connect(owner).changeAuctionPhaseClaim()
      await BlindAuction.connect(bidder1).claimToken(0)

      await expectFailure(() =>
        BlindAuction.connect(bidder1).claimToken(0),
        'Token has already been claimed'
      )
    })

    it('should only work in the CLAIM phase', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

      await BlindAuction.connect(owner).changeAuctionPhasePaused()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).claimToken(0),
        'Tokens can only be claimed in the CLAIM phase'
      )

      await BlindAuction.connect(owner).changeAuctionPhaseBidding()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).claimToken(0),
        'Tokens can only be claimed in the CLAIM phase'
      )

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).claimToken(0),
        'Tokens can only be claimed in the CLAIM phase'
      )
    })

    it('can only be claimed by the tokens highest bidder', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      const bidHash2 = await BlindAuction.connect(bidder2).hashBid(0, lowerBidValue, bidder2.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await BlindAuction.connect(bidder2).placeSealedBid(bidHash2, payableEth)

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)
      await BlindAuction.connect(bidder2).unsealBid(0, lowerBidValue)

      await BlindAuction.connect(owner).changeAuctionPhaseClaim()

      await expectFailure(() =>
        BlindAuction.connect(bidder2).claimToken(0),
        'Token can only be claimed by highest bidder for token'
      )
    })
  })

  describe('withdrawBids', () => {
    it('should withdraw eth', async () => {
      const bidHash1 = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      const bidHash2 = await BlindAuction.connect(bidder1).hashBid(1, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash1, payableEth)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash2, payableEth)

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)
      await BlindAuction.connect(bidder1).unsealBid(1, lowBidValue)
      await BlindAuction.connect(owner).changeAuctionPhaseClaim()

      const startingOwnerBalance = num(await owner.getBalance())
      await BlindAuction.connect(owner).withdrawBids()
      const endingOwnerBalance = num(await owner.getBalance())

      expect(endingOwnerBalance - startingOwnerBalance).to.be.closeTo(0.2, 0.001)
    })

    it('should only allow the owner to withdraw', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)
      await BlindAuction.connect(owner).changeAuctionPhaseClaim()

      await expectFailure(() =>
        BlindAuction.connect(bidder2).withdrawBids(),
        'Ownable:'
      )
    })

    it('should only work in the claim phase', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

      await expectFailure(() =>
        BlindAuction.connect(owner).withdrawBids(),
        'Funds can only be withdrawn in the CLAIM phase'
      )
    })

  })

  describe('changeAuctionPhase', () => {
    it('changes the auction phase', async () => {
      await BlindAuction.connect(owner).changeAuctionPhasePaused()
      const auctionPhase0 = await BlindAuction.connect(bidder1).auctionPhase()

      await BlindAuction.connect(owner).changeAuctionPhaseBidding()
      const auctionPhase1 = await BlindAuction.connect(bidder1).auctionPhase()

      await BlindAuction.connect(owner).changeAuctionPhaseReveal()
      const auctionPhase2 = await BlindAuction.connect(bidder1).auctionPhase()

      await BlindAuction.connect(owner).changeAuctionPhaseClaim()
      const auctionPhase3 = await BlindAuction.connect(bidder1).auctionPhase()

      expect(auctionPhase0).to.equal(0)
      expect(auctionPhase1).to.equal(1)
      expect(auctionPhase2).to.equal(2)
      expect(auctionPhase3).to.equal(3)
    })

    it('only the owner can change the phase', async () => {
      await expectFailure(() =>
        BlindAuction.connect(bidder1).changeAuctionPhasePaused(),
        'Ownable:'
      )

      await expectFailure(() =>
        BlindAuction.connect(bidder1).changeAuctionPhaseBidding(),
        'Ownable:'
      )

      await expectFailure(() =>
        BlindAuction.connect(bidder1).changeAuctionPhaseReveal(),
        'Ownable:'
      )

      await expectFailure(() =>
        BlindAuction.connect(bidder1).changeAuctionPhaseClaim(),
        'Ownable:'
      )
    })
  })
})
