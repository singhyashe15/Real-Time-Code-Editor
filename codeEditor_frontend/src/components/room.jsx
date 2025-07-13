import { useEffect, useRef, useState } from "react";
import { Flex, Box, Text, Button, HStack, IconButton, Tooltip, Select, useColorMode, useColorModeValue, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, useDisclosure, MenuList, MenuItem, Menu, MenuButton, Input, Avatar, InputGroup, InputRightElement, Center, Card, VStack, Icon } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import { MdCallEnd, MdChat, MdPeople } from "react-icons/md";
import { Download, Info, SquareMenu, Copy, Send } from 'lucide-react';
import Editor from "@monaco-editor/react";
import { Java, Cpp, C } from "../boilerplate/boiler.jsx";
import toast from 'react-hot-toast';
import { useSocket } from "../context/socket.jsx";

export default function Createroom() {
  const [user, setUser] = useState();
  const [fetchUser, setFetchUser] = useState([]);
  const [allowUser, setAllowUser] = useState([]);
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
  let storedUser = "";

  useEffect(() => {
    function fetchData() {
      storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser)
      }
    }

    fetchData();
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

  useEffect(() => {
    if (socket) {
      // Handle full list sent to the joining user
      socket.on("initial-participants", (participantList) => {
        setFetchUser(participantList);
      });

      // Handle updates from other joining users
      socket.on("update-participant", ({ id, name, adminId }) => {
        setFetchUser((prev) => {
          const exists = prev.some((user) => user.id === id);
          if (!exists) {
            return [...prev, { id, name, adminId }];
          }
          return prev;
        });
      });

      return () => {
        socket.off("initial-participants");
        socket.off("update-participant");
      };
    }
  }, [socket])

  // real time code
  useEffect(() => {
    if (socket) {
      const userId = storedUser?.id;
      const name = storedUser?.name;
      socket.emit("code-room", { roomId, userId, name });

      socket.on("real-time-code-sync", (realTimeCode) => {
        setCode(realTimeCode);
      });

      socket.on("join-request", ({ name, id, requestId, adminSelfId }) => {
        toast("Someone wants to enter");
        setAllowUser((prev) => {
          const alreadyExists = prev.some((user) => user.id === id);
          if (alreadyExists) return prev;
          return [...prev, { id, name, requestId, adminId: adminSelfId }];
        });
      })

      return () => {
        socket.off("real-time-code-sync", (realTimeCode) => {
          setCode(realTimeCode);
        });
      }
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (socket && code) {
      const timeout = setTimeout(() => {
        console.log(code)
        socket.emit("real-time-code-sent", { code, roomId });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [code]);

  const handleLanguage = (lang) => {
    setLanguage(lang);
    if (lang === 'cpp') {
      setCode(Cpp);
    } else if (lang === 'java') {
      setCode(Java);
    } else if (lang === 'c') {
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

  // close the meetings
  const handleClose = (id) => {
    const updatedUser = fetchUser.filter((user) => user.id !== id);
    setFetchUser(updatedUser);

    navigate("/", { replace: true });
  }

  // handle waiting users
  const handleUser = (userId, requestId, isApproved, name, adminId) => {
    if (isApproved) {
      const filterUser = allowUser.filter((user) => user.id === userId);
      const userToAdd = filterUser[0];
      setFetchUser((prev) => {
        return [
          ...prev, userToAdd
        ]
      }
      )
    }
    const updatedUser = allowUser.filter((user) => user.id !== userId);
    setAllowUser(updatedUser);
    socket.emit("respond-join-request", { requestId, isApproved, userId, name, adminId, roomId });
  }

  const handleCopy = async (roomId) => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast('RoomId copied');
    } catch (err) {
      toast('Failed to copy roomID: ', err);
    }
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
            {
              allowUser.length > 0 &&
              <Text fontWeight="semibold">Waiting to Join</Text>
            }
            {
              allowUser?.map((user) => {
                return (
                  <VStack key={user?.id} p="4">
                    <Text textAlign="left">{user?.name}</Text>
                    <HStack>
                      <Button onClick={() => handleUser(user?.id, user?.requestId, true, user?.name, user?.adminId)}>Allow</Button>
                      <Button onClick={() => handleUser(user?.id, user?.requestId, false)}>Deny</Button>
                    </HStack>
                  </VStack>

                )
              })
            }
            <Flex direction="column" gap={2} w="auto" fontWeight="semibold" fontSize="lg" color="gray.400" >
              {fetchUser?.map((member) => {
                return (
                  <Box key={member.id} p="3" shadow="md" borderWidth="1px" borderRadius="md" mt="3" display="flex" alignItems="center" justifyContent="space-between">
                    <Text fontWeight="medium" color={colorMode === 'light' ? "black" : "white"}>
                      @{member.name} {member?.adminId === member?.id && '(Host)'}
                    </Text>
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

        <Box flex="1" p={2} height="90%" overflow="hidden" bg={useColorModeValue("gray.50", "gray.700")} color={useColorModeValue("black", "white")} >
          {/* <Box
            borderRadius="sm"
            height="90%"
            bg={useColorModeValue("gray.50", "gray.700")}
            p={4}
            color={useColorModeValue("black", "white")}
          > */}
          <Editor
            height="80vh"
            language={language}
            value={code}
            onChange={handleEditorChange}
          />
          {/* </Box> */}
          {
            show &&
            <Card mt="-32" p="4" w="auto" h="24" rounded="lg" float="right" zIndex="999" bgColor="yellow.900" >
              <HStack spacing="4" p="2">
                <Text color={colorMode === "light" ? "black" : "white"}  >
                  Meeting ID : {roomId}
                </Text>
                <Icon as={Copy} cursor="pointer" onClick={() => handleCopy(roomId)} />
              </HStack>
              <Text p="2">Share this roomId</Text>
            </Card>
          }
        </Box>
        <Flex justify="space-between" m="8">
          <HStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<SquareMenu size="1.5rem" />}
                variant="ghost"
                aria-label="Language Menu"
              />
              <MenuList p="2">
                <MenuItem onClick={() => handleLanguage('c')}>C</MenuItem>
                <MenuItem onClick={() => handleLanguage('cpp')}>C++</MenuItem>
                <MenuItem onClick={() => handleLanguage('java')}>Java</MenuItem>
              </MenuList>
            </Menu>

          </HStack>
          <HStack spacing="8">
            <IconButton
              icon={<MdChat size="1.5rem" />}
              variant="ghost"
              aria-label="Chats"
              onClick={onChatsOpen} ref={chatsBtnRef}
            />
            <IconButton
              icon={<MdCallEnd color="white" size="1.5rem" />}
              variant="ghost"
              bg="red"
              aria-label="End the meetings"
              onClick={() => handleClose(user?.id)}
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
                {fetchUser?.length}
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
              icon={<Info size="1.5rem" />}
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
                <Flex key={Math.random(Number(msg.id))} mt='4' p="2" justify={msg.id === user.id ? "flex-end" : "flex-start"} position="relative" >
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
                <Send />
              </InputRightElement>
              <Input placeholder='Type here...' name="comment" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
            </InputGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}

