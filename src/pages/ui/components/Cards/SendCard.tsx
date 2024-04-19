import { Box, Text, Button, Card, CardBody, CardFooter, CardHeader, Heading, Input, Stack, AlertIcon, AlertTitle, Alert, useToast, Link } from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import accountStorage from '@root/src/shared/storages/accountStorage';
import { useLoginContext } from '@src/pages/ui/context/loginContext';
import useWallet from '@root/src/shared/hooks/useWallet';
import { useCallback, useEffect, useState } from 'react';
import { useRequest } from '@root/src/shared/hooks/useRequest';
import helper, { ICallArgs } from '../../../../helper';

interface Props {
    back: () => void;
}

const SendCard: React.FC<Props> = ({ back }) => {
    const { currentNetwork, currentAccount} = useWallet();
    const { state } = useLoginContext();
    const [receiver, setReceiver ] = useState('');
    const [amount, setAmount ] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [disable, setDisable] = useState(true);
    const toast = useToast();

    const handleReceiverChange = (event) => setReceiver(event.target.value);
    const handleAmountChange = (event) => setAmount(parseFloat(event.target.value));

    const send = useCallback(async ()=>{
        const privateKey = await accountStorage.getCurrentAccountVK(state.password);
        const callArgs: ICallArgs = {
            network: {
                chainId: currentNetwork.name,
                masternodeHosts: currentNetwork.masternode_hosts,
            },
            account: currentAccount,
            privateKey: privateKey,
            contract: 'currency',
            method: 'transfer',
            kwargs: {      
                to: receiver,
                amount: amount
            },
        }
        const res =  await helper.call(callArgs);
        return res;
    }, [receiver, amount, state.password, currentAccount, currentNetwork])

    const { loading, data, err, run } = useRequest(send, {
        manual: true
    });

    useEffect(() => {
        setDisable(true);
        // verify address
        const pattern = /[0-9a-fA-F]{64}$/;
        if (!pattern.test(receiver) && receiver !== '') {
            setErrMsg('Invalid recipient address!')
            return;
        } 

        // verify amount
        if (amount <= 0 && receiver !== '') {
            setErrMsg('Amount value invalid!')
            return;
        }

        setErrMsg('')

        if (amount===0 && receiver === '') {
            setDisable(true);
        } else {
            setDisable(false);
        }
    }, [receiver, amount])

    useEffect(()=>{
        if (err) {
            toast({
                title: err.message,
                status: 'error',
                isClosable: true,
                duration: 3000,
                position: 'top',
            })
        }
        if (data) {
            if (data.success) {
                const Title = <Text>Transaction sent successfully! Explorer: 
                                <Link isExternal color='purple' href={`https://explorer.xian.org/tx/${data.hash}`}>
                                    {data.hash}
                                </Link>
                            </Text>
                toast({
                    title: Title,
                    status: 'success',
                    isClosable: true,
                    duration: 30000,
                    position: 'top',
                })
            } else {
                toast({
                    title: data.error,
                    status: 'error',
                    isClosable: true,
                    duration: 3000,
                    position: 'top',
                })
            }
        }
    },[data, err])

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Send</Heading>
      </CardHeader>
      <CardBody p={0} mb="10px" width='100%' lineHeight={1.5}>
        This is your Xian wallet. You can use it to send and receive tokens on the Xian Network.
        <Alert status='error' hidden={errMsg === ''}>
            <AlertIcon />
            <AlertTitle>{errMsg}</AlertTitle>
        </Alert> 
        <Box>
            <Text mb='8px' >To Address</Text>
            <Input   
                value={receiver}  
                onChange={handleReceiverChange}  
                placeholder='Enter the wallet address'
                size='sm'
            />
        </Box>
        <Box>
            <Text mb='8px'>Token Amount</Text>
            <Input
                value={amount}
                onChange={handleAmountChange}
                type='number'
                placeholder='Enter the token amount'
                size='sm'
            />
        </Box>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="red" isDisabled={disable} onClick={run} isLoading={loading}>Send Token</Button>
          <Button colorScheme="blue" onClick={back}>Cancel</Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default SendCard;
