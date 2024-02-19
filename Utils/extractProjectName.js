const extractProjectName = (lines) => {
  let projectName = "";
  for (const element of lines) {
    if (element.startsWith("$$ PROGRAM/")) {
      const parts = element.split("/");
      if (parts.length > 1) {
        projectName = parts[1].trim();
      }
      break;
    }
  }
  return projectName;
};

export default extractProjectName;
