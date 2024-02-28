import {sts, Block, Bytes, Option, Result, StorageType, RuntimeCtx} from '../support'
import * as v1 from '../v1'
import * as v1250 from '../v1250'

export const account =  {
    /**
     *  The full account information for a particular account ID.
     */
    v1: new StorageType('System.Account', 'Default', [v1.AccountId], v1.AccountInfo) as AccountV1,
    /**
     *  The full account information for a particular account ID.
     */
    v1250: new StorageType('System.Account', 'Default', [v1250.AccountId32], v1250.AccountInfo) as AccountV1250,
}

/**
 *  The full account information for a particular account ID.
 */
export interface AccountV1  {
    is(block: RuntimeCtx): boolean
    getDefault(block: Block): v1.AccountInfo
    get(block: Block, key: v1.AccountId): Promise<(v1.AccountInfo | undefined)>
    getMany(block: Block, keys: v1.AccountId[]): Promise<(v1.AccountInfo | undefined)[]>
    getKeys(block: Block): Promise<v1.AccountId[]>
    getKeys(block: Block, key: v1.AccountId): Promise<v1.AccountId[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v1.AccountId[]>
    getKeysPaged(pageSize: number, block: Block, key: v1.AccountId): AsyncIterable<v1.AccountId[]>
    getPairs(block: Block): Promise<[k: v1.AccountId, v: (v1.AccountInfo | undefined)][]>
    getPairs(block: Block, key: v1.AccountId): Promise<[k: v1.AccountId, v: (v1.AccountInfo | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v1.AccountId, v: (v1.AccountInfo | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v1.AccountId): AsyncIterable<[k: v1.AccountId, v: (v1.AccountInfo | undefined)][]>
}

/**
 *  The full account information for a particular account ID.
 */
export interface AccountV1250  {
    is(block: RuntimeCtx): boolean
    getDefault(block: Block): v1250.AccountInfo
    get(block: Block, key: v1250.AccountId32): Promise<(v1250.AccountInfo | undefined)>
    getMany(block: Block, keys: v1250.AccountId32[]): Promise<(v1250.AccountInfo | undefined)[]>
    getKeys(block: Block): Promise<v1250.AccountId32[]>
    getKeys(block: Block, key: v1250.AccountId32): Promise<v1250.AccountId32[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v1250.AccountId32[]>
    getKeysPaged(pageSize: number, block: Block, key: v1250.AccountId32): AsyncIterable<v1250.AccountId32[]>
    getPairs(block: Block): Promise<[k: v1250.AccountId32, v: (v1250.AccountInfo | undefined)][]>
    getPairs(block: Block, key: v1250.AccountId32): Promise<[k: v1250.AccountId32, v: (v1250.AccountInfo | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v1250.AccountId32, v: (v1250.AccountInfo | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v1250.AccountId32): AsyncIterable<[k: v1250.AccountId32, v: (v1250.AccountInfo | undefined)][]>
}
