import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Fraction, JSBI, Pair, TokenAmount } from 'uniswap-xdai-sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import Question from '../../components/QuestionHelper'
import FullPositionCard from '../../components/PositionCard'
import { StyledInternalLink, TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard, OutlineCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { Dots } from '../../components/swap/styleds'
import { FarmablePool } from '../../bao/lib/constants'
import { FarmSuggestionCard } from '../../components/FarmSuggestionCard'

export interface PoolProps {
  v2IsLoading: boolean
  allV2PairsWithLiquidity: Pair[]
  v2PairsBalances: {
    [tokenAddress: string]: TokenAmount | undefined
  }
  allPairCandidatesWithLiquidity: ({ pair: Pair; farmablePool: FarmablePool } | undefined)[]
  allNewRewardPerBlock: JSBI[]
  baoPriceUsd: Fraction | undefined
}

export function PoolBody({
  v2IsLoading,
  allV2PairsWithLiquidity,
  v2PairsBalances,
  allPairCandidatesWithLiquidity,
  allNewRewardPerBlock,
  baoPriceUsd
}: PoolProps) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  return (
    <OutlineCard padding="0.25rem">
      <AutoColumn gap="12px" style={{ width: '100%' }}>
        <RowBetween padding={'0 8px'}>
          <Text color={theme.text1} fontWeight={500}>
            Your Pooled (Unstaked) Liquidity
          </Text>
          <Question text="When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below." />
        </RowBetween>

        {!account ? (
          <LightCard padding="40px">
            <TYPE.body color={theme.text3} textAlign="center">
              Connect to a wallet to view your liquidity.
            </TYPE.body>
          </LightCard>
        ) : v2IsLoading ? (
          <LightCard padding="40px">
            <TYPE.body color={theme.text3} textAlign="center">
              <Dots>Loading</Dots>
            </TYPE.body>
          </LightCard>
        ) : allV2PairsWithLiquidity?.length > 0 ? (
          <>
            {allV2PairsWithLiquidity.map(v2Pair => (
              <FullPositionCard
                key={`pool-${v2Pair.liquidityToken.address}`}
                pair={v2Pair}
                unstakedLPAmount={v2PairsBalances[v2Pair.liquidityToken.address]}
              />
            ))}
          </>
        ) : (
          <LightCard padding="40px">
            <TYPE.body color={theme.text3} textAlign="center">
              No unstaked liquidity found.
            </TYPE.body>
          </LightCard>
        )}

        <div>
          <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
            {"Don't see a pool you joined?"}{' '}
            <StyledInternalLink id="import-pool-link" to={'/find'}>
              {'Import it.'}
            </StyledInternalLink>
          </Text>
        </div>
        <RowBetween padding={'0 8px'}>
          <Text color={theme.text1} fontWeight={500}>
            Farmable Liquidity Suggestions:
          </Text>
          <Question text="These liquidity pools are shown because you have a balance in both tokens in the pair, and the LP can be staked." />
        </RowBetween>

        {v2IsLoading ? (
          <LightCard padding="40px">
            <TYPE.body color={theme.text3} textAlign="center">
              <Dots>Loading</Dots>
            </TYPE.body>
          </LightCard>
        ) : allPairCandidatesWithLiquidity?.length > 0 ? (
          <>
            {allPairCandidatesWithLiquidity.map((pfp, i) => {
              return pfp ? (
                <FarmSuggestionCard
                  key={`suggest- ${pfp.pair.liquidityToken.address}`}
                  pair={pfp.pair}
                  farmablePool={pfp.farmablePool}
                  newRewardPerBlock={allNewRewardPerBlock[i]}
                  baoPriceUsd={baoPriceUsd}
                  unstakedLPAmount={v2PairsBalances[pfp.pair.liquidityToken.address]}
                />
              ) : (
                <></>
              )
            })}
          </>
        ) : (
          <LightCard padding="40px">
            <TYPE.body color={theme.text3} textAlign="center">
              No significant individual token balances found in farmable liquidity pools.
            </TYPE.body>
          </LightCard>
        )}
      </AutoColumn>
    </OutlineCard>
  )
}

export default function Pool() {
  return (
    <>
      <SwapPoolTabs active={'pool'} />
      <AutoColumn gap="lg" justify="center">
        <ButtonPrimary id="join-pool-button" as={Link} style={{ padding: 16 }} to="/add/ETH">
          <Text fontWeight={500} fontSize={20}>
            Add Liquidity
          </Text>
        </ButtonPrimary>
      </AutoColumn>
    </>
  )
}
