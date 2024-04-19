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
  Stack,
  Text,
} from '@chakra-ui/react';
import { cardStyle } from './cardStyle';
import { useCallback, useEffect, useState } from 'react';
import Xian from 'xian-js';
import accountStorage from '@root/src/shared/storages/accountStorage';
import { useLoginContext } from '@pages/ui/context/loginContext';

interface Props {
  next?: (num: number) => void;
  back?: () => void;
}

const CreateWalletCard: React.FC<Props> = ({ next, back }) => {
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [passwordValueErr, setPasswordValueErr] = useState(false);
  const [confirmValueErr, setConfirmValueErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const { dispatch } = useLoginContext();

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => setPasswordValue(event.target.value);
  const handleConfirmChange = (event: React.ChangeEvent<HTMLInputElement>) => setConfirmValue(event.target.value);

  useEffect(() => {
    if (passwordValue.length < 6 && passwordValue !== '') {
      setPasswordValueErr(true);
      setErrMsg('Password must be at least 6 characters long!');
      return;
    } else {
      setPasswordValueErr(false);
      setErrMsg('');
    }

    if (passwordValue !== confirmValue && confirmValue !== '') {
      setConfirmValueErr(true);
      setErrMsg('Password do not match!');
    } else {
      setConfirmValueErr(false);
      setErrMsg('');
    }
  }, [passwordValue, confirmValue]);

  const confirm = useCallback(
    async (password: string) => {
      const newWallet = Xian.Wallet.new_wallet_bip39();
      await accountStorage.set({
        currentAccount: newWallet.vk,
        accountList: [
          {
            publicKey: newWallet.vk,
            encryptedPrivateKey: Xian.Utils.encryptStrHash(password, newWallet.sk),
          },
        ],
      });

      dispatch({
        type: 'update',
        payload: {
          isFirst: false,
          password: password,
          isLogin: true,
        },
      });
      next(2);
    },
    [errMsg],
  );

  return (
    <Card {...cardStyle}>
      <CardHeader p={0} mb="20px">
        <Heading size="lg">Create a Wallet</Heading>
      </CardHeader>
      <CardBody p={0} mb="10px" lineHeight={1.5}>
        To create a wallet, please enter a password. This password will be used to encrypt your private key. Make sure
        to remember it, as it{' '}
        <Text as="span" fontWeight={700}>
          cannot be recovered
        </Text>
        . After creating a wallet, remember to export your private key in the settings for backup.
        <Alert status="error" hidden={errMsg === ''}>
          <AlertIcon />
          <AlertTitle>{errMsg}</AlertTitle>
        </Alert>
        <Box my="10px">
          <Text mb="8px">Password</Text>
          <Input
            value={passwordValue}
            onChange={handlePasswordChange}
            placeholder="Enter a password"
            size="sm"
            type="password"
            isInvalid={passwordValueErr}
            errorBorderColor="crimson"
          />
        </Box>
        <Box>
          <Text mb="8px">Confirm Password</Text>
          <Input
            value={confirmValue}
            type="password"
            onChange={handleConfirmChange}
            placeholder="Confirm a password"
            size="sm"
            isInvalid={confirmValueErr}
            errorBorderColor="crimson"
          />
        </Box>
      </CardBody>
      <CardFooter width="100%" p={0}>
        <Stack flexGrow={1}>
          <Button colorScheme="red" disabled={errMsg !== ''} onClick={() => confirm(passwordValue)}>
            Create Wallet
          </Button>
          <Button colorScheme="blue" onClick={back}>
            Back
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default CreateWalletCard;
