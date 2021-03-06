import React, { RefObject, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { ThemeContext } from 'styled-components'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import Question from '../../components/QuestionHelper'
import { TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
import { SearchInput } from './styleds'

import { useActiveWeb3React } from '../../hooks'
import { Dots } from '../../components/swap/styleds'
import { useAllFarmablePools } from '../../bao/lib/constants'
import { FarmCard } from '../../components/FarmCard'
import { usePoolInfoFarmablePools } from '../../data/Reserves'
import { useTranslation } from 'react-i18next'
import { useAllNewRewardPerBlock, useBaoUsdPrice } from '../../hooks/Price'
import useDebounce from '../../hooks/useDebounce'

export default function Analytics() {
  const { t } = useTranslation()
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

  const allFarmablePools = useAllFarmablePools()
  const allNewRewardPerBlock = useAllNewRewardPerBlock(allFarmablePools)
  const [poolInfo, fetchingPoolInfo] = usePoolInfoFarmablePools(allFarmablePools, allNewRewardPerBlock)

  const [searchQuery, setSearchQuery] = useState('')

  const queriedPools = useDebounce(
    useMemo(() => {
      const query = searchQuery.toLowerCase()
      return poolInfo.filter(
        p =>
          p.symbol
            .split(' ')[0]
            .toLowerCase()
            .includes(query) || p.name.toLowerCase().includes(query)
      )
    }, [poolInfo, searchQuery]),
    250
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    setSearchQuery(input)
  }, [])

  const baoPriceUsd = useBaoUsdPrice()

  const isLoading = fetchingPoolInfo
  return (
    <>
      <SwapPoolTabs active={'analytics'} />
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="12px" style={{ width: '100%' }}>
          <RowBetween padding={'0 8px'}>
            <Text color={theme.text1} fontWeight={500}>
              All Farmable Pools (Work in Progress)
            </Text>
            <Question text="Analytics about all farmable pools" />
          </RowBetween>
          <SearchInput
            type="text"
            id="pool-search-input"
            placeholder={t('poolSearchPlaceholder')}
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            disabled={fetchingPoolInfo}
          />
          {!account ? (
            <LightCard padding="40px">
              <TYPE.body color={theme.text3} textAlign="center">
                Connect to a wallet to view farmable pools.
              </TYPE.body>
            </LightCard>
          ) : isLoading ? (
            <LightCard padding="40px">
              <TYPE.body color={theme.text3} textAlign="center">
                <Dots>Loading</Dots>
              </TYPE.body>
            </LightCard>
          ) : queriedPools?.length > 0 ? (
            <>
              {queriedPools.map(farm => (
                <FarmCard
                  key={`analytics-${farm.address}`}
                  farmablePool={farm}
                  newRewardPerBlock={farm.newRewardPerBlock}
                  baoPriceUsd={baoPriceUsd}
                  defaultShowMore={false}
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
        </AutoColumn>
      </AutoColumn>
    </>
  )
}
