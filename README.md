## Dev
### webpage
```
yarn dev:website
```
then open the wallet: http://localhost:5173/src/pages/ui/index.html

### Extension

```
yarn dev
```

#### How to interact with wallet

```
const res = await window.xianNet.request({
    method: 'connect'
})
```


```
window.postMessage({ 
    target: 'xian-contentjs',
    data: {
        method: 'connect'
    }
})
```