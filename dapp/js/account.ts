import tpInfo from "./tp";
import { ensInstance } from "./contract";
import { ENSRegistryContract } from "moac-ens";

const accountInfo = (() => {
  let isAdminState: boolean = null;

  /**
   * destroy value by key
   *
   * @param {string} key
   */
  const destroy = () => {
    isAdminState = null;
  };

  /**
   * request current address is admin or not
   *
   * @returns {Promise<boolean>}
   */
  const isAdmin = async (): Promise<boolean> => {
    if (isAdminState === null) {
      try {
        const address = await tpInfo.getAddress();
        const node = await tpInfo.getNode();
        const inst = ensInstance.init(node);
        const owner = await inst.owner(ENSRegistryContract.rootNode);
        console.log("domain owner: ", owner);
        isAdminState = address.toLowerCase() === owner.toLowerCase();
      } catch (error) {
        console.log("request if is voter error: ", error);
      }
    }
    return isAdminState;
  };

  return {
    destroy,
    isAdmin
  };
})();

export default accountInfo;
