import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Stack,
  Text,
  Input,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import { useState } from 'react';
import { useLoginContext } from '../../context/loginContext';
import accountStorage from '@root/src/shared/storages/accountStorage';

interface Props {
  next: () => void;
}

const LoginCard: React.FC<Props> = ({ next }) => {
  const [passwordValue, setPasswordValue] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const { dispatch } = useLoginContext();
  const passwordError = errMsg !== '';

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => setPasswordValue(event.target.value);

  const unlock = async () => {
    const encryptedPrivateKey = await accountStorage.getCurrentAccountVK(passwordValue);
    if (encryptedPrivateKey) {
      dispatch({
        type: 'update',
        payload: {
          isLogin: true,
          password: passwordValue,
        },
      });
      next();
    } else {
      setErrMsg('Incorrect password!');
    }
  };

  const remove = async () => {
    const encryptedPrivateKey = await accountStorage.getCurrentAccountVK(passwordValue);
    if (encryptedPrivateKey) {
      // remove accounts
      accountStorage.clear();
      // update login state
      dispatch({
        type: 'update',
        payload: {
          isLogin: false,
          password: undefined,
          isFirst: true,
        },
      });
    } else {
      setErrMsg('Incorrect password!');
    }
  };

  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Enter your password</Heading>
      </CardHeader>
      <CardBody p={0} mb="16px" width="100%" fontWeight={500} lineHeight={1.5}>
        <Text mb="10px">Please enter your password to unlock your wallet.</Text>
        <Alert status="error" hidden={!passwordError}>
          <AlertIcon />
          <AlertTitle>{errMsg}</AlertTitle>
        </Alert>
        <Box>
          <Text mb="8px">Password</Text>
          <Input
            type="password"
            value={passwordValue}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            size="md"
            isInvalid={passwordError}
            errorBorderColor="crimson"
          />
        </Box>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="red" onClick={unlock}>
            Unlock Wallet
          </Button>
          <Button colorScheme="blue" onClick={remove}>
            Remove Wallet
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
