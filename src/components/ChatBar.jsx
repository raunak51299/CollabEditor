import React, { useState, useEffect, useRef } from "react";
import Actions from "../EventActions";

const ChatBar = ({ socketRef, id, userName }) => {
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [message, setMessage] = useState(""); // State to store the current message being typed
  const chatRef = useRef(null); // Reference to the chat container element

  useEffect(() => {
    if (socketRef.current) {
      // Event listener for receiving chat messages
      socketRef.current.on(Actions.CHAT_MESSAGE, ({ message, userName }) => {
        setMessages((prevMessages) => [...prevMessages, { message, userName }]);
      });
    }

    return () => {
      // Cleanup function to remove the event listener when component unmounts
      socketRef.current.off(Actions.CHAT_MESSAGE);
    };
  }, [socketRef.current]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      // Emit a chat message event to the server
      socketRef.current.emit(Actions.CHAT_MESSAGE, { id, message, userName });
      setMessage("");
    }
  };

  const handleLinks = (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        // Render links as underlined anchor tags
        return (
          <u>
            <a key={index} href={part} target="_blank" rel="noreferrer" className="text-cyan-500">
              {part}
            </a>
          </u>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full w-1/4 bg-gray-500 p-4">
      <div className="flex-grow overflow-y-auto" ref={chatRef}>
        {/* Render chat messages */}
        {messages.map(({ message, userName }, index) => (
          <div key={index} className="mb-2">
            <strong>{userName}:</strong> {handleLinks(message)}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-grow px-2 py-1 border border-gray-300 rounded"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button
          className="ml-2 px-4 py-1 bg-green-500 text-white rounded"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBar;