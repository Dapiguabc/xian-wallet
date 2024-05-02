import { Box, Flex, IconButton, Image, Select, useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Logo from '@assets/img/logo.png';
import useWallet from '@root/src/shared/hooks/useWallet';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import StartCard from './components/Cards/StartCard';
import CreateWalletCard from './components/Cards/CreateWalletCard';
import MainCard from './components/Cards/MainCard';
import { useLoginContext } from './context/loginContext';
import LoginCard from './components/Cards/loginCard';
import SendCard from './components/Cards/SendCard';
import ImportWalletCard from './components/Cards/ImportWalletCard';
import AddTokenCard from './components/Cards/AddTokenCard';
import IDE from './components/Cards/IDE';
import { FaMoon, FaRegSun } from 'react-icons/fa6';
import Setting from './components/Cards/Settings';
import networkStorage from '@root/src/shared/storages/networkStorage';
import ReceiveCard from './components/Cards/ReceiveCard';
import AdvancedTxCard from './components/Cards/AdvancedTxCard';
import AddNetworkCard from './components/Cards/AddNetworkCard';
import EditNetworkCard from './components/Cards/EditNetworkCard';

refreshOnUpdate('pages/ui');

export default function App() {
  const { currentNetwork, networkList } = useWallet();
  const [isOnline, setIsOnline] = useState(false);
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const { state } = useLoginContext();
  const { colorMode, toggleColorMode } = useColorMode();

  const checkNodeStatus = async () => {
    const res = await currentNetwork.ping();
    setIsOnline(res);
  };

  // check node status
  useEffect(() => {
    checkNodeStatus();
  }, [currentNetwork.host]);

  useEffect(() => {
    // to main card
    if (state.isFirst) {
      goto(0);
    } else {
      if (state.isLogin) {
        goto(2);
      } else {
        goto(3);
      }
    }
  }, [state.isFirst]);

  const goto = (num: number) => {
    setPrevStep(step);
    setStep(num);
  };
  const back = () => goto(prevStep);

  const renderSwitch = (arg: number) => {
    switch (arg) {
      case 0:
        return <StartCard next={goto} />;
      case 1:
        return <CreateWalletCard next={goto} back={back} />;
      case 2:
        return <MainCard next={goto} back={back} />;
      case 3:
        return <LoginCard next={() => goto(2)} />;
      case 4:
        return <SendCard back={back} />;
      case 5:
        return <ImportWalletCard next={goto} back={back} />;
      case 6:
        return <AddTokenCard back={back} />;
      case 7:
        return <IDE next={goto} back={() => goto(2)} />;
      case 8:
        return <Setting back={back} next={goto} />;
      case 9:
        return <ReceiveCard back={back} />;
      case 10:
        return <AdvancedTxCard back={back} />;
      case 11:
        return <AddNetworkCard back={back} />;
      case 12:
        return <EditNetworkCard back={back} />;
      default:
        return <></>;
    }
  };

  return (
    <Box h="100%">
      <Flex
        as="nav"
        w="100%"
        py="13px"
        px="31px"
        position="fixed"
        top={0}
        zIndex={200}
        justify="space-between"
        borderBottomWidth="1px">
        <Flex align="center">
          <Image src={Logo} boxSize="32px" objectFit="cover" mr="10px" />
          <Box fontWeight="500" fontSize="1.25rem" lineHeight="1.2">
            Xian Wallet
          </Box>
        </Flex>
        <Flex align="center" gap="10px">
          <Select
            onChange={e => networkStorage.changeNetwork(e.target.value)}
            size="sm"
            variant="unstyled"
            width="auto"
            defaultValue={currentNetwork.name}>
            {networkList.map(t => (
              <option key={t.chainId} value={t.chainId}>
                {t.chainId}
              </option>
            ))}
          </Select>
          {/* <Text fontSize='sm'>Node Status</Text> */}
          <Box as="span" w="10px" h="10px" bg={isOnline ? 'green' : 'red'} borderRadius="100%"></Box>
        </Flex>
      </Flex>
      <Flex h="100%" direction="column" py={20} justifyContent="space-around" align="center">
        {renderSwitch(step)}
      </Flex>
      <IconButton
        position="fixed"
        bottom="0"
        right="0"
        mr="10px"
        mb="10px"
        onClick={toggleColorMode}
        aria-label="IDE"
        size="lg"
        icon={colorMode === 'light' ? <FaMoon size="20px" /> : <FaRegSun size="20px" />}
      />
    </Box>
  );
}
