import { Flex, Heading, Text, Spinner, Card, Icon } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCode } from "react-icons/fa";
import { useEffect } from "react";
import { useSocket } from "../context/socket.jsx";
import toast from "react-hot-toast";

export default function WaitingRoom() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { roomId } = useParams();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (socket) {
      const name = user.name;
      const id = user.id;

      socket.emit('request-join-room', { roomId, name, id });

      socket.on("join-approved", () => {
        navigate(`/r/${roomId}`, { replace: true });
      });

      socket.on("join-denied", ({ reason }) => {
        toast.error(reason || "Access denied");
        navigate('/', { replace: true });
      });

      return () => {
        socket.off("join-approved");
        socket.off("join-denied");
      };
    }
  }, [socket])

  return (
    <Flex direction="column" justify="center" align="center" textAlign="center" py={10} px={6} height="100vh" width="100vw">
      <Card p="8" align="center">
        <Icon as={FaCode} color="green.500" boxSize={8} />
        <Heading as="h1" size="2xl" my={4}>
          <Spinner size="xl" color="red.500" borderWidth="4px" />
        </Heading>
        <Text fontSize="lg" color="green.600" fontWeight="semibold" mb={6}>
          Wait Until admin let's you in..
        </Text>
      </Card>
    </Flex>
  )
}