import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/yonce.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import Actions from "../EventActions";

const MainEditor = ({ socketRef, id, textChange, clients }) => {
  const editorRef = useRef(null);
  const cursorsRef = useRef({});

  // Initialize the code editor
  async function init() {
    editorRef.current = Codemirror.fromTextArea(
      document.getElementById("realEditor"),
      {
        mode: { name: "javascript", json: true },
        theme: "yonce",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );

    editorRef.current.on("change", (instance, changes) => {
      const { origin } = changes;
      const text = instance.getValue();
      textChange(text);

      if (origin !== "setValue") {
        socketRef.current.emit(Actions.CODE_CHANGE, {
          id,
          text,
        });
      }
    });

    editorRef.current.on("cursorActivity", () => {
      const cursor = editorRef.current.getCursor();
      socketRef.current.emit(Actions.CURSOR_MOVE, {
        id,
        cursor,
      });
    });
  }

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(Actions.CODE_CHANGE, ({ text }) => {
        if (text !== null) {
          editorRef.current.setValue(text);
        }
      });

      socketRef.current.on(Actions.CURSOR_MOVE, ({ clientId, cursor }) => {
        if (cursorsRef.current[clientId]) {
          cursorsRef.current[clientId].clear();
        }

        const client = clients.find((c) => c.userSocketId === clientId);
        const cursorColor = "#00FFFF";

        const cursorElement = document.createElement("span");
        cursorElement.style.borderLeft = "2px solid";
        cursorElement.style.borderLeftColor = cursorColor;
        cursorElement.style.height = `${editorRef.current.defaultTextHeight()}px`;
        cursorElement.style.padding = "0";
        cursorElement.style.zIndex = "1";
        cursorElement.style.animation = "blinker 1s ease-in-out infinite";


        cursorsRef.current[clientId] = editorRef.current.setBookmark(
          cursor,
          { widget: cursorElement }
        );
      });
    }

    return () => {
      socketRef.current.off(Actions.CODE_CHANGE);
      socketRef.current.off(Actions.CURSOR_MOVE);
    };
  }, [socketRef.current, clients]);

  useEffect(() => {
    async function initialize() {
      await init();
    }
    initialize();
  }, []);

  return (
    <>
      <textarea className="w-full h-full" id="realEditor"></textarea>
    </>
  );
};

export default MainEditor;