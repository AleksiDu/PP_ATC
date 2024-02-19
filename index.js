import * as fs from "fs";
import extractPartName from "./Utils/extractPartName.js";
import extractProjectName from "./Utils/extractProjectName.js";

function parseProbePoints(lines) {
  let gcode = "";
  let lineNumber = 1;
  for (let line of lines) {
    if (line.startsWith("GOTO")) {
      let parts = line.split("/");
      let coordinates = parts[1].split(",");
      let [x, y, z] = coordinates.slice(1, 4);
      gcode += `N${lineNumber++} G0 X${x} Y${y} Z${z}\n`;
    } else if (line.startsWith("PROBE/POINTS")) {
      let parts = line.split(",");
      gcode += `N${lineNumber++} G38.2 Z-${parts[5]} F${parts[3]}\n`;
      gcode += `N${lineNumber++} G10 L20 P1 Z0.000\n`;
    } else if (line.startsWith("PROBE/OFF")) {
      gcode += `N${lineNumber++} G0 Z50.000\n`;
    } else if (line.startsWith("RAPID")) {
      // Do nothing, already handled in GOTO
    }
  }
  return gcode;
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
      "N3 T98_RENISHAW",
      "; ( --------------------------------- )",
      "VERIFY",
      "",
    ].join("\n");

    const gcode = parseProbePoints(lines);

    const finalGcode = headerInfo + gcode;

    fs.writeFile(outputFile, finalGcode, (err) => {
      if (err) {
        console.error("Error writing output file:", err);
        return;
      }
      console.log("G-code generated successfully!");
    });
  });
}

main();
