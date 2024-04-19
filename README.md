## Dev
### webpage
```
yarn dev:website
```
then open the wallet: http://localhost:5173/src/pages/ui/index.html

#### How to interact with wallet

```
// listenr
window.addEventListener(e => console.log(e.data))

// send message
let targetWindow = window.open("http://localhost:5173/src/pages/ui/index.html", "xian-wallet")

// connect 
targetWindow.postMessage({data: {method: 'connect'}, target: 'xian-wallet'}, '*')

// call method
targetWindow.postMessage({data: {method: "call", params:{contract: 'currency',method:'transfer',kwargs: {to: 'test', amount: 1}}}, target: 'xian-wallet'}, '*')
```

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