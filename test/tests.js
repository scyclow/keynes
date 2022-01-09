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
  it('minting should work', async () => {
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

    expect(await KBC.connect(owner).totalSupply()).to.equal(100)
    expect(await KBC.connect(owner).ownerOf(0)).to.equal(owner.address)
    expect(await KBC.connect(owner).ownerOf(1)).to.equal(owner.address)
    expect(await KBC.connect(owner).ownerOf(2)).to.equal(notOwner.address)
    expect(await KBC.connect(owner).balanceOf(owner.address)).to.equal(99)
    expect(await KBC.connect(owner).balanceOf(notOwner.address)).to.equal(1)
  })

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
    await KBC.connect(owner).setBaseMetadata(
      baseMetadata.baseImgUrl,
      baseMetadata.imgExtension,
      baseMetadata.baseExternalUrl,
      baseMetadata.license,
    )

    await KBC.connect(owner).setTokenMetadata(
      0,
      'Alice',
      'Her favorite movies is based on what she thinks your favorite movie is'
    )

    await KBC.connect(owner).batchSetTokenMetadata(
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
      tokenId: '0',
      name: 'Alice',
      description: 'Her favorite movies is based on what she thinks your favorite movie is',
      image: baseMetadata.baseImgUrl + '0' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '0',
      license: baseMetadata.license
    })

    const metadata1 = await KBC.connect(owner).tokenURI(1)
    expect(parseMetadata(metadata1)).to.deep.equal({
      tokenId: '1',
      name: 'Betty',
      description: 'Interned at the RAND corporation in high school',
      image: baseMetadata.baseImgUrl + '1' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '1',
      license: baseMetadata.license
    })

    const metadata2 = await KBC.connect(owner).tokenURI(2)
    expect(parseMetadata(metadata2)).to.deep.equal({
      tokenId: '2',
      name: 'Catherine',
      description: 'Dressed as a pirate for the last seven halloweens',
      image: baseMetadata.baseImgUrl + '2' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '2',
      license: baseMetadata.license
    })


    const metadata3 = await KBC.connect(owner).tokenURI(3)
    expect(parseMetadata(metadata3)).to.deep.equal({
      tokenId: '3',
      name: 'Diane',
      description: 'Prefers to meet friends under the clock at Grand Central at noon',
      image: baseMetadata.baseImgUrl + '3' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '3',
      license: baseMetadata.license
    })


    const metadata4 = await KBC.connect(owner).tokenURI(4)
    expect(parseMetadata(metadata4)).to.deep.equal({
      tokenId: '4',
      name: 'Eve',
      description: 'Thinks Austrian business cycle theory is overrated',
      image: baseMetadata.baseImgUrl + '4' + baseMetadata.imgExtension,
      external_url: baseMetadata.baseExternalUrl + '4',
      license: baseMetadata.license
    })


    const metadata5 = await KBC.connect(owner).tokenURI(5)
    expect(parseMetadata(metadata5)).to.deep.equal({
      tokenId: '5',
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
    await KBC.connect(owner).setBaseMetadata(
      updatedMetadata.baseImgUrl,
      updatedMetadata.imgExtension,
      updatedMetadata.baseExternalUrl,
      updatedMetadata.license,
    )

    await KBC.connect(owner).setTokenMetadata(
      0,
      'Grace',
      'Prefers to be conspicuous in her consumption'
    )

    const metadata0_1 = await KBC.connect(owner).tokenURI(0)
    expect(parseMetadata(metadata0_1)).to.deep.equal({
      tokenId: '0',
      name: 'Grace',
      description: 'Prefers to be conspicuous in her consumption',
      image: updatedMetadata.baseImgUrl + '0' + updatedMetadata.imgExtension,
      external_url: updatedMetadata.baseExternalUrl + '0',
      license: updatedMetadata.license
    })

    const metadata1_1 = await KBC.connect(owner).tokenURI(1)
    expect(parseMetadata(metadata1_1)).to.deep.equal({
      tokenId: '1',
      name: 'Betty',
      description: 'Interned at the RAND corporation in high school',
      image: updatedMetadata.baseImgUrl + '1' + updatedMetadata.imgExtension,
      external_url: updatedMetadata.baseExternalUrl + '1',
      license: updatedMetadata.license
    })

    await expectFailure(() =>
      KBC.connect(notOwner).setBaseMetadata(
        'google.com/',
        '.svg',
        'vonmisesinstitute.com/',
        'MIT',
      ),
      'Ownable:'
    )

    await expectFailure(() =>
      KBC.connect(notOwner).setTokenMetadata(
        0,
        'Bob',
        'Bob likes Hayek'
      ),
      'Ownable:'
    )

    await expectFailure(() =>
      KBC.connect(notOwner).batchSetTokenMetadata([1], ['Charlie'], ['Charlie likes von mises']),
      'Ownable'
    )
  })

  it('token uri redirecting', async () => {
    const [
      _, __,
      owner,
      notOwner,
      ...signers
    ] = await ethers.getSigners()
    const KBCFactory = await ethers.getContractFactory('KeynesianBeautyContest', owner)
    const KBC = await KBCFactory.deploy()
    await KBC.deployed()

    const TokenURIFactory = await ethers.getContractFactory('MockTokenURI', owner)
    const TokenURI = await TokenURIFactory.deploy()
    await TokenURI.deployed()

    await KBC.connect(owner).mint(owner.address, 0)

    await expectFailure(() =>
      KBC.connect(notOwner).setUseURIPointer(true, KBC.address),
      'Ownable'
    )
    KBC.connect(owner).setUseURIPointer(true, TokenURI.address)

    const metadata0 = await KBC.connect(owner).tokenURI(0)
    expect(metadata0).to.deep.equal('{"prop": "val"}')
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

    const name = 'XXXXXXXXXXXX'
    const description = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    const batchedIds = []
    const batchedNames = []
    const batchedDescriptions = []

    for (let i=0; i<100; i++) {
      await KBC.connect(owner).setTokenMetadata(
        i,
        name,
        description
      )

      batchedIds.push(100+i)
      batchedNames.push(name)
      batchedDescriptions.push(description)
    }

    await KBC.connect(owner).batchSetTokenMetadata(batchedIds, batchedNames, batchedDescriptions)
  })
})

