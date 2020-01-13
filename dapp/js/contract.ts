import { isMainnet } from "./util";
import { ENSRegistryContract, PublicResolverContract } from "moac-ens";
import { Moac } from "jcc-moac-utils";
import tpInfo from "./tp";
import tp from "tp-js-sdk";

const sendTransactionByTp = async function(value: string, calldata: string, options): Promise<string> {
  const sender = await tpInfo.getAddress();
  options = await this.moac.getOptions(options || {}, sender);
  const tx = this.moac.getTx(sender, this._contractAddress, options.nonce, options.gasLimit, options.gasPrice, value, calldata);

  let system = await tpInfo.getSystem();
  if (system === "ios") {
    // fixed value
    tx.value = this.moac.getChain3().toSha(value);

    // fixed gasLimit
    tx.gasLimit = options.gasLimit;

    // fixed gasPrice
    tx.gasPrice = options.gasPrice;
  }
  const res = await tp.signMoacTransaction(tx);
  if (res && res.result) {
    const hash = await this.moac.sendRawSignedTransaction(res.data);
    return hash;
  } else {
    throw new Error(res.msg);
  }
};

ENSRegistryContract.prototype["sendTransactionByTp"] = sendTransactionByTp;
PublicResolverContract.prototype["sendTransactionByTp"] = sendTransactionByTp;

export const moacInstance = (() => {
  let inst: Moac | null = null;

  const get = (node: string): Moac => {
    if (inst === null) {
      const mainnet = isMainnet();
      inst = new Moac(node, mainnet);
      inst.initChain3();
    }
    return inst;
  };

  const destroy = () => {
    inst = null;
  };

  return { get, destroy };
})();

export const ensInstance = (() => {
  let inst: ENSRegistryContract | null = null;

  const init = (node: string): ENSRegistryContract => {
    if (inst === null) {
      const contractAddress = process.env.ENSContract;
      const moac = moacInstance.get(node);
      inst = new ENSRegistryContract(contractAddress);
      inst.initContract(moac);
    }

    return inst;
  };

  const destroy = () => {
    inst = null;
  };

  return {
    destroy,
    init
  };
})();

export const resolverInstance = (() => {
  let inst: PublicResolverContract | null = null;

  const init = (node: string, contractAddress: string): PublicResolverContract => {
    const moac = moacInstance.get(node);
    if (inst === null) {
      inst = new PublicResolverContract(contractAddress);
      inst.initContract(moac);
    } else {
      if (contractAddress !== inst.contractAddress) {
        inst.contractAddress = contractAddress;
        inst.initContract(moac);
      }
    }

    return inst;
  };

  const destroy = () => {
    inst = null;
  };

  return {
    destroy,
    init
  };
})();
