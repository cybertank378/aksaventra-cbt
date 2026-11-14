export class RouteParamHelper {
  public static async getParam<
    T extends Record<string, string | string[] | undefined>,
  >(paramsPromise: Promise<T>, key: keyof T): Promise<string> {
    const params = await paramsPromise;
    const value = params[key];
    if (value === undefined || Array.isArray(value)) {
      throw new Error(`Missing or invalid route parameter: ${String(key)}`);
    }
    return value;
  }

  public static async getParams<
    T extends Record<string, string | string[] | undefined>,
  >(paramsPromise: Promise<T>): Promise<T> {
    return await paramsPromise;
  }
}
