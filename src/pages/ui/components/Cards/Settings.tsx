import { Button, Card, CardBody, CardFooter, CardHeader, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import accountStorage from '@root/src/shared/storages/accountStorage';
import { useEffect, useState } from 'react';
import { useLoginContext } from '../../context/loginContext';

interface Props {
    back: () => void;
}

const Setting: React.FC<Props> = ({ back }) => {

    const { state } = useLoginContext();
    const [url, setUrl] = useState('');

   const makeTextFile = async function () {
        const privateKey = await accountStorage.getCurrentAccountVK(state.password);
        const data = new Blob([privateKey], {type: 'text/plain'});
        const textFile = window.URL.createObjectURL(data);
        setUrl(textFile);
    };

    useEffect(() => {
        makeTextFile();
    },[state.password])

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Settings</Heading>
      </CardHeader>
      <CardBody p={0} mb="20px" width='100%' lineHeight={1.5}>
       <Text mb='10px'>Private Key</Text>
       <Text mb='20px'>You can export your private key to back it up. If you lose your private key, you will lose access to your wallet and funds.</Text>
       <Link color='#007bff' download='privateKey.txt' href={url}>Export Private Key</Link>  
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="blue" onClick={back}>Back</Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default Setting;
