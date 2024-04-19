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
} from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import { useEffect, useState } from 'react';
import { useRequest } from '@root/src/shared/hooks/useRequest';
import tokenStorage from '@root/src/shared/storages/tokenStorage';

interface Props {
  back: () => void;
}

const AddTokenCard: React.FC<Props> = ({ back }) => {
  const [contract, setContract] = useState('');
  const toast = useToast();

  const handleContractChange = event => setContract(event.target.value);

  const addToken = async () => {
    return await tokenStorage.addToken(contract);
  };

  const { loading, data, err, run } = useRequest(addToken, {
    manual: true,
  });

  useEffect(() => {
    if (err) {
      toast({
        title: data.message,
        status: 'error',
        isClosable: true,
        duration: 3000,
        position: 'top',
      });
    }
    if (data) {
      if (data.success) {
        toast({
          title: data.message,
          status: 'success',
          isClosable: true,
          duration: 3000,
          position: 'top',
        });
      } else {
        toast({
          title: data.message,
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
        <Heading size="md">Add to token list</Heading>
      </CardHeader>
      <CardBody p={0} mb="10px" width="100%" lineHeight={1.5}>
        Add a token to the list of tokens you can interact with.
        <Box>
          <Text mb="8px">Contract</Text>
          <Input value={contract} onChange={handleContractChange} placeholder="Enter the token contract" size="sm" />
        </Box>
      </CardBody>
      <CardFooter width="100%">
        <Stack flexGrow={1}>
          <Button colorScheme="red" onClick={run} isLoading={loading}>
            Add Token
          </Button>
          <Button colorScheme="blue" onClick={back}>
            Cancel
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default AddTokenCard;
