import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { cardStyle } from './cardStyle';
import { useEffect } from 'react';
import useWallet from '@root/src/shared/hooks/useWallet';
import { FaPaperPlane, FaDownload, FaRegFileCode, FaGear, FaRotateRight} from 'react-icons/fa6';
import historyStorage from '@root/src/shared/storages/historyStorage';
import helper from '../../../../helper';
import useStorage from '@root/src/shared/hooks/useStorage';
import tokenStorage from '@root/src/shared/storages/tokenStorage';

interface Props {
  next: (num: number) => void;
  back: () => void;
}

const TokenCard: React.FC<TokenMeta & Props> = ({ contract, name, amount, symbol, next }) => {
  return (
    <Box border="1px solid var(--card-border-color)" borderRadius="5px" p="10px" mb='10px'>
      <Flex mt="5px" mb="15px" fontWeight="bold" alignItems='center'>
        {name} ({symbol})         
            <IconButton
            onClick={() => tokenStorage.refresh(contract)}
            variant="link"
            color="#007bff"
            aria-label="refresh"
            isRound={true}
            justifyContent='flex-start'
            size="md"
            minW='10px'
            ml='10px'
            icon={<FaRotateRight />}
            />
            {
                contract === 'currency' ? <></> : <IconButton
                onClick={() => tokenStorage.delete(contract)}
                variant="link"
                color="#007bff"
                aria-label="refresh"
                isRound={true}
                justifyContent='flex-start'
                size="md"
                minW='10px'
                ml='10px'
                icon={<DeleteIcon />}
                />
            }
      </Flex>
      <Box mt="5px" mb="15px">
        {amount}
      </Box>
      <Flex my="5px" gap="10px">
        <Button flexBasis="50%" leftIcon={<FaPaperPlane />} onClick={() => next(4)}>
          Send
        </Button>
        <Button flexBasis="50%" leftIcon={<FaDownload />} onClick={() => next(9)}>
          Receive
        </Button>
      </Flex>
    </Box>
  );
};

const HistoryCard: React.FC<HistoryMeta> = props => {
  const { hash, contract, method, status, timestamp } = props;
  return (
    <Box border="1px solid var(--card-border-color)" borderRadius="5px" p="10px">
      <Box textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
        {hash}
      </Box>
      <Box>{contract}</Box>
      <Box>{method}</Box>
      <Box>{status}</Box>
      <Box>{helper.getLocalTime(timestamp)}</Box>
    </Box>
  );
};

const MainCard: React.FC<Props> = ({ next, back }) => {
  const toast = useToast();
  const { onCopy, setValue, hasCopied } = useClipboard('');
  const { currentAccount } = useWallet();
  const tokenData = useStorage(tokenStorage);
  const historyData = useStorage(historyStorage);

  const tokenList = tokenData[currentAccount] ?? [];

  const clipboard = () => {
    onCopy();
  };

  useEffect(() => {
    setValue(currentAccount);
    tokenStorage.addToken('currency');
    tokenStorage.refreshAll();
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
      <CardHeader p={0} mb="20px" width="100%">
        <Flex justifyContent="space-between">
          <IconButton
            justifyContent="flex-start"
            onClick={() => next(7)}
            variant="link"
            color="#007bff"
            aria-label="IDE"
            size="lg"
            icon={<FaRegFileCode size="20px" />}
          />
          <Heading size="lg">Overview</Heading>
          <IconButton
            onClick={() => next(8)}
            justifyContent="flex-end"
            variant="link"
            color="#007bff"
            aria-label="IDE"
            size="lg"
            icon={<FaGear size="20px" />}
          />
        </Flex>
      </CardHeader>
      <CardBody p={0} mb="10px" width="100%" lineHeight={1.5}>
        <Text mb="10px">This is your Xian wallet. You can use it to send and receive tokens on the Xian Network.</Text>
        <Box mb="20px">
          <Text fontWeight={700}>Wallet Address:</Text>
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
        </Box>
        <Tabs variant="unstyled">
          <TabList justifyContent="center">
            <Tab>Tokens</Tab>
            <Tab>Local Activity</Tab>
          </TabList>
          <TabIndicator mt="-1.5px" height="2px" bg="blue.600" borderRadius="1px" />
          <TabPanels py="20px">
            <TabPanel p={0}>
              <Box mb="20px" textAlign="center">
                <Text display="inline-block" textAlign="center" fontSize="xl" fontWeight="bold">
                  Tokens 
                </Text>

                <IconButton
                  onClick={() => next(6)}
                  float="right"
                  variant="solid"
                  color="#007bff"
                  aria-label="add token"
                  isRound={true}
                  size="xs"
                  icon={<AddIcon />}
                />
              </Box>
              {tokenList.map(item => (
                <TokenCard key={item.contract} {...item} next={next} back={back} />
              ))}
            </TabPanel>
            <TabPanel p={0}>
              <Box mb="20px" textAlign="center">
                <Text display="inline-block" textAlign="center" fontSize="xl" fontWeight="bold">
                  Local Activity
                </Text>
                <IconButton
                  onClick={() => historyStorage.clear()}
                  float="right"
                  variant="solid"
                  color="#007bff"
                  aria-label="delete history"
                  isRound={true}
                  size="xs"
                  icon={<DeleteIcon />}
                />
              </Box>
              <Flex direction="column" gap="20px">
                {historyData?.map(item => <HistoryCard key={item.timestamp} {...item} />)}
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
      <CardFooter p='0' width='100%'>
        <IconButton
            onClick={() => tokenStorage.refreshAll()}
            variant="link"
            color="#007bff"
            aria-label="refresh"
            isRound={true}
            justifyContent='flex-start'
            size="lg"
            icon={<RepeatIcon />}
        />
      </CardFooter>
    </Card>
  );
};

export default MainCard;
