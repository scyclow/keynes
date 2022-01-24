
import './Main.css';

import { useState, useEffect, useRef } from 'react'


import { Link } from 'react-router-dom'
import { times, shuffle } from 'lodash'
import {Helmet} from 'react-helmet'


import { prettyNumber, fmt, getTimes, useCountdown } from './utils'
import { useBiddingPhase, useEthContext } from './hooks'
import { getActiveContractAddresses } from './config'
import Hero from './Hero'





const defaultGridSize = window.innerWidth < 750 ? 'large' : 'medium'
export default function Main() {
  const [gridSize, setGridSize] = useState('xs')
  const biddingPhase = useBiddingPhase()
  const [portraitData, setPortraitData] = useState([])

  useEffect(() => {
    const data = shuffle(times(139, i => ({ tokenId: i + 1 }))).slice(0, 100)
    setPortraitData(data)
  }, [])



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
        <meta name="keywords" content="" />

        <title>{'The Keynsian Beauty Contest'}</title>
      </Helmet>

{/*
*/}
      <Hero />
      <header>
        <h1>
          Who Will Win
          The Keynesian
          Beauty Contest?
        </h1>
        <h1>
        </h1>
        <h1>
        </h1>

        {
          /*
        <h2><Link to="/about">The Background</Link></h2>
        <h2><Link to="/about">The Rules</Link></h2>
          */
        }
      </header>






{/*
      <div className="blue" />
      <div className="red" />
      <div className="green" />

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
*/}



      <section className={`thumbnailGrid`}>
        <div style={{
          gridColumnStart: 0,
          gridColumnEnd: 'span 2',

          border: '2px solid',
          backgroundColor: 'hsl(60deg 71% 99%)',
          padding: '0.5em',
          textAlign: 'center'
        }}>

        <h2>
          {biddingPhase === 1
            ? 'Bidding will close on X/X at X:00'
            : 'Bidding will begin on X/X at XX:XX EST'
          }
        </h2>

        </div>
        <div style={{
          gridColumnStart: 4,
          gridColumnEnd: '6',
          gridRowStart: 2,
          gridRowEnd: 'span 2',
          border: '2px solid',
          backgroundColor: 'hsl(60deg 71% 99%)',
          padding: '0.7em',
          fontSize: '1.85em',
        }}>
          Posed as a thought experiment by economist John Meynerd Keynes in 1936 to describe the pricing dynamics of financial markets, the Keynesian Beauty Contest is no ordinary beauty contest.
        </div>


        <div style={{
          gridColumnStart: 0,
          gridColumnEnd: 'span 1',

          gridRowStart: 4,
          gridRowEnd: 'span 2',
          border: '2px solid',
          backgroundColor: 'hsl(60deg 71% 99%)',
          padding: '0.5em',
          fontSize: '1.4em'
        }}>
          In an ordinary beauty contest, judges vote for contestants who they consider the most beautiful. The contestant who receives the most votes is the winner.
        </div>
        <div style={{
          gridColumnStart: 2,
          gridColumnEnd: 'span 2',

          gridRowStart: 5,
          gridRowEnd: 'span 1',
          border: '2px solid',
          backgroundColor: 'hsl(60deg 71% 99%)',
          padding: '0.75em',
          fontSize: '1.2em'
        }}>
          But in a Keynesian beauty contest the judges compete amongst one another: Rather than vote with their own sensibilities, they vote for the contestant they believe will get the most votes from the other judges.
        </div>

        <div style={{
          gridColumnStart: 4,
          gridColumnEnd: 'span 2',
          gridRowStart: 7,
          gridRowEnd: 'span 1',
          border: '2px solid',
          backgroundColor: 'hsl(60deg 71% 99%)',
          padding: '0.5em',
          fontSize: '1.1em'
        }}>
          The contest is not about what we find beautiful, or even what we think the group finds beautiful on average.
        </div>


        <div style={{
          gridColumnStart: 0,
          gridColumnEnd: 'span 3',
          gridRowStart: 9,
          gridRowEnd: 'span 1',
          border: '2px solid',
          backgroundColor: 'hsl(60deg 71% 99%)',
          padding: '0.5em',
          fontSize: '1.5em'
        }}>
          Keynes notes: "We have reached the third degree where we devote our intelligences to anticipating what average opinion expects the average opinion to be. And there are some, I believe, who practise the fourth, fifth and higher degrees."
        </div>

        {portraitData.map((d, i) => <div key={`thumbnail-${i}`}><Thumbnail data={d} key={d.tokenId} /></div>) }
      </section>


      <Connect />
      <h2 style={{ textAlign: 'center', wordWrap: 'break-word', padding: '1em'}}>
        <div><a href={`https://etherscan.io/address/${getActiveContractAddresses().KBC}`} target="_blank" rel="nofollow">Token Contract</a></div>
        <div><a href={`https://etherscan.io/address/${getActiveContractAddresses().BlindAuction}`} target="_blank" rel="nofollow">Auction Contract</a></div>
        <div><a href={`https://etherscan.io/address/${getActiveContractAddresses().TokenURI}`} target="_blank" rel="nofollow">Metadata Contract</a></div>
        <div><a href={`https://ipfs.io/ipfs/`} target="_blank" rel="nofollow">IPFS</a></div>
      </h2>


    </div>

  );
}



function Thumbnail({ data }) {

  return (
    <Link to={`/participants/${data.tokenId}`}>
      <div className={`Thumbnail`}>
        <div className="Thumbnail-overlay">Alice</div>
        <div>
          <img src={`./assets/${data.tokenId}.jpeg`} loading="lazy" />
        </div>
        {/*{data.tokenId}*/}
      </div>
    </Link>
  )
}

function Connect() {
  const {
    provider,
    signer,
    connectedAddress,
    connected,
    onConnect,
    onDisconnect
  } = useEthContext()

  return (
    <section>
      <button onClick={onConnect}>Connect</button>
      <button onClick={onDisconnect}>Disconnect</button>
      {connectedAddress}
    </section>
  )

}

