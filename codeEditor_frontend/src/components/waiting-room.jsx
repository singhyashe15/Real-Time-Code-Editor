import { Flex, Heading, Text, Spinner, Card, Icon } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaCode } from "react-icons/fa";
export default function WaitingRoom() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" justify="center" align="center" textAlign="center" py={10} px={6} height="100vh" width="100vw">
      <Card p="8" align="center">
        <Icon as={FaCode} color="green.500" boxSize={8} />
        <Heading as="h1" size="2xl" my={4}>
          <Spinner size="xl" color="red.500" borderWidth="4px" />
        </Heading>
        <Text fontSize="lg" color="green.600" fontWeight="semibold" mb={6}>
          Waiting Until admin let's you in..
        </Text>
      </Card>
    </Flex>
  )
}