describe.only('BlindAuction', () => {
  const stakeValue = ethers.utils.parseEther('0.2')
  const highBidValue = ethers.utils.parseEther('0.5')
  const lowBidValue = ethers.utils.parseEther('0.1')
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

    await KBC.connect(owner).mint(owner.address, 0)
    await KBC.connect(owner).mint(owner.address, 1)
    await KBC.connect(owner).mint(owner.address, 2)
    await BlindAuction.connect(owner).changeAuctionStateBidding()
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


      await BlindAuction.connect(owner).changeAuctionStatePaused()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth),
        'Bid can only be created in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionStateReveal()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth),
        'Bid can only be created in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionStateClaim()
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

      expect(startingBidderBalance - endingBidderBalance).to.be.closeTo(0, 0.01)
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
        'Bid is already marked innactive'
      )

      await expectFailure(() =>
        BlindAuction.connect(bidder2).withdrawSealedBid(bidHash),
        'Bid is already marked innactive'
      )
    })

    it('should only work in the BIDDING phase', async () => {
      const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

      await BlindAuction.connect(owner).changeAuctionStatePaused()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn or updated in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionStateReveal()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn or updated in the BIDDING phase'
      )

      await BlindAuction.connect(owner).changeAuctionStateClaim()
      await expectFailure(() =>
        BlindAuction.connect(bidder1).withdrawSealedBid(bidHash),
        'Bid can only be withdrawn or updated in the BIDDING phase'
      )
    })

    // TODO
    it('should not allow reentry', async () => {})
  })

  describe('updateSealedBid', () => {
    it('should work', async () => {

      const oldBidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
      const newBidHash = await BlindAuction.connect(bidder1).hashBid(0, highBidValue, bidder1.address)

      await BlindAuction.connect(bidder1).placeSealedBid(oldBidHash, payableEth)
      await BlindAuction.connect(bidder1).updateSealedBid(oldBidHash, newBidHash)


      // TODO
      // old bid is marked innactive
      // new bid exists and is correct
      // eth is not returned
    })
    it('oldBid should not work for wrong bidder')
    it('oldBid cannot be innactive')
    it('newBid hash cannot already exist')
    it('should only work in the BIDDING phase')
  })

  describe('unsealBid', () => {
    describe('no current bids', () => {
      it('should reveal the bid', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionStateReveal()
        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())
        const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

        expect(startingBidderBalance - endingBidderBalance).to.be.closeTo(0.1, 0.01) // stake refund (0.2), less the bid (0.1)
        expect(sealedBid.bidder).to.equal(zeroAddress)
        expect(sealedBid.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder1.address)
        expect(highestUnsealedBid.amount).to.equal(lowBidValue)
        expect(highestUnsealedBid.claimed).to.equal(false)
      })

      it('should refund if tokenId is invalid', async () => {
        const invalidTokenId = 100
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(invalidTokenId, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionStateReveal()
        await BlindAuction.connect(bidder1).unsealBid(invalidTokenId, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())
        const sealedBid = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash)

        expect(startingBidderBalance - endingBidderBalance).to.be.closeTo(0, 0.01) // stake refund (0.2), less the bid (0.1)
        expect(sealedBid.bidder).to.equal(zeroAddress)
        expect(sealedBid.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(invalidTokenId)
        expect(highestUnsealedBid.bidder).to.equal(zeroAddress)
        expect(highestUnsealedBid.amount).to.equal(0)
        expect(highestUnsealedBid.claimed).to.equal(false)
      })

      it('should not work on inactive bids', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)
        await BlindAuction.connect(bidder1).withdrawSealedBid(bidHash)

        await BlindAuction.connect(owner).changeAuctionStateReveal()

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bid must be active to be unsealed'
        )
      })

      it('should not work on already unsealed bids', async () => {
        const startingBidderBalance = num(await bidder1.getBalance())

        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionStateReveal()

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

        await BlindAuction.connect(owner).changeAuctionStateReveal()

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

        await BlindAuction.connect(owner).changeAuctionStateReveal()

        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(1, lowBidValue),
          'Bid must be active to be unsealed'
        )
      })

      it('should only work in the reveal phase', async () => {
        const bidHash = await BlindAuction.connect(bidder1).hashBid(0, lowBidValue, bidder1.address)
        await BlindAuction.connect(bidder1).placeSealedBid(bidHash, payableEth)

        await BlindAuction.connect(owner).changeAuctionStatePaused()
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bids can only be unsealed in the REVEAL phase'
        )

        await BlindAuction.connect(owner).changeAuctionStateBidding()
        await expectFailure(() =>
          BlindAuction.connect(bidder1).unsealBid(0, lowBidValue),
          'Bids can only be unsealed in the REVEAL phase'
        )

        await BlindAuction.connect(owner).changeAuctionStateClaim()
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

        await BlindAuction.connect(owner).changeAuctionStateReveal()
        await BlindAuction.connect(bidder2).unsealBid(0, highBidValue, { value: ethers.utils.parseEther('0.3') })
        await BlindAuction.connect(bidder1).unsealBid(0, lowBidValue)

        const endingBidderBalance = num(await bidder1.getBalance())

        const sealedBid1 = await BlindAuction.connect(bidder1).hashToSealedBids(bidHash1)
        expect(startingBidderBalance - endingBidderBalance).to.be.closeTo(0, 0.01) // full stake refund (0.2)
        expect(sealedBid1.bidder).to.equal(zeroAddress)
        expect(sealedBid1.stake).to.equal(0)

        const highestUnsealedBid = await BlindAuction.connect(bidder1).tokenIdToHighestUnsealedBid(0)
        expect(highestUnsealedBid.bidder).to.equal(bidder2.address)
        expect(highestUnsealedBid.amount).to.equal(highBidValue)
        expect(highestUnsealedBid.claimed).to.equal(false)
      })
    })

    describe('overtaking the highest bidder', () => {
      it('should partially refund the bidder if they bid less than the collateral', async () => {})

      it('should require more money to unseal if bid is higher than collateral', async () => {})
    })





    // TODO
    it('should not allow reentry', async () => {})
  })
  describe('claimToken', () => {
    it('should mint the token', async () => {
      // token balance updates appropriately
      // eth held by contract.
    })
    it('should only work in the CLAIM phase')
    it('cannot be claimed twice')
    it('can only be claimed by the tokens highest bidder')
  })

  describe('withdrawSalesRevenue', () => {
    it('should withdraw eth')
    it('should only work in the claim phase')
  })
  describe('changeAuctionState', () => {})
})
