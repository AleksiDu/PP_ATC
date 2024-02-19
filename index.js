import * as fs from "fs";
import extractPartName from "./Utils/extractPartName.js";
import extractProjectName from "./Utils/extractProjectName.js";

function catiaAptToGCode(lines) {
  let gCode = "";
  let lineNumber = 1;
  for (let line of lines) {
    if (line.startsWith("PPRINT") || line.startsWith("TPRINT/")) {
      gCode += `; ${line.substring(6)}\n`;
      console.log(line.substring(6));
    } else if (line.startsWith("LOADTL/")) {
      const params = line.split("/")[1].split(",");
      gCode += `N${lineNumber++} T${
        params[0]
      }\nN${lineNumber++} M6\nN${lineNumber++} D1\n`;
    } else if (line.startsWith("GOTO")) {
      let parts = line.split("/");
      let coordinates = parts[1].split(",");
      let [x, y, z] = coordinates.slice(1, 4);
      gCode += `N${lineNumber++} G0 X${x} Y${y} Z${z}\n`;
    } else if (line.startsWith("PROBE/POINTS")) {
      let parts = line.split(",");
      gCode += `N${lineNumber++} G38.2 Z-${parts[5]} F${parts[3]}\n`;
      gCode += `N${lineNumber++} G10 L20 P1 Z0.000\n`;
    } else if (line.startsWith("PROBE/OFF")) {
      gCode += `N${lineNumber++} G0 Z50.000\n`;
    } else if (line.startsWith("RAPID")) {
      // Do nothing, already handled in GOTO
    }
  }
  return gCode;
}

function main() {
  const inputFile = "./Input/PROBE_A.aptsource";
  const outputFile = "./Output/PROBE_A.MPF";

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
