import {lookupArchive} from '@subsquid/archive-registry'
import {
  type BlockHeader,
  type Call as _Call,
  type DataHandlerContext,
  type Event as _Event,
  type Extrinsic as _Extrinsic,
  SubstrateBatchProcessor,
  type SubstrateBatchProcessorFields,
} from '@subsquid/substrate-processor'
import type {Store} from '@subsquid/typeorm-store'
import {assertNotNull} from '@subsquid/util-internal'

export const processor = new SubstrateBatchProcessor()
  .setBlockRange({from: 1})
  .includeAllBlocks()
  // Lookup archive by the network name in Subsquid registry
  // See https://docs.subsquid.io/substrate-indexing/supported-networks/
  .setGateway(lookupArchive('phala', {release: 'ArrowSquid'}))
  // Chain RPC endpoint is required on Substrate for metadata and real-time updates
  .setRpcEndpoint({
    // Set via .env for local runs or via secrets when deploying to Subsquid Cloud
    // https://docs.subsquid.io/deploy-squid/env-variables/
    url: assertNotNull(process.env.RPC_ENDPOINT),
    // More RPC connection options at https://docs.subsquid.io/substrate-indexing/setup/general/#set-data-source
    // rateLimit: 10,
  })
  .includeAllBlocks()
  .setFields({block: {timestamp: true}})

export type Fields = SubstrateBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Event = _Event<Fields>
export type Call = _Call<Fields>
export type Extrinsic = _Extrinsic<Fields>
export type ProcessorContext = DataHandlerContext<Store, Fields>
