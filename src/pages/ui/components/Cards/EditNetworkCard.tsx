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
  useToast,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import { useEffect, useState } from 'react';
import networkStorage from '@root/src/shared/storages/networkStorage';

interface Props {
  back: () => void;
}

const EditNetworkCard: React.FC<Props> = ({ back }) => {
  const [chainId, setChainId] = useState('');
  const [url, setUrl] = useState('');
  const [disable, setDisable] = useState(true);
  const [networkList, setNetworkList] = useState<NetworkMeta[]>([]);
  const toast = useToast();
  const [errMsg, setErrMsg] = useState('');

  const handleChainIdChange = event => setChainId(event.target.value);
  const handleUrlChange = event => setUrl(event.target.value);

  const update = async () => {
    const res = await networkStorage.updateNetwork(chainId, url);
    if (res) {
        toast({
            title: "Success Updated",
            status: 'success',
            isClosable: true,
            duration: 3000,
            position: 'top',
        });
    } else {
        toast({
            title: 'ChainId already exists',
            status: 'error',
            isClosable: true,
            duration: 3000,
            position: 'top',
        }); 
    }
  }

  const remove = async () => {
    const res = await networkStorage.deleteNetwork(chainId);
    if (res) {
        toast({
            title: "Success Removed",
            status: 'success',
            isClosable: true,
            duration: 3000,
            position: 'top',
        });
        await networkStorage.getCustomNetwork().then(r => {
            setNetworkList(r);
            setChainId(r[0]?.chainId);
        });
    } else {
        toast({
            title: 'ChainId not exists',
            status: 'error',
            isClosable: true,
            duration: 3000,
            position: 'top',
        }); 
    }
  }

  useEffect(() => {
    networkStorage.getCustomNetwork().then(r => {
        setNetworkList(r);
        setChainId(r[0]?.chainId ?? '');
    });
  }, [])

  useEffect(()=>{
    if (url === '') {
        setDisable(true);
        setErrMsg('');
        return;
    }

    if (/https?:\/\//.test(url)) {
        setDisable(false);
        setErrMsg('');
    } else {
        setDisable(true);
        setErrMsg('Host String must include http:// or https://');
    }

  }, [url])

  useEffect(()=>{
    const res = networkList.find(r => r.chainId === chainId);
    if (res) {
        setUrl(res.masternodeHosts[0]);
    } else {
        setUrl('');
    }
  }, [chainId])

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Add Custom Network</Heading>
      </CardHeader>
      <CardBody p={0} mb="10px" width="100%" lineHeight={1.5}>
        <Alert status="error" hidden={errMsg === ''} mt="10px">
          <AlertIcon />
          <AlertTitle>{errMsg}</AlertTitle>
        </Alert>
        <Box mb="10px">
          <Text mb="8px">ChainId</Text>
          <Select onChange={handleChainIdChange} width="auto" size="sm">
            {networkList.map(m => (
              <option key={m.chainId} value={m.chainId}>
                {m.chainId}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text mb="8px">Master Node Url</Text>
          <Input value={url} onChange={handleUrlChange} placeholder="Enter the masternode url" size="sm" />
        </Box>
      </CardBody>
      <CardFooter width="100%" p='0' mt='10px'>
        <Stack flexGrow={1}>
          <Button colorScheme="red" isDisabled={disable} onClick={update}>
            Update
          </Button>
          <Button colorScheme="purple" onClick={remove}>
            Remove
          </Button>
          <Button colorScheme="blue" onClick={back}>
            Cancel
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default EditNetworkCard;
