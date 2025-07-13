import { useState } from "react";
import { Box, Button, Card, Flex, Icon, Image, Input, Spinner, Text } from "@chakra-ui/react";
import random from "random-string-alphanumeric-generator";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaCode } from "react-icons/fa";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roomId') {
      setRoomId(value);
    } else if (name === 'userName') {
      setUserName(value);
    }
  }

  const createRoom = () => {
    const generatedId = random.customRandomString(24, "lowercase");
    setRoomId(generatedId);
  }

  const enterRoom = async () => {
    try {
      setLoading(true);
      const server_url = import.meta.env.VITE_SERVER_URL;
      const token = localStorage.getItem("token");

      const res = await axios.post(`${server_url}/auth/create-room`, { roomId, userName }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })

      if (res.data.success) {
        if (res.data.admin === true) {
          toast.success(res.data.msg);
          navigate(`/r/${roomId}`, { replace: true });
        } else {
          navigate(`/waiting-room/r/${roomId}`, { replace: true })
        }
      }

    } catch (error) {
      toast.error(error.response.data.msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex height="100vh" width="100vw" justify="center" align="center" p={4}>
      <Flex
        borderRadius="xl"
        overflow="hidden"
        maxW="1000px"
      >
        {/* Left Image */}
        <Box
          flex="1"
          bgGradient="linear(to-br, purple.500, pink.400)"
          display={["none", "none", "block"]}
        >
          <Image
            src="/programmer-night.jpg"
            alt="Fitness girl"
            objectFit="cover"
            w="100%"
            h="100%"
          />
        </Box>

        {/* Right Join Card */}
          <Card
            width={['90%', '100%', '40%']}
            p="8"
            bg="whiteAlpha.100"
            border="2px solid"
            borderColor="blue.400"
            borderRadius="2xl"
            backdropFilter="blur(12px)"
          >
            <Flex justify="center" mb={4}>
              <Icon as={FaCode} color="green.400" boxSize={8} />
            </Flex>

            <Text fontWeight="bold" fontSize="2xl" color="teal.300" textAlign="center" mb={4}>
              Real-Time Code Editor
            </Text>

            <Text fontWeight="medium" fontSize="md" mb={2} color="white">
              Paste invitation Room ID
            </Text>

            <Box display="flex" flexDirection="column" gap={4} mb={4}>
              <Input
                placeholder="ROOM ID"
                fontWeight="semibold"
                color="white"
                bg="gray.700"
                borderColor="gray.500"
                name="roomId"
                value={roomId}
                onChange={handleChange}
                _placeholder={{ color: "gray.400" }}
              />
              <Input
                placeholder="USERNAME"
                fontWeight="semibold"
                color="white"
                bg="gray.700"
                borderColor="gray.500"
                name="userName"
                value={userName}
                onChange={handleChange}
                _placeholder={{ color: "gray.400" }}
              />
            </Box>

            <Button
              width="full"
              bg="green.400"
              fontSize="lg"
              rounded="full"
              _hover={{ bg: "green.500" }}
              color="white"
              onClick={enterRoom}
              leftIcon={loading && <Spinner size="md" />}
            >
              {loading ? "Wait..." : "Join"}
            </Button>

            <Text fontWeight="light" textAlign="right" mt={4} color="gray.300">
              Create a new Room ID
            </Text>
            <Text
              fontWeight="semibold"
              color="teal.400"
              onClick={createRoom}
              cursor="pointer"
              textAlign="right"
              _hover={{ textDecoration: "underline" }}
            >
              Here
            </Text>
          </Card>
      </Flex>
    </Flex>
  )
}