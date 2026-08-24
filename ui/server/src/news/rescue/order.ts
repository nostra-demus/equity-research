/** One explicit ordering seam shared by the scheduler and standalone runner. The second look cannot
 * start until the complete normal Ideas promise has settled successfully. */
export async function runNormalIdeasThenSecondLook<TIdea extends { coverage_complete?: boolean }, TSecondLook>(deps: {
  ideas: () => Promise<TIdea>
  secondLook: () => Promise<TSecondLook>
  onSecondLookBlocked?: (ideaPass: TIdea) => Promise<TSecondLook>
}): Promise<{ ideaPass: TIdea; secondLook: TSecondLook | null }> {
  const ideaPass = await deps.ideas()
  const secondLook = ideaPass.coverage_complete === true
    ? await deps.secondLook()
    : deps.onSecondLookBlocked
      ? await deps.onSecondLookBlocked(ideaPass)
      : null
  return { ideaPass, secondLook }
}
