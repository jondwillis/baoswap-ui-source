import { ChainId } from 'uniswap-xdai-sdk'
import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { LightCard } from '../Card'
import Settings from '../Settings'
import Menu from '../Menu'
import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
// import Logo from '../../assets/images/bao-logo.png'

import { ColumnCenter as Column } from '../Column'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;

  :hover {
    cursor: pointer;
  }
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;

  :focus {
    border: 1px solid blue;
  }
`

const TestnetWrapper = styled.div`
  white-space: nowrap;
  width: fit-content;
  margin-left: 10px;
  pointer-events: auto;
`

const NetworkCard = styled(LightCard)`
  width: fit-content;
  margin-right: 10px;
  border-radius: 12px;
  padding: 8px 12px;
`

// const BaoIcon = styled.div`
//   transition: transform 0.3s ease;
//   :hover {
//     transform: rotate(-5deg);
//   }
//   img {
//     width: 50px;
//     height: 50px;
//   }
// `

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-end;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: null,
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.XDAI]: 'xDai'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: 'flex-start' }} padding="1rem 1rem 0 1rem">
        <HeaderElement>
          <Title href=".">{/* <BaoIcon>
              <img src={Logo} alt="logo" />
            </BaoIcon> */}</Title>
        </HeaderElement>
        <HeaderControls>
          <HeaderElement>
            <TestnetWrapper>
              {chainId && NETWORK_LABELS[chainId] && (
                <NetworkCard>
                  <Column style={{ padding: 0, margin: 0 }}>
                    <RowBetween>
                      <Text fontWeight={800} fontSize={10}>
                        {NETWORK_LABELS[chainId]}
                      </Text>
                    </RowBetween>
                    <RowBetween>
                      <Text fontWeight={300} fontSize={9}>
                        CHAIN
                      </Text>
                    </RowBetween>
                  </Column>
                </NetworkCard>
              )}
            </TestnetWrapper>
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  {userEthBalance?.toSignificant(4)} {chainId === 100 ? 'DAI' : 'ETH'}
                </BalanceText>
              ) : null}
              <Web3Status />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            {/* <VersionSwitch />*/}
            <Settings />
            <Menu />
          </HeaderElementWrap>
        </HeaderControls>
      </RowBetween>
    </HeaderFrame>
  )
}
