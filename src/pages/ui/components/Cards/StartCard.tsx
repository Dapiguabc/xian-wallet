import { Button, Card, CardFooter, CardHeader, Heading, Stack } from '@chakra-ui/react';
import { cardStyle } from './cardStyle';

interface Props {
  next: (num: number) => void;
}

const StartCard: React.FC<Props> = ({ next }) => {
  return (
    <Card {...cardStyle}>
      <CardHeader>
        <Heading size="md">Getting Start</Heading>
      </CardHeader>
      <CardFooter width="100%">
        <Stack flexGrow={1}>
          <Button colorScheme="red" onClick={() => next(1)}>
            Create a Wallet
          </Button>
          <Button colorScheme="blue" onClick={() => next(5)}>
            Import a Wallet
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
};

export default StartCard;
