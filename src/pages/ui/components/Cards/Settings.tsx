import { Button, Card, CardBody, CardFooter, CardHeader, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import accountStorage from '@root/src/shared/storages/accountStorage';
import { useEffect, useState } from 'react';
import { useLoginContext } from '../../context/loginContext';
import networkStorage from '@root/src/shared/storages/networkStorage';

interface Props {
  next: (num: number) => void;
  back: () => void;
}

const Setting: React.FC<Props> = ({ next }) => {
  const { state } = useLoginContext();
  const [url, setUrl] = useState('');
  const [disableEdit, setDisableEdit] = useState(true);

  const makeTextFile = async function () {
    const privateKey = await accountStorage.getCurrentAccountVK(state.password);
    const data = new Blob([privateKey], { type: 'text/plain' });
    const textFile = window.URL.createObjectURL(data);
    setUrl(textFile);
  };

  useEffect(() => {
    makeTextFile();
  }, [state.password]);

  useEffect(() => {
    networkStorage.getCustomNetwork().then(r => {
        if (r && r.length > 0) {
            setDisableEdit(false);
        } else {
            setDisableEdit(true);
        }
    });
  }, []); 

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Settings</Heading>
      </CardHeader>
      <CardBody p={0} mb="20px" width="100%" lineHeight={1.5}>
        <Text mb="10px">Private Key</Text>
        <Text mb="20px">
          You can export your private key to back it up. If you lose your private key, you will lose access to your
          wallet and funds.
        </Text>
        <Link color="#007bff" download="privateKey.txt" href={url}>
          Export Private Key
        </Link>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="red" onClick={() => next(11)}>
            Add Custom Network
          </Button>
          <Button colorScheme="purple" isDisabled={disableEdit} onClick={() => next(12)}>
            Edit Custom Network
          </Button>
          <Button colorScheme="blue" onClick={() => next(2)}>
            Back
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default Setting;
