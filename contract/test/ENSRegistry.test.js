/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable no-undef */
const ENSRegistry = artifacts.require('ENSRegistry');
const namehash = require('eth-ens-namehash').hash;
const zeroAccount = require('./helpers/zeroAccount');
const assertRevert = require('./helpers/assertRevert');
const timeTravel = require('./helpers/timeTravel');

contract('ENSRegistry', (accounts) => {
  let admin = accounts[1];
  let newAdmin = accounts[2];
  let newResolver = accounts[3];

  let moac_owner = accounts[4];
  let moac_resolver = accounts[5];
  let jccdex_moac_owner = accounts[6];
  let jccdex_moac_resolver = accounts[7];

  beforeEach(async () => {
    ensRegistry = await ENSRegistry.new({ from: admin });
  });

  it('ENSRegistry test', async () => {
    // 测试根节点管理员
    let owner = await ensRegistry.owner(zeroAccount);
    assert.equal(owner, admin);

    // 测试根节点解析器
    let resolver = await ensRegistry.resolver(zeroAccount);
    assert.equal(resolver, zeroAccount);

    // 测试根节点TTL
    let ttl = await ensRegistry.ttl(zeroAccount);
    assert.equal(ttl, 0);

    // 测试根节点变更管理员
    await ensRegistry.setOwner(zeroAccount, newAdmin, { from: admin });
    owner = await ensRegistry.owner(zeroAccount);
    assert.equal(owner, newAdmin);

    // 测试根节点变更解析器
    await ensRegistry.setResolver(zeroAccount, newResolver, { from: newAdmin });
    resolver = await ensRegistry.resolver(zeroAccount);
    assert.equal(resolver, newResolver);

    await ensRegistry.setTTL(zeroAccount, 10000, { from: newAdmin });
    ttl = await ensRegistry.ttl(zeroAccount);
    assert.equal(ttl, 10000);

    // 注册新域名
    await ensRegistry.setSubnodeOwner(zeroAccount, web3.utils.sha3('moac'), moac_owner, { from: newAdmin });
    owner = await ensRegistry.owner(namehash('moac'));
    assert.equal(owner, moac_owner);
    await ensRegistry.setResolver(namehash('moac'), moac_resolver, { from: moac_owner });
    resolver = await ensRegistry.resolver(namehash('moac'));
    assert.equal(resolver, moac_resolver);

    // 注册子域名
    await ensRegistry.setSubnodeOwner(namehash('moac'), web3.utils.sha3('jccdex'), jccdex_moac_owner, { from: moac_owner });
    owner = await ensRegistry.owner(namehash('jccdex.moac'));
    assert.equal(owner, jccdex_moac_owner);
    await ensRegistry.setResolver(namehash('jccdex.moac'), jccdex_moac_resolver, { from: jccdex_moac_owner });
    resolver = await ensRegistry.resolver(namehash('jccdex.moac'));
    assert.equal(resolver, jccdex_moac_resolver);
  });

});
