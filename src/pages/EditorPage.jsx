import React, { useEffect, useRef, useState } from "react";
import EditorAside from "../components/EditorSidebar";
import ChatBar from "../components/ChatBar";
import MainEditor from "../components/MainEditor";
import { initSocket } from "../socketSetup";
import Actions from "../EventActions";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { space } from "postcss/lib/list";

const EditorPage = () => {
  const location = useLocation(); // Get the current location object from react-router-dom
  const reactNavigator = useNavigate(); // Get the navigate function from react-router-dom
  const { id } = useParams(); // Get the id parameter from the URL
  const socketRef = useRef(null); // Create a mutable ref object to store the socket connection
  const [clients, setClients] = useState([]); // Initialize the clients state with an empty array
  const syncCodeRef = useRef(null); // Create a mutable ref object to store the synced code
  const [showChatBar, setShowChatBar] = useState(true);

  const toggleChatBar = () => {
    setShowChatBar((prevState) => !prevState);
  };

  useEffect(() => {
    const initialize = async () => {
      socketRef.current = await initSocket(); // Initialize the socket connection

      // Handle socket connection errors
      const handleError = (err) => {
        console.error("Socket error", err);
        toast.error("Connection failed, redirecting..");
        reactNavigator("/");
      };

      socketRef.current.on("connect_error", (err) => handleError(err));
      socketRef.current.on("connect_failed", (err) => handleError(err));

      // Emit the join event to join the room
      socketRef.current.emit(Actions.JOIN, {
        id,
        userName: location.state?.userName,
      });

      // Listen for the joined socket event
      socketRef?.current.on(
        Actions.JOINED,
        ({ allClients, userName, userSocketId }) => {
          // Check if the joined user is not the current user
          if (userName !== location.state?.userName) {
            toast.success(`${userName} joined the room!`);
          }
          setClients(allClients); // Update the clients state with all connected clients
          socketRef.current.emit(Actions.SYNC_CODE, {
            text: syncCodeRef.current,
            userSocketId,
          });
        }
      );

      // Listen for the disconnection event
      socketRef?.current.on(Actions.DISCONNECTED, ({ userName, socketId }) => {
        // Check if the disconnected user is the current user
        toast(`${userName} left the room`, {
          icon: "💀",
        });
        setClients((prev) => {
          return prev.filter((client) => client.userSocketId !== socketId);
        });
      });
    };

    initialize();

    return () => {
      socketRef.current.disconnect(); // Disconnect the socket connection
      // Unsubscribe from socket io events
      socketRef.current.off(Actions.JOINED);
      socketRef.current.off(Actions.DISCONNECTED);
    };
  }, []);

  const handletextChange = (text) => {
    syncCodeRef.current = text;
  };

  // Check if the location state is not available, then redirect to the home page
  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full relative overflow-x-hidden">
      <EditorAside clients={clients} id={id} />
      <div className="flex flex-grow">
        <MainEditor
          socketRef={socketRef}
          id={id}
          textChange={handletextChange}
          clients={clients}
        />
        {showChatBar && (
          <ResizableBox
            width={300}
            height={Infinity}
            axis="x"
            minConstraints={[100, Infinity]}
            maxConstraints={[300, Infinity]}
            resizeHandles={["w"]}
          >
            <ChatBar
              socketRef={socketRef}
              id={id}
              userName={location.state?.userName}
            />
          </ResizableBox>
        )}
        <button
          className="absolute top-2 right-2 px-4 py-2 bg-slate-800 text-white rounded-lg"
          onClick={toggleChatBar}
        >
          {showChatBar ? "Hide Chat" : "Show Chat"}
        </button>
      </div>
    </div>
  );
};

export default EditorPage;
