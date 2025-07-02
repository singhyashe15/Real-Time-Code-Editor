import { useState, useEffect } from "react";
import { Box, Button, Card, Flex, Icon, IconButton, Input, Spinner, Text } from "@chakra-ui/react";
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
        toast.success(res.data.msg);
        // if (res.data.admin === true) {
        navigate(`/r/${roomId}`, { replace: true });
        // } else {
        // navigate('/waiting-room', { replace: true })
        // }
      }

    } catch (error) {
      toast.error(error.response.data.msg)
    } finally {
      setLoading(false)
    }
  }

  // border="2px solid" borderColor="blue.400" borderRadius="lg" boxShadow="md"
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" width="100vw" px="4"  >
      <Card width={['90%', '70%', '30%']} p="8" background="transparent" border="2px solid" borderColor="blue.400" borderRadius="lg" boxShadow="xl">
        <Flex justify="center" >
          <Icon as={FaCode} color="green.500" boxSize={8} align="center" />
        </Flex>
        <Text fontWeight="semibold" fontSize="xl" color="green.500" textAlign="center" my="4" >
          Real Time Code Editor
        </Text>
        <Text fontWeight="semibold" fontSize="lg" textAlign="left" my="4">
          Paste invitation Room Id
        </Text>
        <Box w="100%" display="flex" flexDirection="column" gap="3">
          <Input placeholder="ROOM ID" fontWeight="semibold" color="black" name="roomId" value={roomId} onChange={handleChange} />
          <Input placeholder="USERNAME" fontWeight="semibold" color="black" name="userName" value={userName} onChange={handleChange} />
        </Box>

        <Button px="8" py="4" left="0" my="2" bg="green.400" fontSize="lg" rounded="full" _hover={{ bg: "green.200" }}
          onClick={enterRoom}
          leftIcon={loading && <Spinner size="md" />}>
          {loading ? "Wait..." : "Join"}
        </Button>

        <Text fontWeight="thin" textAlign="right" color="white">
          Create a new Room Id
        </Text>
        <Text fontWeight="semibold" color="teal.500" onClick={createRoom} cursor="pointer" textAlign="right" >Here</Text>
      </Card>

      {/* ["Javascript","Cpp"].map()</Card> */}
    </Box>
  )
}