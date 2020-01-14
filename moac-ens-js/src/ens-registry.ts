import { Moac, smartContract as SmartContract } from "jcc-moac-utils";
import { ITransactionOption } from "jcc-moac-utils/lib/model/transaction";
import * as abi from "./abi/ENSRegistry.abi.json";

export default class ENSRegistryContract extends SmartContract {
  public static readonly rootNode = "0x0000000000000000000000000000000000000000";
  private _contractAddress: string;

  /**
   * Creates an instance of ENSRegistryContract.
   *
   * Test: `0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647`
   *
   * Main: `0xea5a36ed305c5033e6ec27edb48009b79290ea51`
   *
   * @param {string} contractAddress
   * @memberof ENSRegistryContract
   */
  constructor(contractAddress: string) {
    super();
    this._contractAddress = contractAddress;
  }

  public get contractAddress(): string {
    return this._contractAddress;
  }

  public set contractAddress(address: string) {
    this._contractAddress = address;
  }

  public initContract(moac: Moac) {
    super.init(this._contractAddress, moac, abi);
  }

  /**
   * Set owner of node
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @param {string} owner address
   *
   * @param {(err: Error, calldata: string) => void} cb send transaction with calldata by yourself
   *
   * You could send transaction via `sendTransaction` directly.
   *
   * For DAPP, you could send via wallet sdk API.
   *
   * @memberof ENSRegistryContract
   */
  public async setOwner(node: string, owner: string, cb: (err: Error, calldata: string) => void) {
    super
      .callABI("setOwner", node, owner)
      .then((calldata) => {
        cb(null, calldata);
      })
      .catch((err) => {
        cb(err, null);
      });
  }

  /**
   * Set owner of sub node
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @param {string} label you need generate hash from `label` value
   * with [sha3](https://github.com/MOACChain/chain3/blob/master/lib/utils/sha3.js#L29) API in general.
   *
   * @param {string} owner address
   *
   * @param {(err: Error, calldata: string) => void} cb send transaction with calldata by yourself
   *
   * You could send transaction via `sendTransaction` directly.
   *
   * For DAPP, you could send via wallet sdk API.
   *
   * @memberof ENSRegistryContract
   */
  public async setSubnodeOwner(node: string, label: string, owner: string, cb: (err: Error, calldata: string) => void) {
    super
      .callABI("setSubnodeOwner", node, label, owner)
      .then((calldata) => {
        cb(null, calldata);
      })
      .catch((err) => {
        cb(err, null);
      });
  }

  /**
   * Set resolver
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @param {string} resolver address
   *
   * @param {(err: Error, calldata: string) => void} cb send transaction with calldata by yourself
   *
   * You could send transaction via `sendTransaction` directly.
   *
   * For DAPP, you could send via wallet sdk API.
   *
   * @memberof ENSRegistryContract
   */
  public async setResolver(node: string, resolver: string, cb: (err: Error, calldata: string) => void) {
    super
      .callABI("setResolver", node, resolver)
      .then((calldata) => {
        cb(null, calldata);
      })
      .catch((err) => {
        cb(err, null);
      });
  }

  /**
   * Set TTL
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @param {number} ttl
   *
   * @param {(err: Error, calldata: string) => void} cb send transaction with calldata by yourself
   *
   * You could send transaction via `sendTransaction` directly.
   *
   * For DAPP, you could send via wallet sdk API.
   *
   * @memberof ENSRegistryContract
   */
  public async setTTL(node: string, ttl: number, cb: (err: Error, calldata: string) => void) {
    super
      .callABI("setTTL", node, ttl)
      .then((calldata) => {
        cb(null, calldata);
      })
      .catch((err) => {
        cb(err, null);
      });
  }

  /**
   * Query the owner of node
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @returns {Promise<string>}
   * @memberof ENSRegistryContract
   */
  public async owner(node: string): Promise<string> {
    const address = await super.callABI("owner", node);
    return address;
  }

  /**
   * Query resolver
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @returns {Promise<string>}
   * @memberof ENSRegistryContract
   */
  public async resolver(node: string): Promise<string> {
    const address = await super.callABI("resolver", node);
    return address;
  }

  /**
   * Query TTL
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value
   * with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   *
   * @returns {Promise<number>}
   * @memberof ENSRegistryContract
   */
  public async ttl(node: string): Promise<number> {
    const ttl = await super.callABI("ttl", node);
    return ttl;
  }

  /**
   * Send transaction
   *
   * @param {string} amount
   * @param {string} calldata
   * @param {string} secret
   * @param {ITransactionOption} [options]
   * @returns {Promise<string>}
   * @memberof ENSRegistryContract
   */
  public async sendTransaction(
    amount: string,
    calldata: string,
    secret: string,
    options?: ITransactionOption
  ): Promise<string> {
    const hash = await this.moac.sendTransactionWithCallData(secret, this._contractAddress, amount, calldata, options);
    return hash;
  }
}
