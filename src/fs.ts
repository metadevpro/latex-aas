import * as path from "node:path";

/** Create temp dir */
export const createTempDir = async (): Promise<string> => {
  return await Deno.makeTempDir();
};

/** Delete directory */
export const deleteDirectory = async (directory: string): Promise<void> => {
  await Deno.remove(directory, { recursive: true });
};

export const deleteFolderOlderThan = async (
  days: number,
  dir: string
): Promise<string | undefined> => {
  const folder = await findFolderOlderThan(days, dir);
  if (folder) {
    console.log("Deleting   ", folder);
    deleteDirectory(folder);
    return folder;
  }
  return undefined;
};

export const findFolderOlderThan = async (
  days: number,
  dir: string
): Promise<string | undefined> => {
  // <days> ago
  const limit = new Date(new Date().setDate(new Date().getDate() - days));
  // const limit = new Date();  // <- no history

  for await (const dirEntry of Deno.readDir(dir)) {
    if (dirEntry.isDirectory) {
      const fullPath = path.join(dir, dirEntry.name);

      const stat = await Deno.stat(fullPath);
      if (stat.mtime && stat.mtime < limit) {
        return fullPath;
      }
    }
  }
  return undefined;
};
