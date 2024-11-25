/** Create temp dir */
export const createTempDir = async (): Promise<string> => {
  return await Deno.makeTempDir();
};

/** Delete directory */
export const deleteDirectory = async (directory: string): Promise<void> => {
  await Deno.remove(directory, { recursive: true });
};
