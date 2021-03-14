import React, { useContext, useMemo } from 'react'
import { ThemeContext } from 'styled-components'
import { Pair } from 'uniswap-xdai-sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import Question from '../../components/QuestionHelper'
import { ChefPositionCard, PairFarmablePool } from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { ButtonLight, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { Dots } from '../../components/swap/styleds'

import { useSupportedLpTokenMap } from '../../bao/lib/constants'
import { useMasterChefContract } from '../../hooks/useContract'
import { getEtherscanLink } from '../../utils'

export default function Chef() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(account ?? undefined, liquidityTokens)

  const v2Pairs = usePairs(tokenPairsWithLiquidityTokens.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < tokenPairsWithLiquidityTokens.length || v2Pairs?.some(V2Pair => !V2Pair)

  // lookup bao contract for pair
  // TODO: useMemo

  const supportedLpTokenMap = useSupportedLpTokenMap()

  const allV2PairsWithLiquidity = useMemo(() => {
    return v2Pairs
      .map(([, pair]) => pair as Pair)
      .flatMap(v2Pair => {
        const farmablePool = Boolean(v2Pair) && supportedLpTokenMap.get(v2Pair.liquidityToken.address)
        return farmablePool && { pair: v2Pair, farmablePool: farmablePool }
      })
      .filter((pairFarmablePool): pairFarmablePool is PairFarmablePool => !!pairFarmablePool)
  }, [v2Pairs, supportedLpTokenMap])

  console.log(allV2PairsWithLiquidity, 'pairFarmablePool')

  const masterChefContract = useMasterChefContract()

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'chef'} />
        <AutoColumn gap="lg" justify="center">
          <ButtonPrimary id="join-pool-button" as={Link} style={{ padding: 16 }} to="/add/ETH">
            <Text fontWeight={500} fontSize={20}>
              Add Liquidity
            </Text>
          </ButtonPrimary>

          <AutoColumn gap="12px" style={{ width: '100%' }}>
            {chainId && masterChefContract && (
              <RowBetween padding={'0 8px'}>
                <ExternalLink id="link" href={getEtherscanLink(chainId, masterChefContract.address, 'address')}>
                  BaoMasterFarmer
                  <TYPE.body color={theme.text3} textAlign="center">
                    {masterChefContract.address}
                  </TYPE.body>
                </ExternalLink>
              </RowBetween>
            )}
            <RowBetween padding={'0 8px'}>
              <Text color={theme.text1} fontWeight={500}>
                Stake LP tokens, earn BAOcx!
              </Text>
              <Question text="After you add liquidity to a pair, you are able to stake your position to earn BAOcx." />
            </RowBetween>

            {!account ? (
              <LightCard padding="40px">
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
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
                  <ChefPositionCard key={v2Pair.farmablePool.address} pairFarmablePool={v2Pair} />
                ))}
              </>
            ) : (
              <LightCard padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  No liquidity found.
                </TYPE.body>
              </LightCard>
            )}
          </AutoColumn>
        </AutoColumn>
      </AppBody>
    </>
  )
}