import {
  Functions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions"
import { useCallback, useState } from "react"

/**
 * Result of the useHttpsCallable hook.
 *
 * @property callCallable - Function to invoke the Cloud Function. Takes optional request data and returns a promise that resolves to the Cloud Function's result or `undefined` if an error occurs.
 * @property loading - Boolean indicating whether the Cloud Function call is in progress.
 * @property error - An `Error` object if an error occurred during the Cloud Function call, or `undefined` if no error occurred.
 */
type HttpsCallableHook<
  RequestData = unknown,
  ResponseData = unknown
> = Readonly<
  [
    (
      data?: RequestData
    ) => Promise<HttpsCallableResult<ResponseData> | undefined>,
    boolean,
    Error | undefined
  ]
>

/**
 * Custom hook for calling Firebase Cloud Functions.
 *
 * This hook provides a function to invoke a Firebase Cloud Function and manages
 * the loading and error states associated with the request.
 *
 * @param functions - The Firebase `Functions` instance used to call the Cloud Function.
 * @param name - The name of the Cloud Function to be invoked.
 *
 * @returns An array with three elements:
 * - `callCallable`: A function that takes optional request data and returns a promise that resolves to the Cloud Function's result or `undefined` if an error occurs.
 * - `loading`: A boolean indicating whether the Cloud Function call is in progress.
 * - `error`: An `Error` object if an error occurred during the Cloud Function call, or `undefined` if no error occurred.
 *
 * @template RequestData - The type of data to be sent with the request (default: `unknown`).
 * @template ResponseData - The type of data expected in the response (default: `unknown`).
 *
 * Example usage:
 * ```typescript
 * const [callFunction, loading, error] = useHttpsCallcable<MyRequest, MyResponse>(functions, 'myFunctionName');
 *
 * const handleCall = async () => {
 *   const result = await callFunction({ myData: 'value' });
 *   if (result) {
 *     console.log(result.data);
 *   }
 * };
 * ```
 */
const useHttpsCallcable = <RequestData = unknown, ResponseData = unknown>(
  functions: Functions,
  name: string
): HttpsCallableHook<RequestData, ResponseData> => {
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  const callCallable = useCallback(
    async (
      data?: RequestData
    ): Promise<HttpsCallableResult<ResponseData> | undefined> => {
      const callable = httpsCallable<RequestData, ResponseData>(functions, name)
      setLoading(true)
      setError(undefined)
      try {
        return await callable(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    [functions, name]
  )

  return [callCallable, loading, error] as const
}

export default useHttpsCallcable
