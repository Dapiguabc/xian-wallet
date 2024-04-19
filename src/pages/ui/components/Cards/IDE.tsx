import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import { useCallback, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import helper, { ICallArgs } from '@root/src/helper';
import useWallet from '@root/src/shared/hooks/useWallet';
import accountStorage from '@root/src/shared/storages/accountStorage';
import { useLoginContext } from '../../context/loginContext';
import { useRequest } from '@root/src/shared/hooks/useRequest';

interface Props {
  next?: (num: number) => void;
  back?: () => void;
}

const defaultCode = `@construct
def seed():
    pass

@export
def test():
    return 'Hello, World!'
`;

const IDE: React.FC<Props> = ({ back }) => {
  const { currentNetwork, currentAccount } = useWallet();
  const [contract, setContract] = useState('');
  const [contractValueErr, setContractValueErr] = useState(false);
  const [stamp, setStamp] = useState(800);
  const [stampValueErr, setStampValueErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [code, setCode] = useState(defaultCode);
  const { state } = useLoginContext();
  const [disable, setDisable] = useState(true);
  const toast = useToast();

  const handleContractChange = (event: React.ChangeEvent<HTMLInputElement>) => setContract(event.target.value);
  const handleStampChange = (event: React.ChangeEvent<HTMLInputElement>) => setStamp(parseFloat(event.target.value));

  const onChange = useCallback(val => {
    setCode(val);
  }, []);

  const deploy = useCallback(async () => {
    const privateKey = await accountStorage.getCurrentAccountVK(state.password);
    const callArgs: ICallArgs = {
      network: {
        chainId: currentNetwork.name,
        masternodeHosts: currentNetwork.masternode_hosts,
      },
      account: currentAccount,
      privateKey: privateKey,
      contract: 'submission',
      method: 'submit_contract',
      kwargs: {
        name: contract,
        code: code,
      },
    };

    const res = await helper.call(callArgs);
    return res;
  }, [contract, code, state.password, currentNetwork, currentAccount]);

  useEffect(() => {
    setDisable(true);
    if (contract !== '' && !contract.startsWith('con_')) {
      setContractValueErr(true);
      setErrMsg('contract name must start with "con_"');
      return;
    } else {
      setContractValueErr(false);
      setErrMsg('');
    }
    if (stamp < 0) {
      setStampValueErr(true);
      setErrMsg('stamp amount error.');
      return;
    } else {
      setStampValueErr(false);
      setErrMsg('');
    }
    if (contract !== '') {
      setDisable(false);
    }
  }, [contract, stamp]);

  const { loading, data, err, run } = useRequest(deploy, {
    manual: true,
  });

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
    <Card {...cardStyle} maxWidth="705px">
      <CardHeader p={0} mb="20px">
        <Heading size="lg">IDE</Heading>
      </CardHeader>
      <CardBody p={0} mb="10px" lineHeight={1.5}>
        This is the most basic form of the Xian IDE. You can use it to write and deploy smart contracts on the Xian
        Network. Find standardized smart contract templates{' '}
        <Link color="#007bff" href="https://github.com/xian-network/xian-standard-contracts" isExternal>
          here
        </Link>{' '}
        and docs{' '}
        <Link color="#007bff" href="https://github.com/xian-network/smart-contracts-docs" isExternal>
          here
        </Link>
        . Deployed Smart Contracts can be directly interacted with by using{' '}
        <Link color="#007bff" href="#">
          Advanced Transactions
        </Link>
        .
        <Alert status="error" hidden={errMsg === ''}>
          <AlertIcon />
          <AlertTitle>{errMsg}</AlertTitle>
        </Alert>
        <Box my="10px">
          <CodeMirror onChange={onChange} theme="dark" value={code} height="200px" extensions={[python()]} />
        </Box>
        <Box mb="10px">
          <Text mb="8px">Contract Name</Text>
          <Input
            value={contract}
            onChange={handleContractChange}
            placeholder='Enter a unique contract name, begining with "con_"'
            size="sm"
            isInvalid={contractValueErr}
            errorBorderColor="crimson"
          />
        </Box>
        <Box mb="10px">
          <Text mb="8px">Stamp/GAS Limit (1 Xian = 20 Stamps)</Text>
          <Input
            value={stamp}
            onChange={handleStampChange}
            size="sm"
            type="number"
            isInvalid={stampValueErr}
            errorBorderColor="crimson"
          />
        </Box>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="red" onClick={run} isLoading={loading} isDisabled={disable}>
            Deploye Contract
          </Button>
          <Button colorScheme="blue" onClick={back}>
            Back
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default IDE;
