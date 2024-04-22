import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Stack,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import useWallet from '@root/src/shared/hooks/useWallet';
import { useEffect } from 'react';

interface Props {
  back: () => void;
}

const ReceiveCard: React.FC<Props> = ({ back }) => {
  const { onCopy, setValue, hasCopied } = useClipboard('');
  const { currentAccount } = useWallet();
  const toast = useToast();

  const clipboard = () => {
    onCopy();
  };

  useEffect(() => {
    setValue(currentAccount);
  }, []);

  useEffect(() => {
    if (hasCopied) {
      toast({
        title: `Copied to clipboard`,
        status: 'success',
        isClosable: true,
        duration: 3000,
        position: 'top',
      });
    }
  }, [hasCopied]);

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Receive</Heading>
      </CardHeader>
      <CardBody p={0} mb="20px" width="100%" lineHeight={1.5}>
        <Text mb="10px">Receive tokens from another wallet address.</Text>
        <Text mb="20px">Your Address</Text>
        <Text
          onClick={clipboard}
          cursor="pointer"
          color="blue.500"
          _hover={{ textDecoration: 'underline' }}
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflow="hidden">
          {currentAccount}
        </Text>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="blue" onClick={back}>
            Back
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default ReceiveCard;
