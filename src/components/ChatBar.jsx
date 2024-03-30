import React, { useState, useEffect, useRef } from "react";
import Actions from "../EventActions";

const ChatBar = ({ socketRef, id, userName }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(Actions.CHAT_MESSAGE, ({ message, userName }) => {
        setMessages((prevMessages) => [...prevMessages, { message, userName }]);
      });
    }

    return () => {
      socketRef.current.off(Actions.CHAT_MESSAGE);
    };
  }, [socketRef.current]);

  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      socketRef.current.emit(Actions.CHAT_MESSAGE, { id, message, userName });
      setMessage("");
    }
  };

  const handleLinks = (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
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
      <div className="flex flex-col h-full bg-gray-500 p-4">
      <div className="flex-grow overflow-y-auto " ref={chatRef}>
        {messages.map(({ message, userName }, index) => (
          <div key={index} className="mb-2">
            <strong>{userName}:</strong> {handleLinks(message)}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-grow px-2 py-1 border border-gray-300 rounded-lg"
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
          className="ml-2 px-4 py-1 bg-green-500 text-white rounded-lg"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBar;