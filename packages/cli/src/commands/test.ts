import { Command } from "commander"
import { spinner } from "@/src/utils/spinner"
import { colors } from "../utils/colors"

export const test = new Command()
  .name("test")
  .description("test command")
  .action(async () => {
    const xSpinner = spinner("Testing...").start()

    // Simulate a long-running task
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Simulate a successful task

    xSpinner.stopAndPersist({
      symbol: colors.cyan("✔"),
      text: "Test complete",
    })
  })
