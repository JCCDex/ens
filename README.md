# 前言

MOAC链上缺少名称服务，本项目参考[ENS项目](https://github.com/ensdomains/ens), 进行适配修改，使其可以运行在MOAC链上。

## 合约的说明

### ENSRegistry.sol

实现ENS注册，通过一个合约来查找解析器和域名的属主

合约创建时，根节点(0x00)属主默认是合约创建者。

假设我们要建立jccdex.moac这个域名，首先要构建moac节点，然后构建jccdex.moac节点，不同层次节点的管理员（子域名管理员）可以不同。

具体例子请参考ENSRegistry.test.js这个单元测试。

主要操作流程：

1. 创建合约，建立顶级节点(0x00)，owner默认是合约创建者
2. 设置子节点owner，节点表达可以是一个字符串，比如moac，他的子节点就应该是a.moac，类似域名的层层递进的表示方法
3. 设置节点(可以是顶级节点)的解析器，是一个合约，负责解析这个节点之下的内容

## FIFSRegistrar.sol

未迁移。

一个简单的先到先得的注册实现。

## HashRegistrar.sol

未迁移。

一个基于第二价格盲拍的注册合约实现，其续费过程会根据平均价格对续费成本进行加权计算，用来拍卖有价值域名的。

## HashRegistrarSimplified.sol

未迁移。

上个合约的简化实现，不支持续费，临时注册机制。

## PublicResolver.sol

简单的解析器实现，支持任何域的所有者配置其名称的解析方式，通过部署设置成解析器程序，任何人都能访问调用。

解析器需要解释的类型有很多种，常见的是名字解析成地址，合约服务解析出ABI定义，内容hash上链，解析名字，解析公钥。

井畅第一阶段合约仅仅满足解析名称到地址这个基本服务。

# ENS Registry interface

ENS注册是一个单一的中央合约，提供域名到所有者和解析合约的映射，细节请参见：[EIP 137](https://github.com/ethereum/EIPs/issues/137)。

ENS是在“节点”上运行，而不是在人为易懂的名称上运行； 使用namehash算法将人类可读的名称转换为节点，如下所示：

    def namehash(name):
      if name == '':
        return '\0' * 32
      else:
        label, _, remainder = name.partition('.')
        return sha3(namehash(remainder) + sha3(label))

注册的接口定义如下：

## owner(bytes32 node) constant returns (address)

返回指定节点的属主

## resolver(bytes32 node) constant returns (address)

返回指定节点的解析合约地址

## setOwner(bytes32 node, address owner)

更新节点的属主，只有当前属主才能调用。

## setSubnodeOwner(bytes32 node, bytes32 label, address owner)

更新子节点的属主。举个例子，“moac”这个域名的属主可以改变"jcc.moac"这个二级域名的属主，只有这个节点（域名）的属主才有权力调用，调用形式如下：

`setSubnodeOwner(namehash("moac"), sha3("jcc"), newowner)`

## setResolver(bytes32 node, address resolver)

设置节点的解析合约地址

# Resolvers

解析器 参见原始的[版本库](https://github.com/ensdomains/resolvers).

井畅做了地址解析器代码的移植。

## coinType

原ENS Resolvers的代码中引用的coinType定义规则来自[BIP44](https://github.com/satoshilabs/slips/blob/master/slip-0044.md), 对应BIP44的nodejs包[bip44-constants](https://www.npmjs.com/package/bip44-constants)。

coinType针对不同链分别是

* BTC 0
* ETH 60
* SWTC 315
* MOAC 314

本合约对于MOAC地址无须转换，但是SWTC地址需要转换成20个字节，需要参考:

* [How to Integrate ENS Multi-Coin Support into Your Wallet (for Developers)](https://medium.com/the-ethereum-name-service/how-to-integrate-ens-multi-coin-support-into-your-wallet-for-developers-8d3a8a37d1eb)
* [ensdomains/address-encoder](https://github.com/ensdomains/address-encoder)
* [EIP 2304](https://eips.ethereum.org/EIPS/eip-2304)
* [ripple-address-codec](https://github.com/ripple/ripple-address-codec/blob/master/src/xrp-codec.ts)

## setAddr(bytes32 node, address a) || setAddr(bytes32 node, uint coinType, bytes memory a)

设置地址和ENS注册的node的关联

## addr(bytes32 node) || addr(bytes32 node, uint coinType)

从节点获取地址

# DAPP的工作流程

在部署了ENSRegister和PublicResolver合约后

1. 打开DAPP画面，检测当前账号是否是根节点管理员，不是到第4步
2. 根节点管理员画面，显示域名名称输入框和管理账号输入框，提交按钮
3. 有人在JCC群里申请域名，管理员填写域名和对方账号，检查是否重复，如果有重复，提示是否更新，确认提交（ensRegistry.setSubnodeOwner）
4. 域名持有者画面，显示域名输入框
5. 持有者输入域名，检查是否是该持有者(ensRegistry.owner(namehash('chtian'))), 不是，显示提示没有管理权限，否则继续
6. 显示该域名映射的地址到编辑框，允许持有者修改(resolver.setAddr(bytes32,address)),提交即可

***说明：子域名可以自己指定其他解析器，管理员账号本身也可以是多签名，请求域名本身也可以做成投票，没空搞，用qq群，交给社区自己玩吧***

# 第三方应用如何使用

当用户转账给一个名字的时候，例如A地址转给"寒狼"，应该这么搞

1. 找出他的解析器： resolver = await ensRegistry.resolver(namehash('寒狼'))
2. 通过解析器找出寒狼的钱包： resolver.addr(namehash('寒狼'))

如果返回是0x0，说明"寒狼"这个域名没有被注册，可以到群里申请抢注

# 常用调试指令

参考角色:

* ENSRegistry 合约属主钱包 ENSRegistry_owner_wallet
* PublicResolver 合约属主钱包 PublicResolver_owner_wallet
* 域名属主钱包 Node_owner_wallet
* 域名映射钱包 user_wallet

测试链ENSRegistry合约地址: 0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647

正式链ENSRegistry合约地址: 0xea5a36ed305c5033e6ec27edb48009b79290ea51

```bash
# 部署合约
jcc_moac_tool --keystore "ENSRegistry_owner_wallet" --deploy build/contracts/ENSRegistry.json --gas_limit 1000000

# 查询注册合约根节点属主
jcc_moac_tool --abi build/contracts/ENSRegistry.json --contractAddr "0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647" --method "owner" --parameters '"0x0"'

# 注册新域名
jcc_moac_tool --keystore "ENSRegistry_owner_wallet" --abi build/contracts/ENSRegistry.json --contractAddr "0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647" --method "setSubnodeOwner" --parameters '"0x0",chain3.sha3("寒狼"),"Node_owner_wallet"' --gas_limit 50000

# 查询域名的属主
jcc_moac_tool --abi build/contracts/ENSRegistry.json --contractAddr "0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647" --method "owner" --parameters 'namehash("寒狼")'

# 设置域名的解析合约,解析合约地址（0xb9ee5486070b085c8dc133854d1a08657ce59980）是随后部署生成的
jcc_moac_tool --keystore "Node_owner_wallet" --abi build/contracts/ENSRegistry.json --contractAddr "0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647" --method "setResolver" --parameters 'namehash("寒狼"),"0xb9ee5486070b085c8dc133854d1a08657ce59980"' --gas_limit 50000

# 获取域名的解析合约
jcc_moac_tool --abi build/contracts/ENSRegistry.json --contractAddr "0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647" --method "resolver" --parameters 'namehash("寒狼")'

```

测试链PublicResolver合约地址: 0xb9ee5486070b085c8dc133854d1a08657ce59980

正式链PublicResolver合约地址: 0xdf1b5192d3fc1928ef7fd0cdd567875972b9c9e4

```bash
# 部署合约
jcc_moac_tool --keystore "PublicResolver_owner_wallet" --deploy build/contracts/PublicResolver.json --gas_limit 1000000 --parameters '"0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647"'

# 设置域名和地址的对应关系:设置域名寒狼的映射钱包地址
jcc_moac_tool --keystore "Node_owner_wallet" --abi build/contracts/PublicResolver.json --contractAddr "0xb9ee5486070b085c8dc133854d1a08657ce59980"  --method "setAddr" --parameters 'namehash("寒狼"),"user_wallet"' --gas_limit 100000

# 通过域名查询钱包地址
jcc_moac_tool --keystore "any_wallet" --abi build/contracts/PublicResolver.json --contractAddr "0xb9ee5486070b085c8dc133854d1a08657ce59980"  --method "addr" --parameters 'namehash("寒狼")'

```
