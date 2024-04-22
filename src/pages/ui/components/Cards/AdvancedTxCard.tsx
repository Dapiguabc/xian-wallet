import {
  Box,
  Text,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Input,
  Stack,
  AlertIcon,
  AlertTitle,
  Alert,
  useToast,
  Link,
  Select,
  Flex,
} from '@chakra-ui/react';
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

const AdvancedTxCard: React.FC<Props> = ({ back }) => {
  const { currentNetwork, currentAccount } = useWallet();
  const { state } = useLoginContext();
  const [contract, setContract] = useState('');
  const [method, setMethod] = useState('');
  const [methods, setMethods] = useState([]);
  const [stamp, setStamp] = useState(150);
  const [errMsg, setErrMsg] = useState('');
  const [kwargs, setKwargs] = useState<{ [name: string]: string }>({});
  const toast = useToast();

  const handleContractChange = event => setContract(event.target.value);
  const handleMethodChange = event => setMethod(event.target.value);
  const handleStampChange = event => setStamp(parseFloat(event.target.value));
  const handleKwargsChange = (event, name, type) =>
    setKwargs(prev => {
      let value;
      if (type === 'int') {
        value = parseInt(event.target.value);
      } else if (type === 'float') {
        value = parseFloat(event.target.value);
      } else if (type === 'bool') {
        if (value !== 'true' && value !== 'false') {
          setErrMsg(`Invalid value for ${name}`);
          return;
        }
        value = event.target.value === 'true';
      } else if (type === 'dict' || type === 'list') {
        try {
          value = JSON.parse(event.target.value);
        } catch (e) {
          setErrMsg(`Invalid value for ${name}`);
          return;
        }
      } else if (type === 'Any') {
        try {
          value = JSON.parse(event.target.value);
        } catch (e) {
          value = event.target.value.toString();
        }
      } else {
        value = event.target.value;
      }
      return {
        ...prev,
        [name]: value,
      };
    });

  const send = useCallback(async () => {
    const privateKey = await accountStorage.getCurrentAccountVK(state.password);
    const callArgs: ICallArgs = {
      network: {
        chainId: currentNetwork.name,
        masternodeHosts: currentNetwork.masternode_hosts,
      },
      account: currentAccount,
      privateKey: privateKey,
      contract: contract,
      method: method,
      kwargs: kwargs,
    };
    const res = await helper.call(callArgs);
    return res;
  }, [contract, method, state.password, kwargs, currentAccount, currentNetwork]);

  const { loading, data, err, run } = useRequest(send, {
    manual: true,
  });

  useEffect(() => {
    // clear
    setErrMsg('');
    setKwargs({});
    setMethod('');
    setMethods([]);

    // verify contract
    if (contract === '') return;

    if (contract === 'currency' || contract.startsWith('con_')) {
      currentNetwork.api.getContractMethods('currency').then(r => {
        if (r === null) {
          setErrMsg('Contract does not exist!');
          return;
        }
        setMethods(r.methods ?? []);
      });
    } else {
      setErrMsg('Contract name invaild!');
    }
  }, [contract]);

  useEffect(() => {
    if (methods.length > 0) {
      setMethod(methods[0].name);
    }
  }, [methods]);

  useEffect(() => {
    if (err) {
      toast({
        title: err.message,
        status: 'error',
        isClosable: true,
        duration: 3000,
        position: 'top',
      });
    }
    if (data) {
      if (data.success) {
        const Title = (
          <Text>
            Transaction sent successfully! Explorer:
            <Link isExternal color="purple" href={`https://explorer.xian.org/tx/${data.hash}`}>
              {data.hash}
            </Link>
          </Text>
        );
        toast({
          title: Title,
          status: 'success',
          isClosable: true,
          duration: 30000,
          position: 'top',
        });
      } else {
        toast({
          title: data.error,
          status: 'error',
          isClosable: true,
          duration: 3000,
          position: 'top',
        });
      }
    }
  }, [data, err]);

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Create Advanced Transaction</Heading>
      </CardHeader>
      <CardBody p={0} mb="10px" width="100%" lineHeight={1.5}>
        Directly interact with a smart contract on the Xian Network.
        <Alert status="error" hidden={errMsg === ''} mt="10px">
          <AlertIcon />
          <AlertTitle>{errMsg}</AlertTitle>
        </Alert>
        <Box my="10px">
          <Text mb="8px">Contract</Text>
          <Input value={contract} onChange={handleContractChange} placeholder="Enter the wallet address" size="sm" />
        </Box>
        <Box my="10px">
          <Text mb="8px">Function</Text>
          <Select onChange={handleMethodChange} width="auto" size="sm" defaultValue={method}>
            {methods.map(m => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </Select>
        </Box>
        {method === '' ? (
          <></>
        ) : (
          <Box my="20px">
            <Text mb="10px">Keyword Arguments</Text>
            {methods
              .find(m => m.name === method)
              ?.arguments.map(t => (
                <Flex key={t.name} gap="10px" mb="20px" alignItems="center">
                  <Text>
                    {t.name}({t.type})
                  </Text>
                  <Input onChange={e => handleKwargsChange(e, t.name, t.type)} size="sm" />
                </Flex>
              ))}
          </Box>
        )}
        <Box my="10px">
          <Text mb="8px">Stamp/GAS Limit (1 Xian = 20 Stamps)</Text>
          <Input
            value={stamp}
            onChange={handleStampChange}
            type="number"
            placeholder="Enter the token amount"
            size="sm"
          />
        </Box>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="red" isDisabled={contract === '' || errMsg !== ''} onClick={run} isLoading={loading}>
            Send Transaction
          </Button>
          <Button colorScheme="blue" onClick={back}>
            Back
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default AdvancedTxCard;
