import assert from 'assert'
import {BigDecimal} from '@subsquid/big-decimal'
import * as ss58 from '@subsquid/ss58'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import {addDays, isAfter, isBefore} from 'date-fns'
import {Circulation, Snapshot} from './model'
import {type Block, processor} from './processor'
import {balances, system} from './types/storage'

const normalizeTimestamp = (timestamp?: number): Date => {
  assert(timestamp)
  const date = new Date(timestamp)
  date.setUTCHours(0, 0, 0, 0)
  return date
}
const CROWDLOAN_ADDRESS = '42fy3tTMPbgxbRqkQCyvLoSoPHwUPM3Dy5iqHYhF9RvD5XAP'
const REWARD_ADDRESS = '436H4jat7TobTbNYLdSJ3cmNy9K4frmE4Yuc4R2nNnaf56DL'
const CHAIN_BRIDGE_ADDRESS = '436H4jat7TobTbNX4RCH5p7qgErHbGTo1MyZhLVaSX4FkKyz'
const SYGMA_BRIDGE_ADDRESS = '436H4jatj6ntHTVm3wh9zs1Mqa8p1ykfcdkNH7txmjmohTu3'

const keys = [
  CROWDLOAN_ADDRESS,
  REWARD_ADDRESS,
  CHAIN_BRIDGE_ADDRESS,
  SYGMA_BRIDGE_ADDRESS,
].map((x) => ss58.decode(x).bytes)

const toBalance = (x: bigint) => BigDecimal(x.toString()).div(1e12)

const fetchCirculation = async (block: Block) => {
  let balanceData: bigint[]
  if (system.account.v1.is(block)) {
    balanceData = (await system.account.v1.getMany(block, keys)).map(
      (x) => x?.data.free ?? 0n,
    )
  } else if (system.account.v1250.is(block)) {
    balanceData = (await system.account.v1250.getMany(block, keys)).map(
      (x) => x?.data.free ?? 0n,
    )
  } else {
    throw new Error('Unsupported version')
  }
  let totalIssuance: bigint
  if (balances.totalIssuance.v1.is(block)) {
    totalIssuance = (await balances.totalIssuance.v1.get(block)) ?? 0n
  } else {
    throw new Error('Unsupported version')
  }
  const circulation = balanceData.reduce((acc, cur) => acc - cur, totalIssuance)

  return {
    crowdloan: toBalance(balanceData[0]),
    reward: toBalance(balanceData[1]),
    chainBridge: toBalance(balanceData[2]),
    sygmaBridge: toBalance(balanceData[3]),
    totalIssuance: toBalance(totalIssuance),
    circulation: toBalance(circulation),
  }
}

processor.run(new TypeormDatabase(), async (ctx) => {
  let latestSnapshot = (
    await ctx.store.find(Snapshot, {
      order: {blockHeight: 'DESC'},
      take: 1,
    })
  ).at(0)
  const snapshots: Snapshot[] = []
  for (const block of ctx.blocks) {
    const timestamp = normalizeTimestamp(block.header.timestamp)
    if (
      latestSnapshot?.timestamp == null ||
      isAfter(timestamp, latestSnapshot.timestamp)
    ) {
      if (latestSnapshot?.timestamp != null) {
        for (
          let i = addDays(latestSnapshot.timestamp, 1);
          isBefore(i, timestamp);
          i = addDays(i, 1)
        ) {
          const snapshot = new Snapshot({
            ...latestSnapshot,
            id: i.toISOString(),
            timestamp: i,
          })
          snapshots.push(snapshot)
        }
      }

      ctx.log.info(
        `Fetching snapshot ${block.header.height} ${timestamp.toISOString()}`,
      )
      const data = await fetchCirculation(block.header)
      const snapshot = new Snapshot({
        id: timestamp.toISOString(),
        blockHeight: block.header.height,
        timestamp,
        ...data,
      })
      snapshots.push(snapshot)
      latestSnapshot = snapshot
    }
  }
  await ctx.store.save(snapshots)

  if (ctx.isHead) {
    const block = ctx.blocks.at(-1)
    assert(block?.header.timestamp)
    const data = await fetchCirculation(block.header)
    const circulation = new Circulation({
      id: '0',
      blockHeight: block.header.height,
      timestamp: new Date(block.header.timestamp),
      ...data,
    })
    await ctx.store.save(circulation)
  }
})
