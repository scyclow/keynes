
import './Main.css';

import { useState } from 'react'


import { Link } from 'react-router-dom'


import {Helmet} from 'react-helmet'
import localTokenData from './data'
import { prettyNumber, fmt, getTimes, useCountdown } from './utils'
import {times} from 'lodash'






const defaultGridSize = window.innerWidth < 750 ? 'large' : 'medium'
export default function Main() {

  const [gridSize, setGridSize] = useState('xs')




  const gridSizeClasses = {
    xs: 'thumbnailGridXS',
    small: 'thumbnailGridSmall',
    medium: 'thumbnailGridMedium',
    large: 'thumbnailGridLarge',
  }




  let sortedData = times(104, i => ({ tokenId: i + 1 }))




  return (
    <div className="Main">

      <Helmet>
        <meta name="twitter:image" content={'https://steviep.xyz/natural-flavors/assets/0.jpg'} />
        <meta name="og:image" property="og:image" content={'https://steviep.xyz/natural-flavors/assets/0.jpg'}/>
        <meta name="og:image:alt" content="Natural Flavors" />

        <meta name="title" content={'Natural Flavors'} />
        <meta name="og:title" content={'Natural Flavors'} />
        <meta name="twitter:title" content={'Natural Flavors'} />
        <meta property="og:site_name" content="Natural Flavors" />

        <meta name="twitter:description" content={'Natural Flavors: A Photo Series by Steve Pikelny'} />
        <meta name="description" content={'Natural Flavors: A Photo Series by Steve Pikelny'} />
        <meta name="og:description" content={'Natural Flavors: A Photo Series by Steve Pikelny'} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />

        <meta property="og:url" content={`https://steviep.xyz/natural-flavors`} />
        <meta name="twitter:url" content={`https://steviep.xyz/natural-flavors`} />
        <meta name="keywords" content="natural flavors, natural, flavors, nft, nfts, photo, series, photography, art, ketchup, packet, condiment, condiment packet, trash art, crypto, crypto art, fine art photography, steve, pikelny, steve pikelny, fake internet money" />
        <title>{'The Keynsian Beauty Contest'}</title>
      </Helmet>


      <header>
        <h1>
          The Keynesian Beauty Contest
        </h1>
        <h2>by Barry Blitt and Steve Pikelny</h2>
      </header>


      <section className="center">

          <div>
            <label>GRID SIZE</label>
            <select defaultValue={'xs'} onChange={e => setGridSize(e.target.value)}>
              <option value="xs">Extra Small</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

      </section>

      <section className={`thumbnailGrid ${gridSizeClasses[gridSize]}`}>
        {sortedData.map((d, i) => <div key={`thumbnail-${i}`}><Thumbnail data={d} key={d.tokenId} /></div>) }
      </section>


      <h2 style={{ textAlign: 'center', wordWrap: 'break-word', padding: '1em'}}>
        <a href={`https://etherscan.io/address/${window.CONTRACT_ADDR}`} target="_blank" rel="nofollow">{window.CONTRACT_ADDR}</a>
      </h2>

    </div>
  );
}



function Thumbnail({ data }) {

  return (
    <Link to={`/packets/${data.tokenId}`} style={{ textAlign: 'center' }}>
      <div className={`Thumbnail`}>
        <img src={`./assets/${data.tokenId}.jpeg`} loading="lazy" />
        <div className="thumbnailClickPrompt thumbnailClickPromptView">{'View >'}</div>
      </div>
    </Link>
  )



}



