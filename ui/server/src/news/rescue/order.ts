/** One explicit ordering seam shared by the scheduler and standalone runner. The second look cannot
 * start until the complete normal Ideas promise has settled successfully. */
export async function runNormalIdeasThenSecondLook<TIdea, TSecondLook>(deps: {
  ideas: () => Promise<TIdea>
  secondLook: () => Promise<TSecondLook>
}): Promise<{ ideaPass: TIdea; secondLook: TSecondLook }> {
  const ideaPass = await deps.ideas()
  const secondLook = await deps.secondLook()
  return { ideaPass, secondLook }
}
