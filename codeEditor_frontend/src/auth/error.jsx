import { useRouteError, Link } from 'react-router-dom';
import {  Heading, Text, Button, Flex } from '@chakra-ui/react';

export default function Error(){
  const error = useRouteError();
  return (
    <Flex direction="column" justify="center" align="center" textAlign="center" py={10} px={6} height="100vh" width="100vw">
      <Heading as="h2" size="xl" mb={4}>
        Oops! Something went wrong.
      </Heading>
      <Text color="gray.500" mb={6}>
        {error?.message || 'An unexpected error occurred.'}
      </Text>
      
      <Link to="/">
        <Button colorScheme="teal">Go Back Home</Button>
      </Link>
    </Flex>
  );
}