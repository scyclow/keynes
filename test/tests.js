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

  xit('metadata should work', async () => {
    const [
      _, __,
      owner1,
      owner2,
      minter,
      ...signers
    ] = await ethers.getSigners()
    const FreeBaseFactory = await ethers.getContractFactory('Free', owner1)
    const FreeBase = await FreeBaseFactory.deploy()
    await FreeBase.deployed()

    const Free0Factory = await ethers.getContractFactory('Free0', owner1)
    const Free0 = await Free0Factory.deploy(FreeBase.address)
    await Free0.deployed()


    await FreeBase.connect(owner1).createCollection(owner1.address, 'Free0 #', 'website.com', 'ipfs://afadsf', '.jpg', 'if its free its for me')
    await FreeBase.connect(owner1).createCollection(owner1.address, 'Free1 #', 'website.com', 'ipfs://afadsf', '.jpg', 'free for all')
    await FreeBase.connect(owner1).mint(0, owner1.address)
    await FreeBase.connect(owner1).mint(0, owner1.address)
    await FreeBase.connect(owner1).mint(1, owner1.address)



    const metadata0 = await FreeBase.connect(owner1).tokenURI(0)
    expect(parseMetadata(metadata0)).to.deep.equal({
      name: 'Free0 #0',
      description: 'if its free its for me',
      license: 'CC0',
      image: 'ipfs://afadsf.jpg',
      external_url: 'website.com?collectionId=0&tokenId=0',
      attributes: [ { trait_type: 'Collection', value: '0' } ]
    })

    const metadata1 = await FreeBase.connect(owner1).tokenURI(1)
    expect(parseMetadata(metadata1)).to.deep.equal({
      name: 'Free0 #1',
      description: 'if its free its for me',
      license: 'CC0',
      image: 'ipfs://afadsf.jpg',
      external_url: 'website.com?collectionId=0&tokenId=1',
      attributes: [ { trait_type: 'Collection', value: '0' } ]
    })

    const metadata2 = await FreeBase.connect(owner1).tokenURI(2)
    expect(parseMetadata(metadata2)).to.deep.equal({
      name: 'Free1 #0',
      description: 'free for all',
      license: 'CC0',
      image: 'ipfs://afadsf.jpg',
      external_url: 'website.com?collectionId=1&tokenId=2',
      attributes: [ { trait_type: 'Collection', value: '1' } ]
    })



    await FreeBase.connect(owner1).updateMetadataParams(0, 'renamed ', 'new.website', 'arweave://123', '.png', 'free as in beer')
    // console.log(await FreeBase.connect(owner1).seriesIdToMetadata(0))

    const metadata0_1 = await FreeBase.connect(owner1).tokenURI(0)
    expect(parseMetadata(metadata0_1)).to.deep.equal({
      name: 'renamed 0',
      description: 'free as in beer',
      license: 'CC0',
      image: 'arweave://123.png',
      external_url: 'new.website?collectionId=0&tokenId=0',
      attributes: [ { trait_type: 'Collection', value: '0' } ]
    })

    const metadata1_1 = await FreeBase.connect(owner1).tokenURI(1)
    expect(parseMetadata(metadata1_1)).to.deep.equal({
      name: 'renamed 1',
      description: 'free as in beer',
      license: 'CC0',
      image: 'arweave://123.png',
      external_url: 'new.website?collectionId=0&tokenId=1',
      attributes: [ { trait_type: 'Collection', value: '0' } ]
    })

    await expectFailure(() =>
      FreeBase.connect(owner2).updateMetadataParams(0, 'renamed ', 'new.website', 'arweave://123', '.png', 'free as in beer'),
      'Ownable:'
    )

    await FreeBase.connect(owner1).setMintingAddress(0, minter.address)

    await FreeBase.connect(minter).appendAttributeToToken(0, 'likes beer', 'true')

    const metadata0_2 = await FreeBase.connect(owner1).tokenURI(0)
    expect(parseMetadata(metadata0_2)).to.deep.equal({
      name: 'renamed 0',
      description: 'free as in beer',
      license: 'CC0',
      image: 'arweave://123.png',
      external_url: 'new.website?collectionId=0&tokenId=0',
      attributes: [ { trait_type: 'Collection', value: '0' },  { trait_type: 'likes beer', value: true }]
    })

    const metadata1_2 = await FreeBase.connect(owner1).tokenURI(1)
    expect(parseMetadata(metadata1_2)).to.deep.equal({
      name: 'renamed 1',
      description: 'free as in beer',
      license: 'CC0',
      image: 'arweave://123.png',
      external_url: 'new.website?collectionId=0&tokenId=1',
      attributes: [ { trait_type: 'Collection', value: '0' } ]
    })
  })
})
