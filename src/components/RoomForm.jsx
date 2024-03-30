import React, { useState } from "react"; // Importing React and useState hook from the react package
import { v4 as uuidv4 } from "uuid"; // Importing the v4 function from the uuid package
import { toast } from "react-hot-toast"; // Importing the toast function from the react-hot-toast package
import { useNavigate } from "react-router-dom"; // Importing the useNavigate hook from the react-router-dom package

const RoomForm = () => {
  // Defining state variables
  const [userName, setUserName] = useState(""); // Declaring a state variable userName and a function setUserName to update it
  const [roomID, setRoomId] = useState(""); // Declaring a state variable roomID and a function setRoomId to update it
  const navigate = useNavigate(); // Assigning the useNavigate hook to the navigate variable

  const createRoom = (event) => {
    event.preventDefault(); // Preventing the default behavior of the event
    const newRoom = uuidv4(); // Generating a new room ID using the uuidv4 function
    setRoomId(newRoom); // Updating the roomID state variable with the new room ID
    toast.success("New room ID generated"); // Displaying a success toast message
  };

  const handleJoin = () => {
    if (!roomID || !userName) { // Checking if roomID or userName is empty
      toast.error("Room ID and UserName needed"); // Displaying an error toast message
      return; // Exiting the function
    }

    // Implementing navigation
    navigate(`/editor/${roomID}`, { // Navigating to the specified URL with roomID as a parameter
      state: {
        userName, // Passing the userName as a state parameter
      },
    });
  };

  const handleEnter = (event) => {
    if (event.code == "Enter") { // Checking if the key code of the event is "Enter"
      handleJoin(); // Calling the handleJoin function
    }
  };

  // Rendering the component
  return (
    <div className="px-8 py-4 flex flex-col space-y-4 bg-slate-900 text-white w-10/12 md:1/2 lg:w-1/3  transition-all duration-200 rounded-lg">
      <div
        className="w-full flex justify-start space-x-2 items-center"
        id="logo-box"
      >
        <h1 className="text-4xl font-semibold text-white font-josefin mt-2">
          Collab Editor
        </h1>
      </div>
      <div className="flex flex-col space-y-4 w-full">
        <input
          type="text"
          placeholder="Room Id"
          name="roomId"
          className="px-3 md:px-6 py-2 rounded-md shadow-sm font-josefin text-black hover:outline-none hover:ring-2 ring-green-300 active:outline-none active:ring-2 focus:outline-none focus:ring-2 text-md md:text-lg"
          value={roomID}
          onChange={(event) => {
            const value = event.target.value;
            setRoomId(value);
          }}
          onKeyDown={handleEnter}
        />
        <input
          type="text"
          placeholder="User Name"
          name="username"
          className="px-3 md:px-6 py-2 rounded-md shadow-sm font-josefin text-black hover:outline-none hover:ring-2 ring-green-300 active:outline-none active:ring-2 focus:outline-none focus:ring-2 text-md md:text-lg"
          value={userName}
          onChange={(event) => {
            const value = event.target.value;
            setUserName(value);
          }}
          onKeyDown={handleEnter}
        />
      </div>
      <div className="w-full text-right">
        <button
          className="w-1/3 px-4 py-2 bg-teal-600 rounded-md shadow-md font-josefin hover:bg-teal-500 font-semibold"
          onClick={handleJoin}
        >
          {" "}
          Join
        </button>
      </div>
      <p className="font-josefin text-sm md:text-lg text-center md:text-right">
        Don't have a room id?{" "}
        <span
          className="text-teal-400 underline underline-offset-2 cursor-pointer text-md md:text-lg"
          onClick={createRoom}
        >
          Create Room
        </span>
      </p>
    </div>
  );
};

export default RoomForm; // Exporting the RoomForm component as the default export
