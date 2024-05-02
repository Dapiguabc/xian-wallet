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

const AddNetworkCard: React.FC<Props> = ({ back }) => {
  const [chainId, setChainId] = useState('');
  const [url, setUrl] = useState('');
  const [disable, setDisable] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const toast = useToast();

  const handleChainIdChange = event => setChainId(event.target.value);
  const handleUrlChange = event => setUrl(event.target.value);

  const add = async () => {
    const res = await networkStorage.addNetwork({
        chainId: chainId,
        masternodeHosts: [url],
    });
    if (res) {
        toast({
            title: "Success Added",
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

  useEffect(()=>{
    if (chainId === '') {
        setDisable(true);
    } else {
        setDisable(false);
    }

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
  }, [chainId, url])


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
          <Input value={chainId} onChange={handleChainIdChange} placeholder="Enter the chain id" size="sm" />
        </Box>
        <Box>
          <Text mb="8px">Master Node Url</Text>
          <Input value={url} onChange={handleUrlChange} placeholder="Enter the masternode url" size="sm" />
        </Box>
      </CardBody>
      <CardFooter width="100%" p='0' mt='10px'>
        <Stack flexGrow={1}>
          <Button colorScheme="red" isDisabled={disable} onClick={add}>
            Add
          </Button>
          <Button colorScheme="blue" onClick={back}>
            Cancel
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default AddNetworkCard;
