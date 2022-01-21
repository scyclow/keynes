import './About.css'

export default function About() {
  return (
    <main>
      <section>
        <h2>
          Welcome to The Keynesian Beauty Contest
        </h2>
        <p>
          Posed as a thought experiment by economist John Meynerd Keynes in 1936 to describe the pricing dynamics of the stock market, the Keynesian beauty contest is no ordinary beauty contest.
          In an ordinary beauty contest, judges vote for who they think is the most beautiful. The winner is the contestant who receives the most votes.
          But in a Keynesian beauty contest, the judges compete against one another: They vote not for who they themeselves think is the most beautiful, but rather for the contestant they believe will get the most votes from the other judges.
          As Keynes notes, it no longer becomes what we think is beautiful, or even what we think the average of the group thinks is beautiful:
          "We have reached the third degree where we devote our intelligences to anticipating what average opinion expects the average opinion to be. And there are some, I believe, who practise the fourth, fifth and higher degrees."
        </p>

        <p>
          In this particular Keynesian beauty contest, which takes place as a blind auction, participants can acquire portraits of our lovely contestants with two strategies.
          In one strategy, they can simply choose to bid on the portraits they would most like to own, and only bid what they think it is worth to them -- no more, and no less.
          In the other strategy, participants may choose to play the Keynesian beauty contest game by ignoring their own preferences in favor of their perception of the perceptions of others.
        </p>

        <p>
          For either approach, participants are encouraged to reflect on the personal and social nature of purchasing art.
        </p>
      </section>

      <section>
        <h2>The Rules of the Game</h2>
        <p>The Keynesian Beauty contest is conducted as a blind auction, split into three stages: Bidding, Reveal, and Withdrawl.</p>

        <h3>Bidding</h3>
        <p>In this stage, participants submit sealed bids for their selected portraits. While others will be able to see that a specific address has made a bid, no one except the bidder will know the amount of the bid or which portrait is being bid on. Additionally, the bidder will be required to stake 0.2 ETH of collateral per bid. This is the only stage in which bids can be made or withdrawn.</p>

        <h3>Reveal</h3>
        <p>Upon the completion of the Bidding stage, participants will be expected to reveal their bids. If this is the highest revealed bid for the token, the participant must increase their stake to match their bid. If their bid is less than their staked collateral, they will be refunded. If they are not the highest bidder (or there is a subsequently higher bidder), their stake will automatically be refunded. <strong>If a bid is not revealed in this stage, the participant will lose their stake.</strong></p>

        <h3>Withdrawl</h3>
        <p>At this stage, the auction is complete and winners have been determined. Winners mat now claim their token(s). Losers will have been refunded their initial stake. Anyone who has not revealed their bid in the previous stage will have lost their stake.</p>
      </section>

      <section>
        <h2>FAQ</h2>
        <h3>How are the bids sealed?</h3>
        <h3>How does the Keynesian Beauty Contest website keep track of my bid info?</h3>
        <h3>What happens if there is a tie inthe bidding?</h3>
        <h3>How much gas will all of this cost?</h3>
        <p>Gas for the full auction lifecycly should cost between 200000 and 250000 gwei per bid. With a gas price of 100, this works out to between 0.02 and 0.025 ETH. As compensation for gas paid, all participants who unseal a bid for 0.1 ETH or higher will receive a free consolation prize token.</p>
      </section>
    </main>
  )
}