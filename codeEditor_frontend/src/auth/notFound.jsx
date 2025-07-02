
import { Link } from 'react-router-dom';
import { Flex, Heading, Text, Button } from '@chakra-ui/react';

export default function NotFound(){
  return(
    <Flex direction="column" justify="center" align="center" textAlign="center" py={10} px={6} height="100vh" width="100vw">
      <Heading as="h1" size="2xl" mb={4}>
        404
      </Heading>
      <Text fontSize="lg" color="gray.600" mb={6}>
        The page you're looking for doesn't exist.
      </Text>
      <Link to="/">
        <Button colorScheme="teal">Go to Homepage</Button>
      </Link>
    </Flex>
  )
}