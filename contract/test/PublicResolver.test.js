/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
const ENSRegistry = artifacts.require('ENSRegistry');
const PublicResolver = artifacts.require('PublicResolver');
const namehash = require('eth-ens-namehash').hash;
const zeroAccount = require('./helpers/zeroAccount');

contract('PublicResolver', (accounts) => {
  let admin = accounts[1];
  let userAddr = accounts[2];
  let newResolver = accounts[3];

  let moac_owner = accounts[4];
  let moac_resolver = accounts[5];
  let jccdex_moac_owner = accounts[6];
  let jccdex_moac_resolver = accounts[7];

  beforeEach(async () => {
    node = namehash('moac');
    node_jccdex = namehash('jccdex.moac');

    ensRegistry = await ENSRegistry.new({ from: admin });

    resolver = await PublicResolver.new(ensRegistry.address);
    // 创建顶级域名
    await ensRegistry.setSubnodeOwner(zeroAccount, web3.utils.sha3('moac'), moac_owner, { from: admin });

    // 创建二级域名
    await ensRegistry.setSubnodeOwner(namehash('moac'), web3.utils.sha3('jccdex'), jccdex_moac_owner, { from: moac_owner });
  });

  it('PublicResolver supportsInterface test', async () => {
    assert.equal(await resolver.supportsInterface("0x3b3b57de"), true);
    assert.equal(await resolver.supportsInterface("0xf1cb7e06"), true);
    assert.equal(await resolver.supportsInterface("0x01ffc9a7"), true);
  });

  it('PublicResolver addr test', async () => {
    // 设置moac名称映射的用户钱包
    let tx = await resolver.methods['setAddr(bytes32,address)'](node, userAddr, { from: moac_owner });
    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[0].event, "AddressChanged");
    assert.equal(tx.logs[0].args.node, node);
    assert.equal(tx.logs[0].args.newAddress, userAddr.toLowerCase());
    assert.equal(tx.logs[1].event, "AddrChanged");
    assert.equal(tx.logs[1].args.node, node);
    assert.equal(tx.logs[1].args.a, userAddr);
    assert.equal(await resolver.addr(node), userAddr);

    // 当前publicResover是一个地址解析，测试地址设置和解析
    // 测试moac和jccdex.moac
    await resolver.methods['setAddr(bytes32,address)'](node_jccdex, accounts[3], { from: jccdex_moac_owner });
    assert.equal(await resolver.methods['addr(bytes32)'](node_jccdex), accounts[3]);

    await resolver.methods['setAddr(bytes32,uint256,bytes)'](node_jccdex, 314, accounts[2], { from: jccdex_moac_owner });
    assert.equal(await resolver.methods['addr(bytes32,uint256)'](node_jccdex, 314), accounts[2].toLowerCase());
  });
});
