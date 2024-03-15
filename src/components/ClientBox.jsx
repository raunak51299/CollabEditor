import React from "react";
import Avatar from "react-avatar";

const ClientBox = ({ username }) => {
  const colorArr = ["#F9C535", "#A0C06B", "#D81088", "#8e5767", "#F9A826"];
  const randomColor = colorArr[Math.floor(Math.random() * colorArr.length)];
  return (
    <div className="flex flex-col space-y-2 items-center">
      <Avatar
        name={username}
        color={`${randomColor}`}
        size={50}
        round="2px"
        fgColor="black"
      />
      <h2 className="text-md font-josefin text-green-100 ">{`${
        username.split(" ")[0]
      } ${username.split(" ")[1]?.charAt(0) || ""}`}</h2>
    </div>
  );
};

export default ClientBox;
