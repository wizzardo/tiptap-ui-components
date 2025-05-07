import path from "path"
import { addOptionsSchema } from "@/src/commands/add"
import * as ERRORS from "@/src/utils/errors"
import { getConfig } from "@/src/utils/get-config"
import { logger } from "@/src/utils/logger"
import fs from "fs-extra"
import { z } from "zod"
import { colors } from "@/src/utils/colors"

export async function preFlightAdd(options: z.infer<typeof addOptionsSchema>) {
  const errors: Record<string, boolean> = {}

  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return {
      errors,
      config: null,
    }
  }

  try {
    const config = await getConfig(options.cwd)

    return {
      errors,
      config: config!,
    }
  } catch (error) {
    console.log("[preFlightAdd] - ", error)

    logger.break()
    logger.error(
      `Make sure you are in a valid project directory. Run ${colors.cyan(
        "npx @tiptap/cli init"
      )} to create a new project.`
    )
    logger.break()
    process.exit(0)
  }
}
