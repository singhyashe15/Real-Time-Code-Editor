import { useEffect, useRef, useState } from "react";
import { Flex, Box, Text, Button, HStack, IconButton, Tooltip, Select, useColorMode, useColorModeValue, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, useDisclosure, MenuList, MenuItem, Menu, MenuButton, Input, Avatar, InputGroup, InputRightElement, Center, useEditable, Card } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import { MdCallEnd, MdChat, MdPeople } from "react-icons/md";
import { FaPaperPlane, FaExclamationCircle } from "react-icons/fa"
import { Download } from 'lucide-react';
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Java, Cpp, C } from "../boilerplate/boiler.jsx";
import toast from 'react-hot-toast';
import { useSocket } from "../context/socket.jsx";

export default function Createroom() {
  const [user, setUser] = useState({ name: "", id: "" });
  const [text, setText] = useState("");
  const [msg, setMsg] = useState(null);
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState(null);
  const [show, setShow] = useState(false)
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isParticipantsOpen, onOpen: onParticipantsOpen, onClose: onParticipantsClose } = useDisclosure();
  const { isOpen: isChatsOpen, onOpen: onChatsOpen, onClose: onChatsClose } = useDisclosure();

  const participantsBtnRef = useRef();
  const chatsBtnRef = useRef();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socket = useSocket();
  const date = new Date();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, [])

  // real time chat system
  const handleSend = () => {
    if (socket && text.trim()) {
      socket.emit('chat', {
        roomId,
        name: user.name,
        id: user.id,
        text,
      });
      setText("");
    }
  };


  useEffect(() => {
    if (!socket) return;

    const handleChatReceive = (message) => {
      if (msg !== null) {
        setMsg((prev) => [...prev, message]);
      } else {
        setMsg(message);
      }
    };

    socket.on('received-chat', handleChatReceive);

    return () => {
      socket.off('received-chat', handleChatReceive); // cleanup to avoid duplicates
    };
  }, [socket]);

  // real time code
  useEffect(() => {
    if (socket) {
      socket.emit("code-room", roomId);

      socket.on("real-time-code-sync", (realTimeCode) => {
        console.log("real " + realTimeCode)
        setCode(realTimeCode);
      });

      return () => {
        socket.off("real-time-code-sync", (realTimeCode) => {
          console.log("real " + realTimeCode)
          setCode(realTimeCode);
        })
      }
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (socket && code) {
      const timeout = setTimeout(() => {
        socket.emit("real-time-code-sent", { code, roomId });
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [code]);

  const handleLanguage = (e) => {
    const { value } = e.target;
    setLanguage(value);
    if (value === 'cpp') {
      setCode(Cpp);
    } else if (value === 'java') {
      setCode(Java);
    } else if (value === 'c') {
      setCode(C)
    }
  }

  // handle the code
  const handleEditorChange = (value) => {
    setCode(value);
  }

  // download the code in local system
  const downloadCode = async () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "code.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  // fetch the total participants
  const fetchTotalparticipant = async () => {
    const server_url = import.meta.env.VITE_SERVER_URL;
    const res = await axios.get(`${server_url}/auth/fetchParticipant?roomId=${roomId}`);
    return res.status === 201 ? res.data : [];
  }

  const { data: totalMember } = useQuery({
    queryKey: ["participants"],
    queryFn: fetchTotalparticipant,
    staleTime: 1000
  })

  // handle the participants
  const handleRemove = async (id , name) =>{
    const server_url = import.meta.env.VITE_SERVER_URL;
    const res = await axios.put(`${server_url}/auth/deleteParticipant?roomId=${roomId}&id=${id}`);
    if(res.data.success){
      toast(`Admin removed ${name}`);
    }
  }
  // close the meetings
  const handleClose = () => {
    navigate("/", { replace: true });
  }

  return (
    <Flex height="100vh" width="100vw" bg="blue.700">
      <Drawer
        isOpen={isParticipantsOpen}
        placement='right'
        onClose={onParticipantsClose}
        finalFocusRef={participantsBtnRef}>
        <DrawerOverlay />
        <DrawerContent w="5rem" h="30rem" rounded="xl" mt="8" mr="4" >
          <DrawerCloseButton />
          <DrawerHeader>People</DrawerHeader>
          <DrawerBody>
            <Input placeholder="Search by the name" />
            <Flex direction="column" gap={2} w="auto" fontWeight="semibold" fontSize="lg" color="gray.400" >
              {totalMember?.member?.map((member) => {
                return (
                  <Box key={member._id} p="3" shadow="md" borderWidth="1px" borderRadius="md" mt="3" display="flex" alignItems="center" justifyContent="space-between">
                    <Text fontWeight="medium" color="gray.800">
                      @{member.name} {totalMember.adminId === member?._id && '(Host)'}
                    </Text>
                    {totalMember.adminId !== member?._id &&
                      <Menu>
                        <MenuButton
                          as={Button}
                          size="sm"
                          variant="ghost"
                          rightIcon={<FiMoreVertical />}
                        />
                        <MenuList>
                          <MenuItem onClick={() => handleRemove(member._id,member.name)}>
                            Remove
                          </MenuItem>
                        </MenuList>
                      </Menu>}
                  </Box>

                )
              })
              }
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Center: Code Editor */}
      <Box flex="1" bg={useColorModeValue("gray.100", "gray.800")} display="flex" flexDirection="column" width={['90%', '70%', '30%']}>
        {/* Navbar */}
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={2}
          bg={useColorModeValue("white", "gray.900")}
          boxShadow="sm"
        >
          <Text fontWeight="bold" fontSize="lg" color="teal.400">
            Code Editor
          </Text>

          <HStack spacing={4}>
            <Select placeholder="Select language" size="sm" bg={useColorModeValue("gray.200", "gray.700")} onChange={(e) => handleLanguage(e)}>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </Select>

            <Tooltip label="Download Code" hasArrow>
              <IconButton
                aria-label="Download Code"
                icon={<Download />}
                variant="outline"
                size="sm"
                onClick={() => downloadCode()}
              />
            </Tooltip>
            <IconButton
              size="sm"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              aria-label="Toggle Theme"
              onClick={toggleColorMode}
              variant="outline"
            />
          </HStack>
        </Flex>

        <Box flex="1" p={2} overflow="auto">
          <Box
            borderRadius="sm"
            height="90%"
            bg={useColorModeValue("gray.50", "gray.700")}
            p={4}
            color={useColorModeValue("black", "white")}
          >
            <Editor
              height="80vh"
              language={language}
              value={code}
              onChange={handleEditorChange}
            />
          </Box>
          {
            show &&
            <Card mt="-10" p="4" w="auto" h="24" rounded="lg" float="right" zIndex="banner" bgColor="yellow.900" >
              <Text color={colorMode === "light" ? "black" : "white"} >
                Meeting ID : {roomId}
              </Text>
            </Card>
          }
        </Box>
        <Flex justify="space-between" m="4">
          <HStack>
            <Text fontWeight="semibold">{date.getHours()} : {(date.getMinutes() % 10 === date.getMinutes()) ? `0${date.getMinutes()}` : date.getMinutes()} | {date.getFullYear()}</Text>
          </HStack>
          <HStack spacing="8">
            <IconButton
              icon={<MdChat size="1.5rem" />}
              variant="ghost"
              aria-label="Chats"
              onClick={onChatsOpen} ref={chatsBtnRef}
            />
            <IconButton
              icon={<MdCallEnd color="red" size="1.5rem" />}
              variant="ghost"
              aria-label="End the meetings"
              onClick={() => handleClose()}
            />
            <Box position="relative" display="inline-block">
              <Box
                position="absolute"
                top="-1"
                right="-1"
                w="5"
                h="5"
                fontSize="xs"
                rounded="full"
                bg="red.500"
                color="white"
                textAlign="center"
                lineHeight="20px"
                zIndex="1"
              >
                {totalMember?.member?.length}
              </Box>
              <IconButton
                icon={<MdPeople size="1.5rem" />}
                variant="ghost"
                aria-label="People"
                onClick={onParticipantsOpen}
                ref={participantsBtnRef}
              />
            </Box>
          </HStack>
          <HStack>
            <IconButton
              icon={<FaExclamationCircle size="1.5rem" />}
              variant="ghost"
              aria-label="info"
              onClick={() => setShow(!show)}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Right: Chat */}
      <Drawer
        isOpen={isChatsOpen}
        placement='right'
        onClose={onChatsClose}
        finalFocusRef={chatsBtnRef}
      >
        <DrawerOverlay />
        <DrawerContent w="5rem" h="40rem" rounded="xl" mt="8" mr="4" >
          <DrawerCloseButton />
          <DrawerHeader>In Call Messages</DrawerHeader>
          <DrawerBody>
            {msg !== null && msg?.map((msg) => {
              return (
                <Flex key={msg.id} mt='4' p="2" justify={msg.id === user.id ? "flex-end" : "flex-start"} position="relative" >
                  <Avatar name="Yashraj Singh" size="sm" cursor="pointer" mt="4" mr="2" />
                  <Flex shadow="md" rounded="xl" p="2" direction="column" >
                    <Text color="gray.400">@{msg?.name}</Text>
                    <Text my="2">
                      {msg.text}
                    </Text>
                  </Flex>
                </Flex>
              )
            })
            }
            {
              msg === null &&
              <Center>
                <Text color="gray.400">No Chat yet!!</Text>
              </Center>
            }
          </DrawerBody>
          <DrawerFooter>
            <InputGroup>
              <InputRightElement cursor="pointer" onClick={() => handleSend()}>
                <FaPaperPlane />
              </InputRightElement>
              <Input placeholder='Type here...' name="comment" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
            </InputGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}

