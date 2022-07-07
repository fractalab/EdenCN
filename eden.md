https://github.com/pinknetworkx/atomicassets-contract/wiki/Custom-Types#attribute_map


https://eden-dev.vercel.app/members

流程：初始化-完成介绍-捐赠

```
chinaaedencn
cleos create key --to-console
Private key: 5J3w7g2UHeHbDxxEJe8FohX2K8cRjBDLFqWusWvVESjmG1ruJGw
Public key: EOS7UGURJcr6MAS5LBRNdeHD7fdbeWs65kca7PuPKacR4kWjboF3r

pcleos system newaccount --stake-net '0.001 EOS' --stake-cpu '0.001 EOS' --buy-ram-kbytes 30 nami55555553 chinaaedencn EOS7UGURJcr6MAS5LBRNdeHD7fdbeWs65kca7PuPKacR4kWjboF3r

pcleos push action eosio.token transfer '[ "nami55555553", "chinaaedencn", "100.0000 EOS", "m" ]' -p nami55555553@active

pcleos system buyram chinaaedencn chinaaedencn "60 EOS" -p chinaaedencn@active  

#部署合约
pcleos  set code chinaaedencn ./eden.wasm
pcleos  set abi chinaaedencn ./eden.abi

#设置合约权限
pcleos set account permission chinaaedencn active '{"threshold": 1,"keys": [{"key": "EOS7UGURJcr6MAS5LBRNdeHD7fdbeWs65kca7PuPKacR4kWjboF3r","weight": 1}], "accounts": [{"permission":{"actor":"chinaaedencn","permission":"eosio.code"},"weight":1}]}' -p chinaaedencn@owner

dfuse-transactions.json file
PW5JtouCLNBXPCJvwexgUk7o5j69zyEW4hBFqjwCWsQg3ey92mmBW
pcleos wallet create -n learn
pcleos wallet import -n learn
pcleos wallet unlock -n learn

alias pcleos='/usr/local/bin/cleos -u https://jungle3.cryptolions.io:443'
初始账号：nami55555555,nami55555551,nami55555553
初始账号：nami55555555
Private key: 5JzVADDZoMAwrNQy51xrnv24EPKjcfvxZmda8xM1JRywVsXtQky
Public key: EOS7skTuWgkLVezeSKAA698RgwLJtG7BFFuMyV6GGE3AjhrrBcobn

nami55555551，
Private key: 5J7jDXyx2rSPh4iPTmE4nTzyr9icSXosqvNHNhpBsPSQdAYcs1T
Public key: EOS7iJYRTpzoWjKgFV4875x5gyYjmhCzcSPA8bq2YNurgoCPt5GTF

nami55555553
Private key: 5JWiqTc6P4xqwHKuJtdR2Y4n58XPm6qoUdVHus1Ce2BTKE47Qkm
Public key: EOS7Aci4tFvd9SeqwXoBhjfiHn22ujrP4gTwACZL8A8jUjCjxoyvY

pcleos set action permission chinaaedencn chinaaedencn rename NULL -p chinaaedencn@owner

pcleos push action eosio powerup '[nami55555555, nami55555555, 1, 1000000, 1000000, "1000.0000 EOS"]' -p nami55555555@active
pcleos push action eosio powerup '[nami55555551, nami55555551, 1, 1000000, 1000000, "1000.0000 EOS"]' -p nami55555551@active
pcleos push action eosio powerup '[chinaaedencn, chinaaedencn, 1, 1000000, 1000000, "1000.0000 EOS"]' -p chinaaedencn@active

```
```
chinaaedencn

Private key: 5J5isQaM6SNk28fxHYf5dZxU361Q9GcAtxph32PDZFZgjE7vh1W
Public key: EOS5xnmjuxjC2oLHir2apsu2Pu1qULFMHbgscdc8NtyGdTDyUufy6
```
genesis参数,必须使用chinaaedencn的owner权限调用
```
 data: { "community": "Eden Test",
                     "community_symbol": "4,EOS", 
                     "minimum_donation": "10.0000 EOS", 
                     "initial_members": ["nami55555555", "nami55555551", "nami55555553"], 
                     "genesis_video": "QmTYqoPYf7DiVebTnvwwFdTgsYXg2RnuPrt8uddjfW2kHS", 
                     "auction_starting_bid": "1.0000 EOS", 
                     "auction_duration": 604800, 
                     "memo": "A community is born.", 
                     "election_day": "0", 
                     "election_time": "16:00", 
                     "collection_attributes": [ { "key": "name", "value": [ "string", "Eden Test" ] }, { "key": "img", "value": [ "string", "QmZQ11KWvfj2NkKUMJfsTfvfbyUNQpLYCu8uxSbFTQ2zbA" ] }, { "key": "description", "value": [ "string", "Eden is a community working to maximize the power and independence of its members and thereby securing life, liberty, property, and justice for all." ] }, { "key": "url", "value": [ "string", "https://eden.eoscommunity.org" ] } ] 
                    
                    }
```

````
ATTRIBUTE_MAP
[{"key": "id", "value": ["uint64", 1024]}, {"key": "color", "value": ["string", "pink"]}]

````

脚步执行顺序
1、init_community
2、



#### 运行系统
```
yarn
yarn build 
yarn start 
yarn dev --stream
```