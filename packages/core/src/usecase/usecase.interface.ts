/**
 * UseCase interface defines the contract for all business operations
 *
 * @template Input - The input type for the use case
 * @template Output - The output/success type for the use case
 * @template Failure - The failure/error type for the use case (optional)
 */
export interface UseCase<Input = unknown, Output = unknown, Failure = Error> {
  /**
   * Execute the use case with the given input
   *
   * @param input - The input data for the use case
   * @returns A promise that resolves to the result (success or failure)
   */
  execute(input: Input): Promise<Output>;
}
