import * as fs from "fs";
import extractPartName from "./Utils/extractPartName.js";
import extractProjectName from "./Utils/extractProjectName.js";

const inputFile = "./Input/477Z3202_202_PROB_B.aptsource";
const outputFile = "./Output/477Z3202_202_BROB_B.MPF";

function catiaAptToGCode(lines) {
  let gCode = "";
  let lineNumber = 1;
  let isProbeSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    if (line.startsWith("PPRINT") || line.startsWith("TPRINT/")) {
      gCode += `; ${line.substring(6)}\n`;
    } else if (line.startsWith("$$ OPERATION NAME")) {
      let parts = line.split(":");
      gCode += `;  Operation: ${parts[1]}\nN${lineNumber++} G54\n`;
    } else if (line.startsWith("LOADTL/")) {
      const params = line.split("/")[1].split(",");
      gCode += `N${lineNumber++} T${
        params[0]
      }\nN${lineNumber++} M6\nN${lineNumber++} D1\nN${lineNumber++} UP_Z\n`;
    } else if (line.startsWith("RAPID") && nextLine?.startsWith("GOTO")) {
      let parts = nextLine.split("/");
      let coordinates = parts[1].split(",");
      let [x, y, z] = coordinates.slice(0, 3);
      gCode += `N${lineNumber++} G0 X${Math.round(x * 1000) / 1000} Y${
        Math.round(y * 1000) / 1000
      } Z${Math.round(z * 1000) / 1000}\n`;
    } else if (line.startsWith("FEDRAT") && nextLine?.startsWith("GOTO")) {
      let parts = nextLine.split("/");
      let feed = line.split("/");
      let feedValue = feed[1].split(",");
      let coordinates = parts[1].split(",");
      let [x, y, z] = coordinates.slice(0, 3);
      gCode += `N${lineNumber++} G1 X${Math.round(x * 1000) / 1000} Y${
        Math.round(y * 1000) / 1000
      } Z${Math.round(z * 1000) / 1000} F${
        Math.round(feedValue[0] * 1000) / 1000
      }\n`;
    } else if (line.startsWith("PROBE/POINTS")) {
      isProbeSection = true;
    } else if (line.startsWith("PROBE/OFF")) {
      isProbeSection = false;
    } else if (isProbeSection && line.startsWith("GOTO")) {
      const gotoCoords = line.split("/ ")[1];
      const arrOfCoords = gotoCoords.split(",");
      const [x, y, z, dirX, dirY, dirZ] = arrOfCoords;
      if (dirZ == 1) {
        gCode += `N${lineNumber++} CYCLE978(0,1,,1,${
          Math.round(z * 1000) / 1000
        },100,100,3,2,1,"",,0,1.01,-1.01,,0.34,1,0,,1,0)\n`;
      } else if (dirZ == -1) {
        console.log("WRONG DIRECTION");
      } else if (dirX == 1) {
        gCode += `N${lineNumber++} CYCLE978(0,1,,1,${
          Math.round(x * 1000) / 1000
        },100,100,1,2,1,"",,0,1.01,-1.01,,0.34,1,0,,1,0)\n`;
      } else if (dirX == -1) {
        gCode += `N${lineNumber++} CYCLE978(0,1,,1,${
          Math.round(x * 1000) / 1000
        },100,100,1,1,1,"",,0,1.01,-1.01,,0.34,1,0,,1,0)\n`;
      } else if (dirY == 1) {
        gCode += `N${lineNumber++} CYCLE978(0,1,,1,${
          Math.round(y * 1000) / 1000
        },100,100,2,2,1,"",,0,1.01,-1.01,,0.34,1,0,,1,0)\n`;
      } else if (dirY == -1) {
        gCode += `N${lineNumber++} CYCLE978(0,1,,1,${
          Math.round(y * 1000) / 1000
        },100,100,2,1,1,"",,0,1.01,-1.01,,0.34,1,0,,1,0)\n`;
      }
    } else if (line.startsWith("INSERT")) {
      let parts = line.split("INSERT");
      const insertText = parts[1];
      gCode += `N${lineNumber++}${insertText}`;
    } else if (line === "END\r") {
      gCode += `N${lineNumber++} CYCLE800()\nN${lineNumber++} UP_Z\nN${lineNumber++} TIME\nN${lineNumber++} M1=330\nN${lineNumber++} M30\n`;
    }
  }
  return gCode;
}

function main() {
  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading input file:", err);
      return;
    }

    const lines = data.split("\n");
    const projectName = extractProjectName(lines);
    const partName = extractPartName(lines);

    const headerInfo = [
      `; ( PROJECT  : ${projectName} )`,
      `; ( PART NAME: ${partName})`,
      "; ( DRW.   NO: 0 )",
      "; ( OPERATION: 1 )",
      "; ( DRW.REV  : Rev01 )",
      "; ( PREPARED BY: AD )",
      `; (DATE : ${new Date().toLocaleString()} )`,
      "; ( -------- LIST OF TOOLS ---------- )",
      "; N3 T98_RENISHAW",
      "; ( --------------------------------- )",
      "VERIFY",
      "",
    ].join("\n");

    const gCode = catiaAptToGCode(lines);

    const finalGCode = headerInfo + gCode;

    fs.writeFile(outputFile, finalGCode, (err) => {
      if (err) {
        console.error("Error writing output file:", err);
        return;
      }
      console.log("G-code generated successfully!");
    });
  });
}

main();
