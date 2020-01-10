import { Moac, smartContract as SmartContract } from "jcc-moac-utils";
import { ITransactionOption } from "jcc-moac-utils/lib/model/transaction";
import * as abi from "./abi/PublicResolver.abi.json";

export default class PublicResolverContract extends SmartContract {
  public static readonly rootNode = "0x0000000000000000000000000000000000000000";
  private _contractAddress: string;

  /**
   * Creates an instance of PublicResolverContract.
   *
   * Test: `0xd168a209adf249f977d60ae4f3d445d04842891c`
   *
   * Main: `0xdf1b5192d3fc1928ef7fd0cdd567875972b9c9e4`
   *
   * @param {string} contractAddress
   * @memberof PublicResolverContract
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
   * Query supportsInterface
   *
   * @param {string} interfaceID
   * @returns {Promise<boolean>}
   * @memberof PublicResolverContract
   */
  public async supportsInterface(interfaceID: string): Promise<boolean> {
    const support = await super.callABI("supportsInterface", interfaceID);
    return support;
  }

  /**
   * Query address of node without coin type
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   * @returns {Promise<string>}
   * @memberof PublicResolverContract
   */
  public async addrWithoutCoinType(node: string): Promise<string> {
    const address = await super.callABI("addr", node);
    return address;
  }

  // /**
  //  *
  //  *
  //  * @param {string} node
  //  * @param {number} coinType
  //  * @returns {Promise<string>}
  //  * @memberof PublicResolverContract
  //  */
  // public async addrWithCoinType(node: string, coinType: number): Promise<string> {
  //   const address = await super.callABI("addr", node, coinType);
  //   return address;
  // }

  // /**
  //  *
  //  *
  //  * @param {string} node
  //  * @param {number} coinType
  //  * @param {string} byte
  //  * @param {(err: Error, calldata: string) => void} cb
  //  * @memberof PublicResolverContract
  //  */
  // public setAddrWithCoinType(node: string, coinType: number, byte: string, cb: (err: Error, calldata: string) => void) {
  //   super
  //     .callABI("setAddr", node, coinType, byte)
  //     .then((calldata) => {
  //       cb(null, calldata);
  //     })
  //     .catch((err) => {
  //       cb(err, null);
  //     });
  // }

  /**
   * Set address of node without coin type
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   * @param {string} address
   * @param {(err: Error, calldata: string) => void} cb send transaction with calldata by yourself
   * @memberof PublicResolverContract
   */
  public setAddrWithoutCoinType(node: string, address: string, cb: (err: Error, calldata: string) => void) {
    super
      .callABI("setAddr", node, address)
      .then((calldata) => {
        cb(null, calldata);
      })
      .catch((err) => {
        cb(err, null);
      });
  }

  /**
   * Set authorisation
   *
   * @param {string} node If node is not `rootNode`, you need generate hash from `node` value with [hash](https://github.com/danfinlay/eth-ens-namehash/blob/master/index.js#L29) API in general.
   * @param {string} target address
   * @param {boolean} isAuthorised
   * @param {(err: Error, calldata: string) => void} cb send transaction with calldata by yourself
   *
   * You could send transaction via `sendTransaction` directly.
   *
   * For DAPP, you could send via wallet sdk API.
   *
   * @memberof PublicResolverContract
   */
  public setAuthorisation(
    node: string,
    target: string,
    isAuthorised: boolean,
    cb: (err: Error, calldata: string) => void
  ) {
    super
      .callABI("setAuthorisation", node, target, isAuthorised)
      .then((calldata) => {
        cb(null, calldata);
      })
      .catch((err) => {
        cb(err, null);
      });
  }

  /**
   * send transaction
   *
   * @param {string} amount
   * @param {string} calldata
   * @param {string} secret
   * @param {ITransactionOption} [options]
   * @returns {Promise<string>}
   * @memberof PublicResolverContract
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
