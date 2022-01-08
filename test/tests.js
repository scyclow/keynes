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

