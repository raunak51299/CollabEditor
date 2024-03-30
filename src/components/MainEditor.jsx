import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/yonce.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/xml/xml";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import Actions from "../EventActions";
import Interpreter from "js-interpreter";

const MainEditor = ({ socketRef, id, textChange, clients }) => {
  const editorRef = useRef(null);
  const cursorsRef = useRef({});
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  // Initialize the code editor
  async function init() {
    editorRef.current = Codemirror.fromTextArea(
      document.getElementById("realEditor"),
      {
        mode: language,
        theme: "yonce",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );
  }

  const runCode = () => {
    const userCode = editorRef.current.getValue();
    const myInterpreter = new Interpreter(userCode, (interpreter, globalObject) => {
      const consoleLogWrapper = (text) => {
        output += text + "\n";
      };
      const consoleErrorWrapper = (error) => {
        output += "Error: " + error + "\n";
      };
      interpreter.setProperty(globalObject, "console", interpreter.nativeToPseudo({ log: consoleLogWrapper, error: consoleErrorWrapper }));
    });
    let output = "";
    try {
      myInterpreter.run();
      if (myInterpreter.value) {
        output = myInterpreter.value.toString();
      }
    } catch (error) {
      output = "Error: " + error.message;
    }
    setOutput(output);
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    editorRef.current.setOption("mode", selectedLanguage);

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
  };

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

        cursorsRef.current[clientId] = editorRef.current.setBookmark(cursor, {
          widget: cursorElement,
        });
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
      <div className="flex items-center mb-2 absolute z-10 rounded-lg" style={{ right: "50%" }}>
        <select
          id="language"
          value={language}
          onChange={handleLanguageChange}
          className="px-2 py-1 rounded dropdown-button-size bg-gray-400 m-0.5 rounded-lg"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="xml">HTML</option>
        </select>
      </div>
      <textarea className="w-full h-full" id="realEditor"></textarea>
        <button className="absolute bottom-2 right-1/4 px-4 py-2 bg-blue-800 text-white rounded z-10 rounded-lg" onClick={runCode}>
        Run
        </button>
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-5 border-gray-300 bg-gray-400 rounded-lg">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </>
  );
};

export default MainEditor;
